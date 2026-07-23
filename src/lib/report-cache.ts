import {defaultFilters} from "lib/reporting";
import type {ReportColumn, ReportKind, ReportState, ReportView} from "common/types";
import {CACHE_PREFIX, CACHE_VERSION} from "common/constants/report-cache";
import {REPORTS} from "common/constants/reporting";


function defaultView(kind: ReportKind): ReportView {
  return {
    filters: defaultFilters(kind),
    columns: [...REPORTS[kind].defaultColumns],
    page: 0,
  };
}

export function defaultReportState(): ReportState {
  return {
    activeKind: "transactions",
    views: {
      transactions: defaultView("transactions"),
      payouts: defaultView("payouts"),
    },
  };
}

function cacheKey(email: string): string {
  return `${CACHE_PREFIX}:v${CACHE_VERSION}:${email.trim().toLowerCase()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeView(kind: ReportKind, value: unknown): ReportView {
  const defaults = defaultView(kind);
  const raw = isRecord(value) ? value : {};
  const filters = isRecord(raw["filters"]) ? raw["filters"] : {};
  const validColumns = Array.isArray(raw["columns"])
    ? raw["columns"].filter((column): column is ReportColumn => typeof column === "string" && REPORTS[kind].columns.includes(column as ReportColumn))
    : [];
  // Older saved views were designed for transfers only. They display misleading
  // empty payout/invoice cells once refunds are included in this report.
  const hasMixedOperationLayout = validColumns.includes("operation_type") && validColumns.includes("operation_date");
  const dateDimension = typeof filters["dateDimension"] === "string" && REPORTS[kind].dimensions.includes(filters["dateDimension"] as ReportView["filters"]["dateDimension"])
    ? filters["dateDimension"] as ReportView["filters"]["dateDimension"]
    : defaults.filters.dateDimension;
  return {
    filters: {
      from: typeof filters["from"] === "string" ? filters["from"] : defaults.filters.from,
      to: typeof filters["to"] === "string" ? filters["to"] : defaults.filters.to,
      dateDimension,
      artistId: typeof filters["artistId"] === "string" ? filters["artistId"] : defaults.filters.artistId,
      status: typeof filters["status"] === "string" ? filters["status"] : defaults.filters.status,
    },
    columns: validColumns.length && (kind !== "payouts" || hasMixedOperationLayout)
      ? validColumns
      : defaults.columns,
    page: typeof raw["page"] === "number" && Number.isInteger(raw["page"]) && raw["page"] >= 0 ? raw["page"] : 0,
  };
}

export function restoreReportState(email: string | null | undefined): ReportState {
  if (!email) return defaultReportState();
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(cacheKey(email)) ?? "null");
    if (!isRecord(stored) || stored["version"] !== CACHE_VERSION) return defaultReportState();
    return {
      activeKind: stored["activeKind"] === "payouts" ? "payouts" : "transactions",
      views: {
        transactions: normalizeView("transactions", isRecord(stored["views"]) ? stored["views"]["transactions"] : undefined),
        payouts: normalizeView("payouts", isRecord(stored["views"]) ? stored["views"]["payouts"] : undefined),
      },
    };
  } catch {
    return defaultReportState();
  }
}

export function persistReportState(email: string, state: ReportState): void {
  localStorage.setItem(cacheKey(email), JSON.stringify({ version: CACHE_VERSION, ...state }));
}
