import {type ChangeEvent, useState} from "react";
import LanguageSwitch from "components/LanguageSwitch";
import {t} from "lib/i18n";
import type {LoginProps} from "common/interfaces/Login";


export default function Login({ onLogin, loading, error, locale, onLocaleChange }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin(email.trim(), password);
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-language"><LanguageSwitch locale={locale} onChange={onLocaleChange} label={t(locale, "language")} /></div>
        <img className="login-logo" src="/logo.svg" alt="Glame" />
        <p className="eyebrow">GLAME · PARIS</p>
        <h1 id="login-title">Back Office</h1>
        <p className="muted">{t(locale, "loginDescription")}</p>
        <form onSubmit={submit} className="login-form">
          <label>{t(locale, "email")}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>{t(locale, "password")}<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" disabled={loading}>{loading ? t(locale, "signingIn") : t(locale, "signIn")}</button>
        </form>
      </section>
    </main>
  );
}
