import type { ReportColumn } from 'common/types';
import type { Locale } from 'common/types/AccountSettings';

export interface ColumnPickerProps {
  columns: ReportColumn[];
  selected: ReportColumn[];
  onChange: (columns: ReportColumn[]) => void;
  locale: Locale;
}
