import type { BackOfficeSession, Locale } from 'common/types/AccountSettings';
import type { ToastType } from 'common/types';

export interface AccountSettingsProps {
  session: BackOfficeSession;
  locale: Locale;
  onClose: () => void;
  onEmailChanged: (email: string) => void;
  onNotify: (message: string, type: ToastType) => void;
}
