import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import AccountSettings from 'components/AccountSettings';
import AccountantLayout from 'layouts/AccountantLayout';
import AdminLayout from 'layouts/AdminLayout';
import Login from 'components/Login';
import NotFound from 'components/NotFound';
import PayoutsPage from 'pages/PayoutsPage';
import Toaster from 'components/Toaster';
import TransactionsPage from 'pages/TransactionsPage';
import { t } from 'lib/i18n';
import { api, useGetArtistsQuery, useGetCurrentUserQuery } from 'store/api';
import { clearSession, refreshSession, restoreSession, signIn, signOutRemote, updateSession } from 'store/auth';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectReportState, switchReport, updateReportView } from 'store/reports';
import { setLocale } from 'store/settings';
import type { ReportKind, ReportView, Toast, ToastType } from 'common/types';

let toastSequence = 0;

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  return typeof error.status === 'number' ? error.status : undefined;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { session, stage, error: authError } = useAppSelector((state) => state.auth);
  const locale = useAppSelector((state) => state.settings.locale);
  const reportState = useAppSelector((state) => selectReportState(state.reports, session?.email));
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [path, setPath] = useState(() => window.location.pathname);
  const [restoringSession, setRestoringSession] = useState(true);
  const [sidebarControls, setSidebarControls] = useState<ReactNode>(null);
  const restoreStarted = useRef(false);
  const kind = reportState.activeKind;
  const artistsQuery = useGetArtistsQuery(undefined, { skip: !session });
  const currentUserQuery = useGetCurrentUserQuery(undefined, { skip: !session });

  const dismissToast = useCallback((id: string): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType): void => {
    const id = `${Date.now()}-${toastSequence++}`;
    setToasts((current) => [...current, { id, message, type }]);
  }, []);

  const signOut = useCallback(
    (revoke = true): void => {
      const accessToken = session?.accessToken;
      if (revoke && accessToken) void dispatch(signOutRemote({ accessToken }));
      dispatch(clearSession());
      dispatch(api.util.resetApiState());
    },
    [dispatch, session?.accessToken]
  );

  function updateView(reportKind: ReportKind, changes: Partial<ReportView>): void {
    if (session) dispatch(updateReportView({ email: session.email, kind: reportKind, changes }));
  }

  const changeLocale = useCallback(
    (nextLocale: typeof locale): void => {
      dispatch(setLocale(nextLocale));
    },
    [dispatch]
  );

  async function handleLogin(email: string, password: string): Promise<void> {
    try {
      await dispatch(signIn({ email, password })).unwrap();
      notify(t(locale, 'signedIn'), 'success');
    } catch (message) {
      notify(typeof message === 'string' ? message : 'Could not sign in.', 'error');
    }
  }

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    void dispatch(restoreSession())
      .unwrap()
      .catch(() => undefined)
      .finally(() => setRestoringSession(false));
  }, [dispatch]);

  useEffect(() => {
    if (!session) return undefined;
    const refreshIn = Math.max(30_000, session.expiresAt - Date.now() - 60_000);
    const timeout = window.setTimeout(() => {
      void dispatch(refreshSession())
        .unwrap()
        .catch(() => signOut(false));
    }, refreshIn);
    return () => window.clearTimeout(timeout);
  }, [dispatch, session?.refreshToken, session?.expiresAt, signOut]);

  useEffect(() => {
    const user = currentUserQuery.data?.user;
    if (!session || !user) return;
    const name = user.full_name?.trim() || user.email || session.email;
    const email = user.email || session.email;
    if (name !== session.name || email !== session.email) dispatch(updateSession({ name, email }));
  }, [currentUserQuery.data, dispatch, session]);

  useEffect(() => {
    if (errorStatus(currentUserQuery.error) === 401 || errorStatus(artistsQuery.error) === 401) signOut(false);
  }, [artistsQuery.error, currentUserQuery.error, signOut]);

  function goHome(): void {
    window.history.pushState({}, '', '/');
    setPath('/');
  }

  if (path !== '/') return <NotFound locale={locale} onLocaleChange={changeLocale} onBackHome={goHome} />;

  if (restoringSession)
    return (
      <>
        <main className="session-restoring" aria-busy="true" aria-label="Restoring session">
          <span />
        </main>
        <Toaster toasts={toasts} locale={locale} onDismiss={dismissToast} />
      </>
    );

  if (!session)
    return (
      <>
        <Login onLogin={handleLogin} loading={stage === 'pending'} error={authError ?? ''} locale={locale} onLocaleChange={changeLocale} />
        <Toaster toasts={toasts} locale={locale} onDismiss={dismissToast} />
      </>
    );

  const reportPageProps = {
    session,
    locale,
    artists: artistsQuery.data?.artists ?? [],
    view: reportState.views[kind],
    onViewChange: (changes: Partial<ReportView>) => updateView(kind, changes),
    onUnauthorized: () => signOut(false),
    onLocaleChange: changeLocale,
    onNotify: notify,
    onSidebarControlsChange: setSidebarControls
  };

  const Layout = session.role === 'admin' ? AdminLayout : AccountantLayout;
  return (
    <>
      <Layout
        session={session}
        locale={locale}
        activeReport={kind}
        onReportChange={(nextKind) => dispatch(switchReport({ email: session.email, kind: nextKind }))}
        onOpenAccountSettings={() => setAccountSettingsOpen(true)}
        onSignOut={() => signOut()}
        sidebarControls={sidebarControls}
      >
        {kind === 'transactions' ? <TransactionsPage {...reportPageProps} /> : <PayoutsPage {...reportPageProps} />}
      </Layout>
      {accountSettingsOpen && (
        <AccountSettings
          session={session}
          locale={locale}
          onClose={() => setAccountSettingsOpen(false)}
          onEmailChanged={(email) => dispatch(updateSession({ email }))}
          onNotify={notify}
        />
      )}
      <Toaster toasts={toasts} locale={locale} onDismiss={dismissToast} />
    </>
  );
}
