import type { ReportKind } from 'common/types';
import type { ReportDefinition } from 'common/interfaces/reporting';

export const REPORTS: Record<ReportKind, ReportDefinition> = {
  transactions: {
    dimensions: ['service', 'payment', 'refund', 'invoice'],
    columns: [
      'booking_id',
      'customer',
      'artist_names',
      'status',
      'payment_status',
      'service_date',
      'payment_date',
      'refund_date',
      'cancelled_at',
      'cancellation_reason',
      'amount_ht_cents',
      'vat_amount_cents',
      'amount_ttc_cents',
      'refunded_amount_cents',
      'currency',
      'address',
      'stripe_payment_intent_id'
    ],
    defaultColumns: [
      'booking_id',
      'customer',
      'artist_names',
      'status',
      'payment_status',
      'service_date',
      'payment_date',
      'amount_ht_cents',
      'vat_amount_cents',
      'amount_ttc_cents',
      'refunded_amount_cents'
    ]
  },
  payouts: {
    dimensions: ['payout'],
    columns: [
      'operation_type',
      'operation_date',
      'booking_id',
      'customer',
      'transfer_id',
      'refund_id',
      'artist_id',
      'artist_name',
      'status',
      'payout_date',
      'refund_date',
      'amount_ht_cents',
      'vat_amount_cents',
      'amount_ttc_cents',
      'refunded_amount_cents',
      'currency',
      'invoice_number',
      'invoice_id',
      'pennylane_delivery_status',
      'stripe_reference'
    ],
    defaultColumns: [
      'operation_type',
      'operation_date',
      'booking_id',
      'customer',
      'artist_name',
      'status',
      'amount_ht_cents',
      'vat_amount_cents',
      'amount_ttc_cents',
      'refunded_amount_cents',
      'stripe_reference'
    ]
  }
};
