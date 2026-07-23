import type {Locale} from "common/types/AccountSettings";

export interface LanguageSwitchProps {
    locale: Locale;
    onChange: (locale: Locale) => void;
    label: string;
}
