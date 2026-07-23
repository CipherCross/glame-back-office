import type {BackOfficeSession, Locale} from "common/types/AccountSettings";
import type {ReportKind} from "common/types";
import type {ReactNode} from "react";

export interface SharedLayoutProps {
    session: BackOfficeSession;
    locale: Locale;
    activeReport: ReportKind;
    onReportChange: (report: ReportKind) => void;
    onOpenAccountSettings: () => void;
    onSignOut: () => void;
    children: ReactNode;
}