import { REPORTS, defaultFilters } from "./reporting.js";

const CACHE_VERSION = 1;
const CACHE_PREFIX = "glame-admin-report-state";

function defaultView(kind) {
  return {
    filters: defaultFilters(kind),
    columns: [...REPORTS[kind].defaultColumns],
    page: 0,
  };
}

export function defaultReportState() {
  return {
    activeKind: "transactions",
    views: Object.fromEntries(Object.keys(REPORTS).map((kind) => [kind, defaultView(kind)])),
  };
}

function cacheKey(email) {
  return `${CACHE_PREFIX}:v${CACHE_VERSION}:${email.trim().toLowerCase()}`;
}

function normalizeView(kind, value) {
  const defaults = defaultView(kind);
  const filters = value?.filters && typeof value.filters === "object" ? value.filters : {};
  const validColumns = Array.isArray(value?.columns)
    ? value.columns.filter((column) => REPORTS[kind].columns.includes(column))
    : [];
  return {
    filters: {
      from: typeof filters.from === "string" ? filters.from : defaults.filters.from,
      to: typeof filters.to === "string" ? filters.to : defaults.filters.to,
      dateDimension: REPORTS[kind].dimensions.includes(filters.dateDimension)
        ? filters.dateDimension
        : defaults.filters.dateDimension,
      artistId: typeof filters.artistId === "string" ? filters.artistId : defaults.filters.artistId,
      status: typeof filters.status === "string" ? filters.status : defaults.filters.status,
    },
    columns: validColumns.length ? validColumns : defaults.columns,
    page: Number.isInteger(value?.page) && value.page >= 0 ? value.page : 0,
  };
}

export function restoreReportState(email) {
  const defaults = defaultReportState();
  if (!email) return defaults;
  try {
    const stored = JSON.parse(localStorage.getItem(cacheKey(email)) ?? "null");
    if (!stored || stored.version !== CACHE_VERSION || typeof stored !== "object") return defaults;
    return {
      activeKind: Object.hasOwn(REPORTS, stored.activeKind) ? stored.activeKind : defaults.activeKind,
      views: Object.fromEntries(Object.keys(REPORTS).map((kind) => [kind, normalizeView(kind, stored.views?.[kind])])),
    };
  } catch {
    return defaults;
  }
}

export function persistReportState(email, state) {
  if (!email) return;
  localStorage.setItem(cacheKey(email), JSON.stringify({ version: CACHE_VERSION, ...state }));
}
