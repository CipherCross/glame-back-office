import { columnLabel as translatedColumnLabel, statusLabel } from "./i18n.js";

export const REPORTS = {
  transactions: {
    title: "Transactions",
    description: "Service payments, cancellations and refunds.",
    dimensions: ["service", "payment", "refund", "invoice"],
    columns: [
      "booking_id", "customer", "artist_names", "status", "payment_status",
      "service_date", "payment_date", "refund_date", "cancelled_at",
      "cancellation_reason", "amount_ht_cents", "vat_amount_cents",
      "amount_ttc_cents", "refunded_amount_cents", "currency", "address",
      "stripe_payment_intent_id",
    ],
    defaultColumns: [
      "booking_id", "customer", "artist_names", "status", "payment_status",
      "service_date", "payment_date", "amount_ht_cents", "vat_amount_cents",
      "amount_ttc_cents", "refunded_amount_cents",
    ],
  },
  payouts: {
    title: "Payouts & invoices",
    description: "Artist transfers and self-billing invoice reconciliation.",
    dimensions: ["payout"],
    columns: [
      "transfer_id", "booking_id", "artist_id", "artist_name", "status",
      "payout_date", "amount_ht_cents", "vat_amount_cents", "amount_ttc_cents",
      "currency", "invoice_number", "invoice_id", "pennylane_delivery_status",
      "stripe_reference",
    ],
    defaultColumns: [
      "payout_date", "artist_name", "status", "amount_ht_cents", "vat_amount_cents",
      "amount_ttc_cents", "invoice_number", "pennylane_delivery_status", "stripe_reference",
    ],
  },
};

export function columnLabel(locale, column) { return translatedColumnLabel(locale, column); }

export function formatCell(locale, column, value, row) {
  if (value === null || value === undefined || value === "") return "—";
  if (column.endsWith("_cents")) {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: row.currency ?? "EUR",
    }).format(Number(value) / 100);
  }
  if (column.endsWith("_date") || column.endsWith("_at")) {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(date);
  }
  if (column === "status" || column === "payment_status" || column === "pennylane_delivery_status") return statusLabel(locale, String(value));
  return String(value);
}

export function defaultFilters(kind) {
  return { from: "", to: "", dateDimension: REPORTS[kind].dimensions[0], artistId: "", status: "" };
}
