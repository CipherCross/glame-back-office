import {useEffect, useState} from "react";
import Login from "components/Login";
import Filters from "components/Filters";
import ColumnPicker from "components/ColumnPicker";
import ReportTable from "components/ReportTable";
import LanguageSwitch from "components/LanguageSwitch";
import AccountSettings from "components/AccountSettings";
import {
  ApiError,
  exportReport,
  getArtists,
  getCurrentAdmin,
  getReport,
  login,
  logout,
  refreshAdminSession
} from "lib/api";
import {defaultFilters, formatCell, REPORTS} from "lib/reporting";
import {defaultReportState, persistReportState, restoreReportState} from "lib/report-cache";
import {LOCALE_STORAGE_KEY, reportDescription, reportTitle, t} from "lib/i18n";
import type {
  Artist,
  AuthResponse,
  ReportColumn,
  ReportFilters,
  ReportKind,
  ReportResponse,
  ReportView
} from "common/types";
import {PAGE_SIZE, REFRESH_TOKEN_STORAGE_KEY, STORAGE_KEY} from "common/constants";
import type {AdminSession, Locale} from "common/types/AccountSettings";


function clearLegacySession(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be disabled by the browser. */ }
}

function readRefreshToken(): string | null {
  try { return sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY); } catch { return null; }
}

