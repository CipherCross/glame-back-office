import { REPORTS } from "../lib/reporting.js";
import { statusLabel, t } from "../lib/i18n.js";

const STATUSES = ["confirmed", "cancelled", "completed", "paid", "pending", "failed", "reversed", "refunded", "partially_refunded"];

export default function Filters({ kind, filters, artists, onChange, onApply, onClear, loading, locale }) {
  const report = REPORTS[kind];
  function update(key, value) { onChange({ ...filters, [key]: value }); }
  return (
    <section className="filters" aria-label={t(locale, "results")}>
      <label>{t(locale, "dateType")}<select value={filters.dateDimension} onChange={(event) => update("dateDimension", event.target.value)}>
        {report.dimensions.map((dimension) => <option value={dimension} key={dimension}>{t(locale, dimension)}</option>)}
      </select></label>
      <label>{t(locale, "from")}<input type="date" value={filters.from} onChange={(event) => update("from", event.target.value)} /></label>
      <label>{t(locale, "to")}<input type="date" value={filters.to} onChange={(event) => update("to", event.target.value)} /></label>
      <label>{t(locale, "artist")}<select value={filters.artistId} onChange={(event) => update("artistId", event.target.value)}>
        <option value="">{t(locale, "allArtists")}</option>
        {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.full_name || artist.email || artist.id}</option>)}
      </select></label>
      <label>{t(locale, "status")}<select value={filters.status} onChange={(event) => update("status", event.target.value)}>
        <option value="">{t(locale, "allStatuses")}</option>
        {STATUSES.map((status) => <option key={status} value={status}>{statusLabel(locale, status)}</option>)}
      </select></label>
      <div className="filter-actions"><button className="primary-button" onClick={onApply} disabled={loading}>{loading ? t(locale, "updating") : t(locale, "apply")}</button><button className="text-button" onClick={onClear} disabled={loading}>{t(locale, "reset")}</button></div>
    </section>
  );
}
