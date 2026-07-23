import {useEffect, useState} from "react";
import ColumnPicker from "components/ColumnPicker";
import Filters from "components/Filters";
import LanguageSwitch from "components/LanguageSwitch";
import ReportTable from "components/ReportTable";
import {ApiError, exportReport, getReport} from "lib/api";
import {defaultFilters, formatCell} from "lib/reporting";
import {reportDescription, reportTitle, t} from "lib/i18n";
import {REPORTS} from "common/constants/reporting";
import {PAGE_SIZE} from "common/constants";
import type {Artist, ReportColumn, ReportResponse, ReportKind, ReportView} from "common/types";
import type {AdminSession, Locale} from "common/types/AccountSettings";

export interface ReportPageProps {
  kind: ReportKind;
  session: AdminSession;
  locale: Locale;
  artists: Artist[];
  view: ReportView;
  onViewChange: (changes: Partial<ReportView>) => void;
  onUnauthorized: () => void;
  onLocaleChange: (locale: Locale) => void;
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

export default function ReportPage({
  kind,
  session,
  locale,
  artists,
  view,
  onViewChange,
  onUnauthorized,
  onLocaleChange,
}: ReportPageProps) {
  const [report, setReport] = useState<ReportResponse>({ rows: [], total: 0, totals: null });
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [exporting, setExporting] = useState<"" | "csv" | "xlsx">("");
  const {filters, columns, page} = view;

  async function loadReport(nextPage = page, activeFilters = filters, activeColumns = columns): Promise<void> {
    setLoading(true);
    setReportError("");
    try {
      const data = await getReport(session.accessToken, kind, activeFilters, activeColumns, nextPage, PAGE_SIZE);
      setReport(data);
      onViewChange({page: nextPage});
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else setReportError(errorMessage(error, "Could not load the report."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadReport(page); }, [session.accessToken, kind]);

  async function handleExport(format: "csv" | "xlsx"): Promise<void> {
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

  const totals = report.totals ?? {};
  return <main className="content">
    <header className="topbar"><div><p className="eyebrow">{t(locale, "financialReporting")}</p><h1>{reportTitle(locale, kind)}</h1><p className="muted">{reportDescription(locale, kind)}</p></div><div className="export-actions"><LanguageSwitch locale={locale} onChange={onLocaleChange} label={t(locale, "language")} /><button className="secondary-button" onClick={() => void handleExport("csv")} disabled={Boolean(exporting)}>{exporting === "csv" ? t(locale, "preparing") : t(locale, "exportCsv")}</button><button className="primary-button" onClick={() => void handleExport("xlsx")} disabled={Boolean(exporting)}>{exporting === "xlsx" ? t(locale, "preparing") : t(locale, "exportExcel")}</button></div></header>
    <Filters kind={kind} filters={filters} artists={artists} onChange={(nextFilters) => onViewChange({filters: nextFilters})} onApply={() => void loadReport(0)} onClear={() => { const resetFilters = defaultFilters(kind); onViewChange({filters: resetFilters, page: 0}); void loadReport(0, resetFilters); }} loading={loading} locale={locale} />
    <section className="summary-grid"><article><span>{t(locale, "ht")}</span><strong>{formatCell(locale, "amount_ht_cents", totals["amount_ht_cents"] ?? 0, {currency: "EUR"})}</strong></article><article><span>{t(locale, "vat")}</span><strong>{formatCell(locale, "vat_amount_cents", totals["vat_amount_cents"] ?? 0, {currency: "EUR"})}</strong></article><article><span>{t(locale, "ttc")}</span><strong>{formatCell(locale, "amount_ttc_cents", totals["amount_ttc_cents"] ?? 0, {currency: "EUR"})}</strong></article><article><span>{t(locale, "refunded")}</span><strong>{formatCell(locale, "refunded_amount_cents", totals["refunded_amount_cents"] ?? 0, {currency: "EUR"})}</strong></article></section>
    <section className="report-card"><div className="report-card-head"><div><h2>{t(locale, "results")}</h2><p>{report.total.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} {t(locale, "records")}</p></div><ColumnPicker columns={REPORTS[kind].columns} selected={columns} onChange={(nextColumns: ReportColumn[]) => { onViewChange({columns: nextColumns, page: 0}); void loadReport(0, filters, nextColumns); }} locale={locale} /></div><ReportTable rows={report.rows} columns={columns} loading={loading} error={reportError} page={page} limit={PAGE_SIZE} total={report.total} onPageChange={(nextPage) => void loadReport(nextPage)} locale={locale} /></section>
  </main>;
}
