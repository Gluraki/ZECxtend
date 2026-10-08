const API_URL = import.meta.env.VITE_API_URL

export const MAX_LIMIT = 1000

const SERVICE_SUFFIX = / - (gateway|[a-z]+-service)$/i

type Query = Record<string, string | number | undefined>

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  query?: Query
  body?: unknown
  form?: Record<string, string>
}

type TokenListener = (token: string | null, expired: boolean) => void

class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let accessToken: string | null = null
let pendingRefresh: Promise<string | null> | null = null
const listeners = new Set<TokenListener>()

export function setAccessToken(token: string | null, expired = false) {
  accessToken = token
  listeners.forEach((listener) => listener(token, expired))
}

export function subscribeToken(listener: TokenListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })
  return url
}

function buildInit({ method = "GET", body, form }: RequestOptions): RequestInit {
  const headers = new Headers()
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)

  let payload: BodyInit | undefined
  if (form) {
    payload = new URLSearchParams(form)
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json")
    payload = JSON.stringify(body)
  }

  return { method, headers, body: payload, credentials: "include" }
}

interface ValidationIssue {
  msg: string
}

async function toApiError(response: Response) {
  const data = await response.json().catch(() => null)
  const detail: unknown = data?.detail
  let message = response.statusText || "Request failed"
  if (typeof detail === "string") {
    message = detail
  } else if (Array.isArray(detail)) {
    message = detail.map((issue: ValidationIssue) => issue.msg).join(", ")
  }
  return new ApiError(message.replace(SERVICE_SUFFIX, ""), response.status)
}

async function send(path: string, options: RequestOptions) {
  try {
    return await fetch(buildUrl(path, options.query), buildInit(options))
  } catch {
    throw new ApiError("Cannot connect to the server", 0)
  }
}

export function refreshAccessToken() {
  pendingRefresh ??= send("/refresh", { method: "POST" })
    .then(async (response) => {
      if (!response.ok) return null
      const data: { access_token: string } = await response.json()
      return data.access_token
    })
    .catch(() => null)
    .finally(() => {
      pendingRefresh = null
    })
  return pendingRefresh
}

async function sendAuthorized(path: string, options: RequestOptions) {
  const hadToken = accessToken !== null
  const response = await send(path, options)
  if (response.status !== 401 || !hadToken) return response

  const token = await refreshAccessToken()
  if (!token) {
    setAccessToken(null, true)
    throw new ApiError("Your session has expired. Please log in again.", 401)
  }
  setAccessToken(token)
  return send(path, options)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await sendAuthorized(path, options)
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function requestFile(path: string, query?: Query) {
  const response = await sendAuthorized(path, { query })
  if (!response.ok) throw await toApiError(response)
  const disposition = response.headers.get("Content-Disposition") ?? ""
  const filename = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? "export"
  return { blob: await response.blob(), filename }
}
