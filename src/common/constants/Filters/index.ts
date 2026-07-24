import type { ReportKind } from 'common/types';

export const REPORT_STATUSES: Record<ReportKind, readonly string[]> = {
  transactions: ['pending', 'confirmed', 'cancelled', 'completed', 'paid', 'failed', 'refunded', 'partially_refunded'],
  payouts: ['pending', 'paid', 'failed', 'reversed', 'refunded', 'partially_refunded']
};
