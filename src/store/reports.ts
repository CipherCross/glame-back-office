import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultReportState } from 'lib/report-cache';
import type { ReportKind, ReportState, ReportView } from 'common/types';

interface ReportsState {
  byAccount: Record<string, ReportState>;
}

function accountKey(email: string): string {
  return email.trim().toLowerCase();
}

function ensureReportState(state: ReportsState, email: string): ReportState {
  const key = accountKey(email);
  return (state.byAccount[key] ??= defaultReportState());
}

export function selectReportState(state: ReportsState, email: string | undefined): ReportState {
  if (!email) return defaultReportState();
  return state.byAccount[accountKey(email)] ?? defaultReportState();
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState: { byAccount: {} } as ReportsState,
  reducers: {
    switchReport: (state, action: PayloadAction<{ email: string; kind: ReportKind }>) => {
      ensureReportState(state, action.payload.email).activeKind = action.payload.kind;
    },
    updateReportView: (state, action: PayloadAction<{ email: string; kind: ReportKind; changes: Partial<ReportView> }>) => {
      Object.assign(ensureReportState(state, action.payload.email).views[action.payload.kind], action.payload.changes);
    },
    resetReports: (state, action: PayloadAction<string>) => {
      delete state.byAccount[accountKey(action.payload)];
    }
  }
});

export const { switchReport, updateReportView, resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;
