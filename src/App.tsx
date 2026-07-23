import {useEffect, useState} from "react";
import AccountSettings from "components/AccountSettings";
import Login from "components/Login";
import PayoutsPage from "pages/PayoutsPage";
import TransactionsPage from "pages/TransactionsPage";
import {ApiError, getArtists, getCurrentAdmin, login, logout, refreshAdminSession} from "lib/api";
import {defaultReportState, persistReportState, restoreReportState} from "lib/report-cache";
import {LOCALE_STORAGE_KEY, reportTitle, t} from "lib/i18n";
import {REPORTS} from "common/constants/reporting";
import {REFRESH_TOKEN_STORAGE_KEY, STORAGE_KEY} from "common/constants";
import type {Artist, AuthResponse, ReportKind, ReportView} from "common/types";
import type {AdminSession, Locale} from "common/types/AccountSettings";

function logStorageError(operation: string, error: unknown): void {
  const details = error instanceof Error ? error.message : String(error);
  console.error(`Unable to ${operation}.`, details);
}

function clearLegacySession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error: unknown) {
    logStorageError("clear the legacy session", error);
  }
}

function readRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistRefreshToken(refreshToken: string | null): void {
  try {
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    else sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error: unknown) {
    logStorageError("persist the refresh token", error);
  }
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
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const kind = reportState.activeKind;

  function updateView(reportKind: ReportKind, changes: Partial<ReportView>): void {
    setReportState((current) => ({
      ...current,
      views: {
        ...current.views,
        [reportKind]: {...current.views[reportKind], ...changes},
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
    setSession((current) => current ? {...current, email} : current);
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
  }, [session?.refreshToken, session?.expiresAt]);

  useEffect(() => {
    if (session?.email) persistReportState(session.email, reportState);
  }, [session?.email, reportState]);

  useEffect(() => {
    if (!session) return;
    void getCurrentAdmin(session.accessToken).then((data) => {
      const name = data.user?.full_name?.trim() || data.user?.email || session.email;
      const email = data.user?.email || session.email;
      if (name === session.name && email === session.email) return;
      setSession({...session, name, email});
    }).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) signOut(false);
    });
    void getArtists(session.accessToken).then((data) => setArtists(data.artists ?? [])).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) signOut(false);
    });
  }, [session]);

  function switchReport(nextKind: ReportKind): void {
    setReportState((current) => ({...current, activeKind: nextKind}));
  }

  if (restoringSession) return <main className="session-restoring" aria-busy="true" aria-label="Restoring session"><span /></main>;
  if (!session) return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} locale={locale} onLocaleChange={changeLocale} />;

  const reportPageProps = {
    session,
    locale,
    artists,
    view: reportState.views[kind],
    onViewChange: (changes: Partial<ReportView>) => updateView(kind, changes),
    onUnauthorized: () => signOut(false),
    onLocaleChange: changeLocale,
  };

  return <div className="app-shell">
    <aside className="sidebar"><div><div className="sidebar-brand"><img src="/logo.svg" alt="Glame" /></div><p className="workspace">{t(locale, "backOffice")}</p><nav aria-label={t(locale, "results")}>{(Object.keys(REPORTS) as ReportKind[]).map((key) => <button key={key} className={`nav-item ${kind === key ? "active" : ""}`} onClick={() => switchReport(key)}><span>{key === "transactions" ? "▦" : "↗"}</span>{reportTitle(locale, key)}</button>)}</nav></div><div className="sidebar-user"><span>{session.name}</span><button className="account-button" onClick={() => setAccountSettingsOpen(true)}>{t(locale, "account")}</button><button onClick={() => signOut()}>{t(locale, "signOut")}</button></div></aside>
    {kind === "transactions" ? <TransactionsPage {...reportPageProps} /> : <PayoutsPage {...reportPageProps} />}
    {accountSettingsOpen && <AccountSettings session={session} locale={locale} onClose={() => setAccountSettingsOpen(false)} onEmailChanged={updateSessionEmail} />}
  </div>;
}
