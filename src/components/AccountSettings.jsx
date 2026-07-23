import { useState } from "react";
import {
  confirmNewEmail,
  sendCurrentEmailCode,
  sendNewEmailCode,
  updatePassword,
  verifyCurrentEmailCode,
  verifyCurrentPassword,
} from "../lib/api.js";
import { t } from "../lib/i18n.js";

export default function AccountSettings({ session, locale, onClose, onEmailChanged }) {
  const [emailStep, setEmailStep] = useState("idle");
  const [emailToken, setEmailToken] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function emailAction(action) {
    setEmailLoading(true); setEmailError(""); setEmailMessage("");
    try { await action(); } catch (error) { setEmailError(error.message ?? "Request failed."); }
    finally { setEmailLoading(false); }
  }

  function sendCurrentCode() {
    emailAction(async () => {
      await sendCurrentEmailCode(session.accessToken);
      setEmailStep("current-code"); setEmailMessage(t(locale, "emailCodeSent"));
    });
  }

  function verifyCurrentCode(event) {
    event.preventDefault();
    emailAction(async () => {
      const data = await verifyCurrentEmailCode(session.accessToken, currentCode.trim());
      setEmailToken(data.token); setEmailStep("new-email");
    });
  }

  function sendNewCode(event) {
    event.preventDefault();
    emailAction(async () => {
      await sendNewEmailCode(session.accessToken, emailToken, newEmail.trim());
      setEmailStep("new-code"); setEmailMessage(t(locale, "emailCodeSent"));
    });
  }

  function confirmEmail(event) {
    event.preventDefault();
    emailAction(async () => {
      const data = await confirmNewEmail(session.accessToken, newEmailCode.trim());
      onEmailChanged(data.email); setEmailStep("done"); setEmailMessage(t(locale, "emailUpdated"));
    });
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError(""); setPasswordMessage("");
    if (newPassword.length < 6) { setPasswordError(t(locale, "passwordMinimum")); return; }
    if (newPassword !== passwordConfirmation) { setPasswordError(t(locale, "passwordsDoNotMatch")); return; }
    setPasswordLoading(true);
    try {
      const verification = await verifyCurrentPassword(session.accessToken, currentPassword);
      await updatePassword(session.accessToken, newPassword, verification.token);
      setCurrentPassword(""); setNewPassword(""); setPasswordConfirmation(""); setPasswordMessage(t(locale, "passwordUpdated"));
    } catch (error) { setPasswordError(error.message ?? "Request failed."); }
    finally { setPasswordLoading(false); }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-settings-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><p className="eyebrow">GLAME</p><h2 id="account-settings-title">{t(locale, "accountSettings")}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label={t(locale, "close")}>×</button></header>
      <div className="settings-section">
        <h3>{t(locale, "changeEmail")}</h3><p className="settings-current-email">{t(locale, "currentEmail")}: <strong>{session.email}</strong></p>
        {emailStep === "idle" && <button className="secondary-button" onClick={sendCurrentCode} disabled={emailLoading}>{emailLoading ? t(locale, "preparing") : t(locale, "sendCode")}</button>}
        {emailStep === "current-code" && <form onSubmit={verifyCurrentCode} className="settings-form"><label>{t(locale, "emailCode")}<input value={currentCode} onChange={(event) => setCurrentCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" required /></label><button className="primary-button" disabled={emailLoading}>{emailLoading ? t(locale, "preparing") : t(locale, "verifyCode")}</button></form>}
        {emailStep === "new-email" && <form onSubmit={sendNewCode} className="settings-form"><label>{t(locale, "newEmail")}<input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} autoComplete="email" required /></label><button className="primary-button" disabled={emailLoading}>{emailLoading ? t(locale, "preparing") : t(locale, "sendCode")}</button></form>}
        {emailStep === "new-code" && <form onSubmit={confirmEmail} className="settings-form"><label>{t(locale, "emailCode")}<input value={newEmailCode} onChange={(event) => setNewEmailCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" required /></label><button className="primary-button" disabled={emailLoading}>{emailLoading ? t(locale, "preparing") : t(locale, "confirmEmail")}</button></form>}
        {emailMessage && <p className="form-success" role="status">{emailMessage}</p>}{emailError && <p className="form-error" role="alert">{emailError}</p>}
      </div>
      <div className="settings-section">
        <h3>{t(locale, "passwordSecurity")}</h3>
        <form onSubmit={changePassword} className="settings-form"><label>{t(locale, "currentPassword")}<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label><label>{t(locale, "newPassword")}<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /></label><label>{t(locale, "confirmPassword")}<input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" required /></label><button className="primary-button" disabled={passwordLoading}>{passwordLoading ? t(locale, "preparing") : t(locale, "changePassword")}</button></form>
        {passwordMessage && <p className="form-success" role="status">{passwordMessage}</p>}{passwordError && <p className="form-error" role="alert">{passwordError}</p>}
      </div>
    </section>
  </div>;
}
