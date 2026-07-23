import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from 'common/constants/api';
import type { Artist, AuthResponse, ReportColumn, ReportFilters, ReportKind, ReportResponse } from 'common/types';
import type { RootState } from 'store/index';

interface ReportRequest {
  kind: ReportKind;
  filters: ReportFilters;
  columns: ReportColumn[];
  page: number;
  limit: number;
}

interface ExportRequest extends Omit<ReportRequest, 'page' | 'limit'> {
  format: 'csv' | 'xlsx';
}

function searchParams(
  filters: ReportFilters,
  columns: ReportColumn[],
  options: { page?: number; limit?: number; format?: 'csv' | 'xlsx' } = {}
): string {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.dateDimension) params.set('date_dimension', filters.dateDimension);
  if (filters.artistId) params.set('artist_id', filters.artistId);
  if (filters.status) params.set('status', filters.status);
  columns.forEach((column) => params.append('column', column));
  if (Number.isFinite(options.page) && Number.isFinite(options.limit)) {
    params.set('offset', String(options.page! * options.limit!));
    params.set('limit', String(options.limit));
  }
  if (options.format) params.set('format', options.format);
  return params.toString();
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.session?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ['CurrentUser', 'Artists'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/email', method: 'POST', body })
    }),
    refreshSession: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({ url: '/auth/refresh', method: 'POST', body: { refresh_token: refreshToken } })
    }),
    logout: builder.mutation<{ action: string }, { accessToken: string }>({
      query: ({ accessToken }) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { scope: 'local' },
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    }),
    getCurrentUser: builder.query<{ user?: { full_name?: string | null; email?: string | null } }, void>({
      query: () => '/admin/reports/me',
      providesTags: ['CurrentUser']
    }),
    getArtists: builder.query<{ artists: Artist[] }, void>({
      query: () => '/admin/reports/artists',
      providesTags: ['Artists']
    }),
    getReport: builder.query<ReportResponse, ReportRequest>({
      query: ({ kind, filters, columns, page, limit }) => `/admin/reports/${kind}?${searchParams(filters, columns, { page, limit })}`
    }),
    exportReport: builder.mutation<Blob, ExportRequest>({
      query: ({ kind, filters, columns, format }) => ({
        url: `/admin/reports/${kind}/export?${searchParams(filters, columns, { format })}`,
        responseHandler: (response) => response.blob()
      })
    }),
    verifyCurrentPassword: builder.mutation<{ token: string }, { password: string }>({
      query: (body) => ({ url: '/auth/password/verify', method: 'POST', body })
    }),
    updatePassword: builder.mutation<{ action: string }, { password: string; token: string }>({
      query: (body) => ({ url: '/auth/password/update', method: 'POST', body })
    }),
    sendCurrentEmailCode: builder.mutation<{ action: string }, void>({
      query: () => ({ url: '/users/me/email/change/send-otp', method: 'POST' })
    }),
    verifyCurrentEmailCode: builder.mutation<{ token: string }, { code: string }>({
      query: (body) => ({ url: '/users/me/email/change/verify-current', method: 'POST', body })
    }),
    sendNewEmailCode: builder.mutation<{ action: string }, { token: string; newEmail: string }>({
      query: ({ token, newEmail }) => ({ url: '/users/me/email/change/send-new-otp', method: 'POST', body: { token, new_email: newEmail } })
    }),
    confirmNewEmail: builder.mutation<{ email: string }, { code: string }>({
      query: (body) => ({ url: '/users/me/email/change/confirm', method: 'POST', body })
    })
  })
});

export const {
  useGetArtistsQuery,
  useGetCurrentUserQuery,
  useLazyGetReportQuery,
  useExportReportMutation,
  useVerifyCurrentPasswordMutation,
  useUpdatePasswordMutation,
  useSendCurrentEmailCodeMutation,
  useVerifyCurrentEmailCodeMutation,
  useSendNewEmailCodeMutation,
  useConfirmNewEmailMutation
} = api;
