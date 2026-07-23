const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  ?? "https://jxsnltrsdegskfyoguiy.supabase.co/functions/v1/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { token, method = "GET", body, responseType = "json" } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    // Financial reports and session responses must not be retained in the
    // browser's HTTP cache.
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error ?? "The request could not be completed.", response.status);
  }

  return responseType === "blob" ? response.blob() : response.json();
}

export async function login(email, password) {
  return request("/auth/email", { method: "POST", body: { email, password } });
}

export async function refreshAdminSession(refreshToken) {
  return request("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function logout(token) {
  return request("/auth/logout", {
    token,
    method: "POST",
    body: { scope: "local" },
  });
}

function searchParams(filters, columns, { page, limit, format } = {}) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.dateDimension) params.set("date_dimension", filters.dateDimension);
  if (filters.artistId) params.set("artist_id", filters.artistId);
  if (filters.status) params.set("status", filters.status);
  columns.forEach((column) => params.append("column", column));
  if (Number.isFinite(page) && Number.isFinite(limit)) {
    params.set("offset", String(page * limit));
    params.set("limit", String(limit));
  }
  if (format) params.set("format", format);
  return params.toString();
}

export async function getReport(token, kind, filters, columns, page, limit) {
  const params = searchParams(filters, columns, { page, limit });
  return request(`/admin/reports/${kind}?${params}`, { token });
}

export async function getArtists(token) {
  return request("/admin/reports/artists", { token });
}

export async function getCurrentAdmin(token) {
  return request("/admin/reports/me", { token });
}

export async function exportReport(token, kind, filters, columns, format) {
  const params = searchParams(filters, columns, { format });
  return request(`/admin/reports/${kind}/export?${params}`, { token, responseType: "blob" });
}

export function verifyCurrentPassword(token, password) {
  return request("/auth/password/verify", { token, method: "POST", body: { password } });
}

export function updatePassword(token, password, verificationToken) {
  return request("/auth/password/update", { token, method: "POST", body: { password, token: verificationToken } });
}

export function sendCurrentEmailCode(token) {
  return request("/users/me/email/change/send-otp", { token, method: "POST" });
}

export function verifyCurrentEmailCode(token, code) {
  return request("/users/me/email/change/verify-current", { token, method: "POST", body: { code } });
}

export function sendNewEmailCode(token, verificationToken, email) {
  return request("/users/me/email/change/send-new-otp", { token, method: "POST", body: { token: verificationToken, new_email: email } });
}

export function confirmNewEmail(token, code) {
  return request("/users/me/email/change/confirm", { token, method: "POST", body: { code } });
}
