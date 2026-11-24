/**
 * api.ts — Typed HTTP client for the Aura Studio backend.
 *
 * Uses the Vite proxy (/api → http://localhost:4000) in development.
 * In production, set VITE_API_URL to the deployed server URL.
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',                   // send session cookie
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return json as T
}

export const api = {
  get:    <T>(path: string)                       => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown)        => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown)        => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown)       => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                       => request<T>('DELETE', path),
}
