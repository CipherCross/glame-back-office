import { columnLabel, formatCell } from 'lib/reporting';
import { t } from 'lib/i18n';
import type { ReportTableProps } from 'common/interfaces/ReportTable';

export default function ReportTable({ rows, columns, loading, error, page, limit, total, onPageChange, locale }: ReportTableProps) {
  if (loading)
    return (
      <>
        <div className="table-scroll skeleton-scroll" aria-busy="true" aria-label={t(locale, 'loadingReport')}>
          <table className="skeleton-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{columnLabel(locale, column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: limit }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, columnIndex) => (
                    <td key={column}>
                      <span className={`skeleton-line skeleton-${(rowIndex + columnIndex) % 3}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="table-footer skeleton-footer">
          <span className="skeleton-line" />
          <div>
            <span className="skeleton-button" />
            <span className="skeleton-button" />
          </div>
        </footer>
      </>
    );
  if (error)
    return (
      <div className="table-state error-state" role="alert">
        {error}
      </div>
    );
  if (!rows.length) return <div className="table-state">{t(locale, 'noData')}</div>;
  const from = page * limit + 1;
  const to = Math.min((page + 1) * limit, total);
  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{columnLabel(locale, column)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row['booking_id'] ?? row['transfer_id'] ?? 'report-row'}-${index}`}>
                {columns.map((column) => (
                  <td key={column} title={String(row[column] ?? '')}>
                    {formatCell(locale, column, row[column], row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <span>
          {from}–{to} {t(locale, 'of')} {total.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB')}
        </span>
        <div>
          <button className="page-button" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            {t(locale, 'previous')}
          </button>
          <button className="page-button" onClick={() => onPageChange(page + 1)} disabled={to >= total}>
            {t(locale, 'next')}
          </button>
        </div>
      </footer>
    </>
  );
}
