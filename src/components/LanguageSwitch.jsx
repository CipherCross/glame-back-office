export default function LanguageSwitch({ locale, onChange, label }) {
  return <div className="language-switch" aria-label={label}>
    <button type="button" className={locale === "fr" ? "active" : ""} onClick={() => onChange("fr")} aria-pressed={locale === "fr"}>FR</button>
    <button type="button" className={locale === "en" ? "active" : ""} onClick={() => onChange("en")} aria-pressed={locale === "en"}>EN</button>
  </div>;
}
