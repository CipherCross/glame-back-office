import {REPORTS} from 'common/constants/reporting';
import {reportTitle, t} from 'lib/i18n';
import type {ReportKind} from 'common/types';
import type {SharedLayoutProps} from "common/interfaces/layouts";


export default function SharedLayout({
  session,
  locale,
  activeReport,
  onReportChange,
  onOpenAccountSettings,
  onSignOut,
  children
}: SharedLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <img src="/logo.svg" alt="Glame" />
          </div>
          <p className="workspace">{t(locale, 'backOffice')}</p>
          <nav aria-label={t(locale, 'results')}>
            {(Object.keys(REPORTS) as ReportKind[]).map((key) => (
              <button key={key} className={`nav-item ${activeReport === key ? 'active' : ''}`} onClick={() => onReportChange(key)}>
                <span>{key === 'transactions' ? '▦' : '↗'}</span>
                {reportTitle(locale, key)}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span>{session.name}</span>
            <button className="account-button" onClick={onOpenAccountSettings}>
              {t(locale, 'account')}
            </button>
          </div>
          <div className="sidebar-sign-out">
            <button onClick={onSignOut}>{t(locale, 'signOut')}</button>
          </div>
        </div>
      </aside>
      {children}
    </div>
  );
}
