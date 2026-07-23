import type { Artist, ReportColumn, ReportFilters, ReportKind } from 'common/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshSessionRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
}

export interface ReportRequest {
  kind: ReportKind;
  filters: ReportFilters;
  columns: ReportColumn[];
  page: number;
  limit: number;
}

export interface ExportRequest extends Omit<ReportRequest, 'page' | 'limit'> {
  format: 'csv' | 'xlsx';
}

export interface SearchParamsOptions {
  page?: number;
  limit?: number;
  format?: 'csv' | 'xlsx';
}

export interface ActionResponse {
  action: string;
}

export interface CurrentUserResponse {
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
}

export interface PasswordRequest {
  password: string;
}

export interface PasswordUpdateRequest extends PasswordRequest {
  token: string;
}

export interface VerificationCodeRequest {
  code: string;
}

export interface NewEmailCodeRequest {
  token: string;
  newEmail: string;
}

export interface ArtistsResponse {
  artists: Artist[];
}

export interface TokenResponse {
  token: string;
}

export interface EmailResponse {
  email: string;
}
