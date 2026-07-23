import type { ReportKind, ReportState, ReportView } from 'common/types';

export interface ReportsState {
  byAccount: Record<string, ReportState>;
}

export interface SwitchReportRequest {
  email: string;
  kind: ReportKind;
}

export interface UpdateReportViewRequest extends SwitchReportRequest {
  changes: Partial<ReportView>;
}
