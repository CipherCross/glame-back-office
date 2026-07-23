import type { Artist, ReportFilters, ReportKind } from 'common/types';
import type { Locale } from 'common/types/AccountSettings';

export interface FiltersProps {
  kind: ReportKind;
  filters: ReportFilters;
  artists: Artist[];
  onChange: (filters: ReportFilters) => void;
  onApply: () => void;
  onClear: () => void;
  loading: boolean;
  locale: Locale;
}
