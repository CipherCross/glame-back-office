import type { BackOfficeRole, BackOfficeSession } from 'common/types/AccountSettings';
import type { AuthResponse } from 'common/types';

function isBackOfficeRole(role: string | undefined): role is BackOfficeRole {
  return role === 'admin' || role === 'accountant';
}

export function toBackOfficeSession(data: AuthResponse, fallbackEmail = ''): BackOfficeSession {
  const accessToken = data.session?.access_token;
  const refreshToken = data.session?.refresh_token;
  if (!accessToken || !refreshToken || !isBackOfficeRole(data.role)) throw new Error('This account does not have Back Office access.');
  return {
    accessToken,
    refreshToken,
    expiresAt: (data.session?.expires_at ?? 0) * 1000,
    email: data.user?.email ?? fallbackEmail,
    name: data.user?.user_metadata?.full_name ?? data.user?.email ?? fallbackEmail,
    role: data.role
  };
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data;
    if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') return data.error;
  }
  return fallback;
}
