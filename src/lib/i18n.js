export const LOCALE_STORAGE_KEY = "glame-admin-locale";

const DICTIONARY = {
  en: {
    backOffice: "BACK OFFICE", financialReporting: "FINANCIAL REPORTING", signOut: "Sign out",
    transactions: "Transactions", transactionsDescription: "Service payments, cancellations and refunds.",
    payouts: "Payouts & invoices", payoutsDescription: "Artist transfers and self-billing invoice reconciliation.",
    exportCsv: "Export CSV", exportExcel: "Export Excel", preparing: "Preparing…",
    dateType: "Date type", from: "From", to: "To", artist: "Artist", allArtists: "All artists",
    status: "Status", allStatuses: "All statuses", apply: "Apply", reset: "Reset", updating: "Updating…",
    ht: "HT", vat: "VAT", ttc: "TTC", refunded: "Refunded", results: "Results", records: "records",
    columnPicker: "Columns", selected: "selected", loadingReport: "Loading report…", noData: "No data matches the current filters.",
    previous: "Previous", next: "Next", of: "of", email: "Email", password: "Password", signIn: "Sign in", signingIn: "Signing in…",
    loginDescription: "Sign in with an administrator account to access financial reporting.", language: "Language",
    service: "Service date", payment: "Payment date", refund: "Refund date", payout: "Payout date", invoice: "Invoice issue date",
    confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed", paid: "Paid", pending: "Pending", failed: "Failed", reversed: "Reversed", refundedStatus: "Refunded", partially_refunded: "Partially refunded", checkout_expired: "Checkout expired",
  },
  fr: {
    backOffice: "BACK OFFICE", financialReporting: "SUIVI FINANCIER", signOut: "Se déconnecter",
    transactions: "Transactions", transactionsDescription: "Paiements, annulations et remboursements des prestations.",
    payouts: "Versements et factures", payoutsDescription: "Virements aux artistes et rapprochement des factures d’auto-facturation.",
    exportCsv: "Exporter CSV", exportExcel: "Exporter Excel", preparing: "Préparation…",
    dateType: "Type de date", from: "Du", to: "Au", artist: "Artiste", allArtists: "Tous les artistes",
    status: "Statut", allStatuses: "Tous les statuts", apply: "Appliquer", reset: "Réinitialiser", updating: "Mise à jour…",
    ht: "HT", vat: "TVA", ttc: "TTC", refunded: "Remboursé", results: "Résultats", records: "résultats",
    columnPicker: "Colonnes", selected: "sélectionnées", loadingReport: "Chargement du rapport…", noData: "Aucune donnée ne correspond aux filtres actuels.",
    previous: "Précédent", next: "Suivant", of: "sur", email: "E-mail", password: "Mot de passe", signIn: "Se connecter", signingIn: "Connexion…",
    loginDescription: "Connectez-vous avec un compte administrateur pour accéder au suivi financier.", language: "Langue",
    service: "Date de prestation", payment: "Date de paiement", refund: "Date de remboursement", payout: "Date de versement", invoice: "Date d’émission de facture",
    confirmed: "Confirmée", cancelled: "Annulée", completed: "Terminée", paid: "Payé", pending: "En attente", failed: "Échoué", reversed: "Annulé", refundedStatus: "Remboursé", partially_refunded: "Partiellement remboursé", checkout_expired: "Paiement expiré",
  },
};

const COLUMN_LABELS = {
  booking_id: ["Booking ID", "ID de réservation"], customer: ["Customer", "Client"], artist_names: ["Artists", "Artistes"], status: ["Status", "Statut"],
  payment_status: ["Payment status", "Statut du paiement"], service_date: ["Service date", "Date de prestation"], payment_date: ["Payment date", "Date de paiement"],
  refund_date: ["Refund date", "Date de remboursement"], cancelled_at: ["Cancelled at", "Annulé le"], cancellation_reason: ["Cancellation reason", "Motif d’annulation"],
  amount_ht_cents: ["HT", "HT"], vat_amount_cents: ["VAT", "TVA"], amount_ttc_cents: ["TTC", "TTC"],
  refunded_amount_cents: ["Refunded", "Remboursé"], currency: ["Currency", "Devise"], address: ["Service address", "Adresse de prestation"],
  stripe_payment_intent_id: ["Stripe payment ID", "ID de paiement Stripe"], transfer_id: ["Stripe transfer ID", "ID de virement Stripe"],
  artist_id: ["Artist ID", "ID artiste"], artist_name: ["Artist", "Artiste"], payout_date: ["Payout date", "Date de versement"],
  invoice_number: ["Invoice no.", "N° de facture"], invoice_id: ["Invoice ID", "ID de facture"],
  pennylane_delivery_status: ["Pennylane status", "Statut Pennylane"], stripe_reference: ["Stripe reference", "Référence Stripe"],
};

export function t(locale, key) { return DICTIONARY[locale]?.[key] ?? DICTIONARY.en[key] ?? key; }
export function columnLabel(locale, column) { return COLUMN_LABELS[column]?.[locale === "fr" ? 1 : 0] ?? column.replaceAll("_", " "); }
export function statusLabel(locale, status) { return t(locale, status === "refunded" ? "refundedStatus" : status); }
export function reportTitle(locale, kind) { return t(locale, kind); }
export function reportDescription(locale, kind) { return t(locale, `${kind}Description`); }
