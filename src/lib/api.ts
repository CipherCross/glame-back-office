import type {Artist, AuthResponse, ReportColumn, ReportFilters, ReportKind, ReportResponse} from "common/types";

const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"]
  ?? "https://jxsnltrsdegskfyoguiy.supabase.co/functions/v1/api").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  token?: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  responseType?: "json" | "blob";
}

async function request<T>(path: string, { token, method = "GET", body, responseType = "json" }: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: "no-store",
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const data: { error?: unknown } = await response.json().catch(() => ({}));
    throw new ApiError(typeof data.error === "string" ? data.error : "The request could not be completed.", response.status);
  }

  return (responseType === "blob" ? response.blob() : response.json()) as Promise<T>;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request("/auth/email", { method: "POST", body: { email, password } });
}

export function refreshAdminSession(refreshToken: string): Promise<AuthResponse> {
  return request("/auth/refresh", { method: "POST", body: { refresh_token: refreshToken } });
}

export function logout(token: string): Promise<{ action: string }> {
  return request("/auth/logout", { token, method: "POST", body: { scope: "local" } });
}

function searchParams(filters: ReportFilters, columns: ReportColumn[], options: { page?: number; limit?: number; format?: "csv" | "xlsx" } = {}): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.dateDimension) params.set("date_dimension", filters.dateDimension);
  if (filters.artistId) params.set("artist_id", filters.artistId);
  if (filters.status) params.set("status", filters.status);
  columns.forEach((column) => params.append("column", column));
  if (Number.isFinite(options.page) && Number.isFinite(options.limit)) {
    params.set("offset", String(options.page! * options.limit!));
    params.set("limit", String(options.limit));
  }
  if (options.format) params.set("format", options.format);
  return params.toString();
}

export function getReport(token: string, kind: ReportKind, filters: ReportFilters, columns: ReportColumn[], page: number, limit: number): Promise<ReportResponse> {
  return request(`/admin/reports/${kind}?${searchParams(filters, columns, { page, limit })}`, { token });
}

export function getArtists(token: string): Promise<{ artists: Artist[] }> {
  return request("/admin/reports/artists", { token });
}

export function getCurrentAdmin(token: string): Promise<{ user?: { full_name?: string | null; email?: string | null } }> {
  return request("/admin/reports/me", { token });
}

export function exportReport(token: string, kind: ReportKind, filters: ReportFilters, columns: ReportColumn[], format: "csv" | "xlsx"): Promise<Blob> {
  return request(`/admin/reports/${kind}/export?${searchParams(filters, columns, { format })}`, { token, responseType: "blob" });
}

export function verifyCurrentPassword(token: string, password: string): Promise<{ token: string }> {
  return request("/auth/password/verify", { token, method: "POST", body: { password } });
}

export function updatePassword(token: string, password: string, verificationToken: string): Promise<{ action: string }> {
  return request("/auth/password/update", { token, method: "POST", body: { password, token: verificationToken } });
}

export function sendCurrentEmailCode(token: string): Promise<{ action: string }> {
  return request("/users/me/email/change/send-otp", { token, method: "POST" });
}

export function verifyCurrentEmailCode(token: string, code: string): Promise<{ token: string }> {
  return request("/users/me/email/change/verify-current", { token, method: "POST", body: { code } });
}

export function sendNewEmailCode(token: string, verificationToken: string, email: string): Promise<{ action: string }> {
  return request("/users/me/email/change/send-new-otp", { token, method: "POST", body: { token: verificationToken, new_email: email } });
}

export function confirmNewEmail(token: string, code: string): Promise<{ email: string }> {
  return request("/users/me/email/change/confirm", { token, method: "POST", body: { code } });
}
