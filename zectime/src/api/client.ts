import { fetch } from "@tauri-apps/plugin-http"

export const MAX_LIMIT = 1000

const SERVICE_SUFFIX = / - (gateway|[a-z]+-service)$/i

type Query = Record<string, string | number | undefined>

interface RequestOptions {
    method?: "GET" | "POST" | "PUT"
    query?: Query
    body?: unknown
}

interface ApiConfig {
    url: string
    key: string
}

interface ValidationIssue {
    msg: string
}

let config: ApiConfig = { url: "", key: "" }

export function configureApi({ url, key }: ApiConfig) {
    config = { url: url.replace(/\/+$/, ""), key }
}

async function toError(response: Response) {
    const data = await response.json().catch(() => null)
    const detail: unknown = data?.detail
    let message = response.statusText || `Request failed (${response.status})`
    if (typeof detail === "string") {
        message = detail
    } else if (Array.isArray(detail)) {
        message = detail.map((issue: ValidationIssue) => issue.msg).join(", ")
    }
    return new Error(message.replace(SERVICE_SUFFIX, ""))
}

export async function request<T>(path: string, { method = "GET", query, body }: RequestOptions = {}): Promise<T> {
    const url = new URL(`${config.url}${path}`)
    Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value))
    })

    const headers: Record<string, string> = { "x-api-key": config.key }
    if (body !== undefined) headers["Content-Type"] = "application/json"

    const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) throw await toError(response)
    return response.json() as Promise<T>
}
