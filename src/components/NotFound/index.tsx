import LanguageSwitch from 'components/LanguageSwitch';
import { t } from 'lib/i18n';
import type { Locale } from 'common/types/AccountSettings';

interface NotFoundProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onBackHome: () => void;
}

export default function NotFound({ locale, onLocaleChange, onBackHome }: NotFoundProps) {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <img src="/logo.svg" alt="Glame" />
        <LanguageSwitch locale={locale} onChange={onLocaleChange} label={t(locale, 'language')} />
      </header>
      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <p className="eyebrow">{t(locale, 'pageNotFound')}</p>
        <h1 id="not-found-title">{t(locale, 'notFoundTitle')}</h1>
        <p>{t(locale, 'notFoundDescription')}</p>
        <button className="primary-button" type="button" onClick={onBackHome}>
          {t(locale, 'backHome')}
        </button>
      </section>
    </main>
  );
}
