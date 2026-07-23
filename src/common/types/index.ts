export type ReportKind = 'transactions' | 'payouts';

export type ReportColumn =
  | 'booking_id'
  | 'customer'
  | 'artist_names'
  | 'status'
  | 'payment_status'
  | 'service_date'
  | 'payment_date'
  | 'refund_date'
  | 'cancelled_at'
  | 'cancellation_reason'
  | 'amount_ht_cents'
  | 'vat_amount_cents'
  | 'amount_ttc_cents'
  | 'refunded_amount_cents'
  | 'currency'
  | 'address'
  | 'stripe_payment_intent_id'
  | 'operation_type'
  | 'operation_date'
  | 'transfer_id'
  | 'refund_id'
  | 'artist_id'
  | 'artist_name'
  | 'payout_date'
  | 'invoice_number'
  | 'invoice_id'
  | 'pennylane_delivery_status'
  | 'stripe_reference';

export type DateDimension = 'service' | 'payment' | 'refund' | 'invoice' | 'payout';

export interface ReportFilters {
  from: string;
  to: string;
  dateDimension: DateDimension;
  artistId: string;
  status: string;
}

export interface ReportView {
  filters: ReportFilters;
  columns: ReportColumn[];
  page: number;
}

export interface ReportState {
  activeKind: ReportKind;
  views: Record<ReportKind, ReportView>;
}

export type ReportRow = Record<string, unknown>;

export interface ReportResponse {
  rows: ReportRow[];
  total: number;
  totals: Record<string, number> | null;
}

export interface Artist {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

export interface AuthSessionPayload {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface AuthUser {
  email?: string | null;
  user_metadata?: { full_name?: string | null } | null;
}

export interface AuthResponse {
  role?: string;
  session?: AuthSessionPayload | null;
  user?: AuthUser | null;
}

export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
