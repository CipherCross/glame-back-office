export interface AdminSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    email: string;
    name: string;
}

export type Locale = "en" | "fr";