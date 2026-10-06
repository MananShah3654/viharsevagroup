// Thin fetch client for the production data API. Handles auth header,
// timeout, JSON parsing, and friendly errors. Token is injected via a getter
// set by the AuthProvider so this module stays import-cycle free.

import { DATA_API } from "@/src/core/config";

let tokenGetter: () => string | null = () => null;
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class OfflineError extends Error {
  constructor() {
    super("offline");
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, timeoutMs = 20000 } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await fetch(`${DATA_API}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    // Network failure or abort -> treat as offline.
    throw new OfflineError();
  }
  clearTimeout(timer);

  const text = await resp.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!resp.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      (typeof data === "string" ? data : `Request failed (${resp.status})`);
    throw new ApiError(resp.status, String(detail));
  }
  return data as T;
}
