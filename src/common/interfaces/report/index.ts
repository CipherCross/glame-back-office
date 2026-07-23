import type { Artist, ReportKind, ReportView, ToastType } from 'common/types';
import type { BackOfficeSession, Locale } from 'common/types/AccountSettings';

export interface ReportPageProps {
  kind: ReportKind;
  session: BackOfficeSession;
  locale: Locale;
  artists: Artist[];
  view: ReportView;
  onViewChange: (changes: Partial<ReportView>) => void;
  onUnauthorized: () => void;
  onLocaleChange: (locale: Locale) => void;
  onNotify: (message: string, type: ToastType) => void;
}
