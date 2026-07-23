export type BackOfficeRole = 'admin' | 'accountant';

export interface BackOfficeSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  name: string;
  role: BackOfficeRole;
}

export type Locale = 'en' | 'fr';
