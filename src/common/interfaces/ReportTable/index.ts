import type {ReportColumn, ReportRow} from "common/types";
import type {Locale} from "common/types/AccountSettings";

export interface ReportTableProps {
    rows: ReportRow[];
    columns: ReportColumn[];
    loading: boolean;
    error: string;
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    locale: Locale;
}
