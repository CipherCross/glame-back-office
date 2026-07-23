import { defaultFilters } from 'lib/reporting';
import type { ReportKind, ReportState, ReportView } from 'common/types';
import { REPORTS } from 'common/constants/reporting';

function defaultView(kind: ReportKind): ReportView {
  return {
    filters: defaultFilters(kind),
    columns: [...REPORTS[kind].defaultColumns],
    page: 0
  };
}

export function defaultReportState(): ReportState {
  return {
    activeKind: 'transactions',
    views: {
      transactions: defaultView('transactions'),
      payouts: defaultView('payouts')
    }
  };
}
