import { columnLabel as translatedColumnLabel, statusLabel, t } from 'lib/i18n';
import type { ReportColumn, ReportFilters, ReportKind, ReportRow } from 'common/types';
import type { Locale } from 'common/types/AccountSettings';
import { REPORTS } from 'common/constants/reporting';

export function columnLabel(locale: Locale, column: ReportColumn): string {
  return translatedColumnLabel(locale, column);
}

export function formatCell(locale: Locale, column: ReportColumn, value: unknown, row: ReportRow): string {
  if (value === null || value === undefined || value === '') return '—';
  if (column.endsWith('_cents')) {
    const currency = typeof row['currency'] === 'string' ? row['currency'] : 'EUR';
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency
    }).format(Number(value) / 100);
  }
  if (column.endsWith('_date') || column.endsWith('_at')) {
    const date = new Date(String(value));
    return Number.isNaN(date.valueOf())
      ? String(value)
      : new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Europe/Paris'
        }).format(date);
  }
  if (column === 'status' || column === 'payment_status' || column === 'pennylane_delivery_status') {
    return statusLabel(locale, String(value));
  }
  if (column === 'operation_type') {
    return t(locale, String(value) === 'refund' ? 'refundOperation' : 'payoutOperation');
  }
  return String(value);
}

export function defaultFilters(kind: ReportKind): ReportFilters {
  return { from: '', to: '', dateDimension: REPORTS[kind].dimensions[0]!, artistId: '', status: '' };
}
