import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from 'common/constants/api';
import { API_REDUCER_PATH, API_TAGS, API_TAG_TYPES } from 'common/constants/store/api';
import type {
  ActionResponse,
  ArtistsResponse,
  CurrentUserResponse,
  EmailResponse,
  ExportRequest,
  LoginRequest,
  LogoutRequest,
  NewEmailCodeRequest,
  PasswordRequest,
  PasswordUpdateRequest,
  RefreshSessionRequest,
  ReportRequest,
  SearchParamsOptions,
  TokenResponse,
  VerificationCodeRequest
} from 'common/interfaces/store/api';
import type { AuthResponse, ReportColumn, ReportFilters, ReportResponse } from 'common/types';
import type { RootState } from 'store/index';

function searchParams(filters: ReportFilters, columns: ReportColumn[], options: SearchParamsOptions = {}): string {
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
  reducerPath: API_REDUCER_PATH,
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.session?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: API_TAG_TYPES,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/email', method: 'POST', body })
    }),
    refreshSession: builder.mutation<AuthResponse, RefreshSessionRequest>({
      query: ({ refreshToken }) => ({ url: '/auth/refresh', method: 'POST', body: { refresh_token: refreshToken } })
    }),
    logout: builder.mutation<ActionResponse, LogoutRequest>({
      query: ({ accessToken }) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { scope: 'local' },
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => '/admin/reports/me',
      providesTags: [API_TAGS.currentUser]
    }),
    getArtists: builder.query<ArtistsResponse, void>({
      query: () => '/admin/reports/artists',
      providesTags: [API_TAGS.artists]
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
    verifyCurrentPassword: builder.mutation<TokenResponse, PasswordRequest>({
      query: (body) => ({ url: '/auth/password/verify', method: 'POST', body })
    }),
    updatePassword: builder.mutation<ActionResponse, PasswordUpdateRequest>({
      query: (body) => ({ url: '/auth/password/update', method: 'POST', body })
    }),
    sendCurrentEmailCode: builder.mutation<ActionResponse, void>({
      query: () => ({ url: '/users/me/email/change/send-otp', method: 'POST' })
    }),
    verifyCurrentEmailCode: builder.mutation<TokenResponse, VerificationCodeRequest>({
      query: (body) => ({ url: '/users/me/email/change/verify-current', method: 'POST', body })
    }),
    sendNewEmailCode: builder.mutation<ActionResponse, NewEmailCodeRequest>({
      query: ({ token, newEmail }) => ({ url: '/users/me/email/change/send-new-otp', method: 'POST', body: { token, new_email: newEmail } })
    }),
    confirmNewEmail: builder.mutation<EmailResponse, VerificationCodeRequest>({
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
