import type { DateDimension, ReportColumn } from 'common/types';

export interface ReportDefinition {
  dimensions: DateDimension[];
  columns: ReportColumn[];
  defaultColumns: ReportColumn[];
}
