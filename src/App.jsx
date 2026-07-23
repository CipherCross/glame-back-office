import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import Filters from "./components/Filters.jsx";
import ColumnPicker from "./components/ColumnPicker.jsx";
import ReportTable from "./components/ReportTable.jsx";
import LanguageSwitch from "./components/LanguageSwitch.jsx";
import { ApiError, exportReport, getArtists, getCurrentAdmin, getReport, login } from "./lib/api.js";
import { REPORTS, defaultFilters, formatCell } from "./lib/reporting.js";
import { defaultReportState, persistReportState, restoreReportState } from "./lib/report-cache.js";
import { LOCALE_STORAGE_KEY, reportDescription, reportTitle, t } from "./lib/i18n.js";

const STORAGE_KEY = "glame-admin-session";
const PAGE_SIZE = 10;

function restoreSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { return null; }
}

function restoreLocale() {
  const locale = localStorage.getItem(LOCALE_STORAGE_KEY);
  return locale === "en" || locale === "fr" ? locale : "fr";
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [session, setSession] = useState(restoreSession);
  const [locale, setLocale] = useState(restoreLocale);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [reportState, setReportState] = useState(() => restoreReportState(restoreSession()?.email));
  const [artists, setArtists] = useState([]);
  const [report, setReport] = useState({ rows: [], total: 0, totals: null });
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [exporting, setExporting] = useState("");
  const { activeKind: kind, views } = reportState;
  const { filters, columns, page } = views[kind];

  function updateView(reportKind, changes) {
    setReportState((current) => ({
      ...current,
      views: {
        ...current.views,
        [reportKind]: { ...current.views[reportKind], ...changes },
      },
    }));
  }

  function changeLocale(nextLocale) {
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setLocale(nextLocale);
  }

  async function handleLogin(email, password) {
    setLoginLoading(true); setLoginError("");
    try {
      const data = await login(email, password);
      const accessToken = data.session?.access_token;
      if (data.role !== "admin" || !accessToken) throw new Error("This account does not have Back Office access.");
      const nextSession = { accessToken, email: data.user?.email ?? email, name: data.user?.user_metadata?.full_name ?? data.user?.email ?? email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setReportState(restoreReportState(nextSession.email));
    } catch (error) { setLoginError(error.message ?? "Could not sign in."); }
    finally { setLoginLoading(false); }
  }

  function signOut() { localStorage.removeItem(STORAGE_KEY); setSession(null); setReportState(defaultReportState()); }

  useEffect(() => {
    if (session?.email) persistReportState(session.email, reportState);
  }, [session?.email, reportState]);

  useEffect(() => {
    if (!session) return;
    getCurrentAdmin(session.accessToken).then((data) => {
      const name = data.user?.full_name?.trim() || data.user?.email || session.email;
      const email = data.user?.email || session.email;
      if (name === session.name && email === session.email) return;
      const refreshedSession = { ...session, name, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedSession));
      setSession(refreshedSession);
    }).catch((error) => {
      if (error instanceof ApiError && error.status === 401) signOut();
    });
    getArtists(session.accessToken).then((data) => setArtists(data.artists ?? [])).catch((error) => {
      if (error instanceof ApiError && error.status === 401) signOut();
    });
  }, [session]);

  async function loadReport(nextPage = page, activeFilters = filters, activeColumns = columns) {
    if (!session) return;
    setLoading(true); setReportError("");
    try {
      const data = await getReport(session.accessToken, kind, activeFilters, activeColumns, nextPage, PAGE_SIZE);
      setReport(data); updateView(kind, { page: nextPage });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) signOut();
      else setReportError(error.message ?? "Could not load the report.");
    } finally { setLoading(false); }
  }

  useEffect(() => { if (session) loadReport(page); }, [session, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  function switchReport(nextKind) {
    setReportState((current) => ({ ...current, activeKind: nextKind }));
    setReport({ rows: [], total: 0, totals: null });
  }

  async function handleExport(format) {
    setExporting(format);
    try {
      const blob = await exportReport(session.accessToken, kind, filters, columns, format);
      download(blob, `${kind}-${new Date().toISOString().slice(0, 10)}.${format}`);
    } catch (error) { setReportError(error.message ?? "Could not create the export."); }
    finally { setExporting(""); }
  }

  if (!session) return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} locale={locale} onLocaleChange={changeLocale} />;
  const totals = report.totals ?? {};
  return <div className="app-shell">
    <aside className="sidebar"><div><div className="sidebar-brand"><img src="/logo.svg" alt="Glame" /></div><p className="workspace">{t(locale, "backOffice")}</p><nav aria-label={t(locale, "results")}>{Object.keys(REPORTS).map((key) => <button key={key} className={`nav-item ${kind === key ? "active" : ""}`} onClick={() => switchReport(key)}><span>{key === "transactions" ? "▦" : "↗"}</span>{reportTitle(locale, key)}</button>)}</nav></div><div className="sidebar-user"><span>{session.name}</span><button onClick={signOut}>{t(locale, "signOut")}</button></div></aside>
    <main className="content"><header className="topbar"><div><p className="eyebrow">{t(locale, "financialReporting")}</p><h1>{reportTitle(locale, kind)}</h1><p className="muted">{reportDescription(locale, kind)}</p></div><div className="export-actions"><LanguageSwitch locale={locale} onChange={changeLocale} label={t(locale, "language")} /><button className="secondary-button" onClick={() => handleExport("csv")} disabled={Boolean(exporting)}>{exporting === "csv" ? t(locale, "preparing") : t(locale, "exportCsv")}</button><button className="primary-button" onClick={() => handleExport("xlsx")} disabled={Boolean(exporting)}>{exporting === "xlsx" ? t(locale, "preparing") : t(locale, "exportExcel")}</button></div></header>
      <Filters kind={kind} filters={filters} artists={artists} onChange={(nextFilters) => updateView(kind, { filters: nextFilters })} onApply={() => loadReport(0)} onClear={() => { const resetFilters = defaultFilters(kind); updateView(kind, { filters: resetFilters, page: 0 }); loadReport(0, resetFilters); }} loading={loading} locale={locale} />
      <section className="summary-grid"><article><span>{t(locale, "ht")}</span><strong>{formatCell(locale, "amount_ht_cents", totals.amount_ht_cents ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "vat")}</span><strong>{formatCell(locale, "vat_amount_cents", totals.vat_amount_cents ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "ttc")}</span><strong>{formatCell(locale, "amount_ttc_cents", totals.amount_ttc_cents ?? 0, { currency: "EUR" })}</strong></article><article><span>{t(locale, "refunded")}</span><strong>{formatCell(locale, "refunded_amount_cents", totals.refunded_amount_cents ?? 0, { currency: "EUR" })}</strong></article></section>
      <section className="report-card"><div className="report-card-head"><div><h2>{t(locale, "results")}</h2><p>{report.total.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} {t(locale, "records")}</p></div><ColumnPicker columns={REPORTS[kind].columns} selected={columns} onChange={(nextColumns) => { updateView(kind, { columns: nextColumns, page: 0 }); loadReport(0, filters, nextColumns); }} locale={locale} /></div><ReportTable rows={report.rows} columns={columns} loading={loading} error={reportError} page={page} limit={PAGE_SIZE} total={report.total} onPageChange={loadReport} locale={locale} /></section>
    </main>
  </div>;
}
