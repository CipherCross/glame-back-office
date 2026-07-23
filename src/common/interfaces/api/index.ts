export interface RequestOptions {
    token?: string;
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    responseType?: "json" | "blob";
}