function persistRefreshToken(refreshToken: string | null): void {
  try {
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    else sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch { /* Private browsing or disabled storage: the session stays in memory. */ }
}

function toAdminSession(data: AuthResponse, fallbackEmail = ""): AdminSession {
  const accessToken = data.session?.access_token;
  const refreshToken = data.session?.refresh_token;
  if (!accessToken || !refreshToken) throw new Error("The authentication session is incomplete.");
  return {
    accessToken,
    refreshToken,
    expiresAt: (data.session?.expires_at ?? 0) * 1000,
    email: data.user?.email ?? fallbackEmail,
    name: data.user?.user_metadata?.full_name ?? data.user?.email ?? fallbackEmail,
  };
}

function restoreLocale(): Locale {
  const locale = localStorage.getItem(LOCALE_STORAGE_KEY);
  return locale === "en" || locale === "fr" ? locale : "fr";
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function App() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [locale, setLocale] = useState<Locale>(restoreLocale);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [reportState, setReportState] = useState(defaultReportState);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [report, setReport] = useState<ReportResponse>({ rows: [], total: 0, totals: null });
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [exporting, setExporting] = useState<"" | "csv" | "xlsx">("");
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const { activeKind: kind, views } = reportState;
  const { filters, columns, page } = views[kind];

  function updateView(reportKind: ReportKind, changes: Partial<ReportView>): void {
    setReportState((current) => ({
      ...current,
      views: {
        ...current.views,
        [reportKind]: { ...current.views[reportKind], ...changes },
      },
    }));
  }

  function changeLocale(nextLocale: Locale): void {
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setLocale(nextLocale);
  }

  async function handleLogin(email: string, password: string): Promise<void> {
    setLoginLoading(true);
    setLoginError("");
    try {
      const data = await login(email, password);
      if (data.role !== "admin") throw new Error("This account does not have Back Office access.");
      const nextSession = toAdminSession(data, email);
      persistRefreshToken(nextSession.refreshToken);
      setSession(nextSession);
      setReportState(restoreReportState(nextSession.email));
    } catch (error) {
      setLoginError(errorMessage(error, "Could not sign in."));
    } finally {
      setLoginLoading(false);
    }
  }

  function signOut(revoke = true): void {
    const accessToken = session?.accessToken;
    clearLegacySession();
    persistRefreshToken(null);
    setSession(null);
    setReportState(defaultReportState());
    if (revoke && accessToken) void logout(accessToken).catch(() => undefined);
  }

  function updateSessionEmail(email: string): void {
    setSession((current) => current ? { ...current, email } : current);
  }

  useEffect(() => {
    let active = true;
    clearLegacySession();
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      setRestoringSession(false);
      return () => { active = false; };
    }

    void refreshAdminSession(refreshToken).then((data) => {
      if (!active) return;
      const restoredSession = toAdminSession(data);
      persistRefreshToken(restoredSession.refreshToken);
      setSession(restoredSession);
      setReportState(restoreReportState(restoredSession.email));
    }).catch(() => {
      persistRefreshToken(null);
    }).finally(() => {
      if (active) setRestoringSession(false);
    });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const refreshIn = Math.max(30_000, session.expiresAt - Date.now() - 60_000);
    const timeout = window.setTimeout(() => {
      void refreshAdminSession(session.refreshToken).then((data) => {
        const refreshedSession = toAdminSession(data, session.email);
        persistRefreshToken(refreshedSession.refreshToken);
        setSession(refreshedSession);
      }).catch(() => {
        signOut(false);
      });
    }, refreshIn);
    return () => window.clearTimeout(timeout);
  }, [session?.refreshToken, session?.expiresAt]); // Session values are intentionally the refresh schedule inputs.

  useEffect(() => {
    if (session?.email) persistReportState(session.email, reportState);
  }, [session?.email, reportState]);

  useEffect(() => {
    if (!session) return;
    void getCurrentAdmin(session.accessToken).then((data) => {
      const name = data.user?.full_name?.trim() || data.user?.email || session.email;
      const email = data.user?.email || session.email;
      if (name === session.name && email === session.email) return;
      setSession({ ...session, name, email });
    }).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) signOut(false);
    });
    void getArtists(session.accessToken).then((data) => setArtists(data.artists ?? [])).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) signOut(false);
    });
  }, [session]);

  async function loadReport(nextPage = page, activeFilters = filters, activeColumns = columns): Promise<void> {
    if (!session) return;
    setLoading(true);
    setReportError("");
    try {
      const data = await getReport(session.accessToken, kind, activeFilters, activeColumns, nextPage, PAGE_SIZE);
      setReport(data);
      updateView(kind, { page: nextPage });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) signOut(false);
      else setReportError(errorMessage(error, "Could not load the report."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session) void loadReport(page); }, [session, kind]); // Report reloads only when the authenticated session or report kind changes.

  function switchReport(nextKind: ReportKind): void {
    setReportState((current) => ({ ...current, activeKind: nextKind }));
    setReport({ rows: [], total: 0, totals: null });
  }

  async function handleExport(format: "csv" | "xlsx"): Promise<void> {
    if (!session) return;
    setExporting(format);
    try {
      const blob = await exportReport(session.accessToken, kind, filters, columns, format);
      download(blob, `${kind}-${new Date().toISOString().slice(0, 10)}.${format}`);
    } catch (error) {
      setReportError(errorMessage(error, "Could not create the export."));
    } finally {
      setExporting("");
    }
  }

  if (restoringSession) return <main className="session-restoring" aria-busy="true" aria-label="Restoring session"><span /></main>;
  if (!session) return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} locale={locale} onLocaleChange={changeLocale} />;

  const totals = report.totals ?? {};
  return <div className="app-shell">
    <aside className="sidebar"><div><div className="sidebar-brand"><img src="/logo.svg" alt="Glame" /></div><p className="workspace">{t(locale, "backOffice")}</p><nav aria-label={t(locale, "results")}>{(Object.keys(REPORTS) as ReportKind[]).map((key) => <button key={key} className={`nav-item ${kind === key ? "active" : ""}`} onClick={() => switchReport(key)}><span>{key === "transactions" ? "▦" : "↗"}</span>{reportTitle(locale, key)}</button>)}</nav></div><div className="sidebar-user"><span>{session.name}</span><button className="account-button" onClick={() => setAccountSettingsOpen(true)}>{t(locale, "account")}</button><button onClick={() => signOut()}>{t(locale, "signOut")}</button></div></aside>
    <main className="content"><header className="topbar"><div><p className="eyebrow">{t(locale, "financialReporting")}</p><h1>{reportTitle(locale, kind)}</h1><p className="muted">{reportDescription(locale, kind)}</p></div><div className="export-actions"><LanguageSwitch locale={locale} onChange={changeLocale} label={t(locale, "language")} /><button className="secondary-button" onClick={() => void handleExport("csv")} disabled={Boolean(exporting)}>{exporting === "csv" ? t(locale, "preparing") : t(locale, "exportCsv")}</button><button className="primary-button" onClick={() => void handleExport("xlsx")} disabled={Boolean(exporting)}>{exporting === "xlsx" ? t(locale, "preparing") : t(locale, "exportExcel")}</button></div></header>
      <Filters kind={kind} filters={filters} artists={artists} onChange={(nextFilters: ReportFilters) => updateView(kind, { filters: nextFilters })} onApply={() => void loadReport(0)} onClear={() => { const resetFilters = defaultFilters(kind); updateView(kind, { filters: resetFilters, page: 0 }); void loadReport(0, resetFilters); }} loading={loading} locale={locale} />
      <section className="summary-grid"><article><span>{t(locale, "ht")}</span><strong>{formatCell(locale, "amount_ht_cents", totals["amount_ht_cents"] ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "vat")}</span><strong>{formatCell(locale, "vat_amount_cents", totals["vat_amount_cents"] ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "ttc")}</span><strong>{formatCell(locale, "amount_ttc_cents", totals["amount_ttc_cents"] ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "refunded")}</span><strong>{formatCell(locale, "refunded_amount_cents", totals["refunded_amount_cents"] ?? 0, { currency: "EUR" })}</strong></article></section>
      <section className="report-card"><div className="report-card-head"><div><h2>{t(locale, "results")}</h2><p>{report.total.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} {t(locale, "records")}</p></div><ColumnPicker columns={REPORTS[kind].columns} selected={columns} onChange={(nextColumns: ReportColumn[]) => { updateView(kind, { columns: nextColumns, page: 0 }); void loadReport(0, filters, nextColumns); }} locale={locale} /></div><ReportTable rows={report.rows} columns={columns} loading={loading} error={reportError} page={page} limit={PAGE_SIZE} total={report.total} onPageChange={(nextPage) => void loadReport(nextPage)} locale={locale} /></section>
    </main>
    {accountSettingsOpen && <AccountSettings session={session} locale={locale} onClose={() => setAccountSettingsOpen(false)} onEmailChanged={updateSessionEmail} />}
  </div>;
}
