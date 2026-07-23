import { useEffect, useState } from 'react';
import ColumnPicker from 'components/ColumnPicker';
import Filters from 'components/Filters';
import LanguageSwitch from 'components/LanguageSwitch';
import ReportTable from 'components/ReportTable';
import { defaultFilters, formatCell } from 'lib/reporting';
import { reportDescription, reportTitle, t } from 'lib/i18n';
import { REPORTS } from 'common/constants/reporting';
import { PAGE_SIZE } from 'common/constants';
import type { ReportColumn } from 'common/types';
import type { ReportPageProps } from 'common/interfaces/report';
import { errorMessage } from 'utils/app';
import { download } from 'utils/report';
import { useExportReportMutation, useLazyGetReportQuery } from 'store/api';

export default function ReportPage({
  kind,
  session,
  locale,
  artists,
  view,
  onViewChange,
  onUnauthorized,
  onLocaleChange,
  onNotify
}: ReportPageProps) {
  const [reportError, setReportError] = useState('');
  const [exporting, setExporting] = useState<'' | 'csv' | 'xlsx'>('');
  const [loadReportQuery, { data: report, isFetching: loading }] = useLazyGetReportQuery();
  const [exportReport] = useExportReportMutation();
  const { filters, columns, page } = view;

  async function loadReport(nextPage = page, activeFilters = filters, activeColumns = columns): Promise<void> {
    setReportError('');
    try {
      await loadReportQuery({ kind, filters: activeFilters, columns: activeColumns, page: nextPage, limit: PAGE_SIZE }).unwrap();
      onViewChange({ page: nextPage });
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
      if (status === 401) onUnauthorized();
      else {
        const message = errorMessage(error, 'Could not load the report.');
        setReportError(message);
        onNotify(message, 'error');
      }
    }
  }

  useEffect(() => {
    void loadReport(page);
  }, [session.accessToken, kind]);

  async function handleExport(format: 'csv' | 'xlsx'): Promise<void> {
    setExporting(format);
    try {
      const blob = await exportReport({ kind, filters, columns, format }).unwrap();
      download(blob, `${kind}-${new Date().toISOString().slice(0, 10)}.${format}`);
      onNotify(t(locale, 'exportReady'), 'success');
    } catch (error) {
      const message = errorMessage(error, 'Could not create the export.');
      setReportError(message);
      onNotify(message, 'error');
    } finally {
      setExporting('');
    }
  }

  const activeReport = report ?? { rows: [], total: 0, totals: null };
  const totals = activeReport.totals ?? {};
  return (
    <main className="content">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t(locale, 'financialReporting')}</p>
          <h1>{reportTitle(locale, kind)}</h1>
          <p className="muted">{reportDescription(locale, kind)}</p>
        </div>
        <div className="export-actions">
          <LanguageSwitch locale={locale} onChange={onLocaleChange} label={t(locale, 'language')} />
          <button className="secondary-button" onClick={() => void handleExport('csv')} disabled={Boolean(exporting)}>
            {exporting === 'csv' ? t(locale, 'preparing') : t(locale, 'exportCsv')}
          </button>
          <button className="primary-button" onClick={() => void handleExport('xlsx')} disabled={Boolean(exporting)}>
            {exporting === 'xlsx' ? t(locale, 'preparing') : t(locale, 'exportExcel')}
          </button>
        </div>
      </header>
      <Filters
        kind={kind}
        filters={filters}
        artists={artists}
        onChange={(nextFilters) => onViewChange({ filters: nextFilters })}
        onApply={() => void loadReport(0)}
        onClear={() => {
          const resetFilters = defaultFilters(kind);
          onViewChange({ filters: resetFilters, page: 0 });
          void loadReport(0, resetFilters);
        }}
        loading={loading}
        locale={locale}
      />
      <section className="summary-grid">
        <article>
          <span>{t(locale, 'ht')}</span>
          <strong>{formatCell(locale, 'amount_ht_cents', totals['amount_ht_cents'] ?? 0, { currency: 'EUR' })}</strong>
        </article>
        <article>
          <span>{t(locale, 'vat')}</span>
          <strong>{formatCell(locale, 'vat_amount_cents', totals['vat_amount_cents'] ?? 0, { currency: 'EUR' })}</strong>
        </article>
        <article>
          <span>{t(locale, 'ttc')}</span>
          <strong>{formatCell(locale, 'amount_ttc_cents', totals['amount_ttc_cents'] ?? 0, { currency: 'EUR' })}</strong>
        </article>
        <article>
          <span>{t(locale, 'refunded')}</span>
          <strong>{formatCell(locale, 'refunded_amount_cents', totals['refunded_amount_cents'] ?? 0, { currency: 'EUR' })}</strong>
        </article>
      </section>
      <section className="report-card">
        <div className="report-card-head">
          <div>
            <h2>{t(locale, 'results')}</h2>
            <p>
              {activeReport.total.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB')} {t(locale, 'records')}
            </p>
          </div>
          <ColumnPicker
            columns={REPORTS[kind].columns}
            selected={columns}
            onChange={(nextColumns: ReportColumn[]) => {
              onViewChange({ columns: nextColumns, page: 0 });
              void loadReport(0, filters, nextColumns);
            }}
            locale={locale}
          />
        </div>
        <ReportTable
          rows={activeReport.rows}
          columns={columns}
          loading={loading}
          error={reportError}
          page={page}
          limit={PAGE_SIZE}
          total={activeReport.total}
          onPageChange={(nextPage) => void loadReport(nextPage)}
          locale={locale}
        />
      </section>
    </main>
  );
}
