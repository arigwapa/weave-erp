// http.ts - wrapper around fetch() that handles auth tokens and errors
// every API call in the app goes through apiGet/apiPost/apiPut/apiDelete
import { getToken } from "./tokenStorage";
import { backendConfig } from "./backendConfig";

// BACKEND-TRACK: all HTTP calls resolve against this single base URL.
const BASE_URL = backendConfig.apiBaseUrl;

// shared request function that all the api helpers use
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // grab the JWT and attach it to the request
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // pull the error message out of non-2xx responses and throw
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let userMessage = "";
    let validationErrors: Record<string, string[] | string> | undefined;

    if (text) {
      try {
        const json = JSON.parse(text);
        userMessage =
          json.message || json.Message || json.title || json.Title || "";
        if (json.errors && typeof json.errors === "object") {
          validationErrors = json.errors as Record<string, string[] | string>;
        }
      } catch {
        userMessage = text;
      }
    }

    const fallback = userMessage || res.statusText || "Request failed";
    const err = new Error(fallback);
    (err as any).status = res.status;
    (err as any).statusText = res.statusText;
    (err as any).validationErrors = validationErrors;
    throw err;
  }

  // only parse if there's actually JSON coming back
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function apiPut<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>("PUT", path, body);
}

export function apiPatch<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export function apiDelete(path: string): Promise<void> {
  return request<void>("DELETE", path);
}
