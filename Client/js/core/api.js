import { API_BASE } from './config.js';
import { session } from './session.js';

export const SESSION_EXPIRED_EVENT = 'skillbridge:session-expired';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin fetch wrapper around the SkillBridge REST API.
 * - Adds the JWT automatically.
 * - Returns parsed JSON (the backend wraps most payloads as { success, data }).
 * - Throws ApiError with the server's `message` on failure.
 */
export async function request(path, { method = 'GET', body, query, auth = true } = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (auth && session.token) headers.set('Authorization', `Bearer ${session.token}`);

  let response;
  try {
    response = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the SkillBridge API. Check that the server is running.', 0);
  }

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && auth && session.token) {
      session.clear();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(payload?.message || `Request failed (${response.status}).`, response.status);
  }
  return payload;
}

// Most controllers answer { success, data }; a few older ones return the object directly.
export const unwrap = payload => (payload && payload.data !== undefined ? payload.data : payload);
