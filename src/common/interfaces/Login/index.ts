import type { Locale } from 'common/types/AccountSettings';

export interface LoginProps {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
  error: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}
