import type {AdminSession, Locale} from "common/types/AccountSettings";

export interface AccountSettingsProps {
    session: AdminSession;
    locale: Locale;
    onClose: () => void;
    onEmailChanged: (email: string) => void;
}
