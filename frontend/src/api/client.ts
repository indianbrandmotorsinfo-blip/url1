import type { TokenResponse, UrlInput, UrlItem } from './types';

const BASE_PATH = '/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function readErrorMessage(response: Response): Promise<string> {
  if (response.status === 429) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  try {
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
      return data.detail;
    }
  } catch {
    // The response body was not JSON; fall through to the generic message.
  }
  return `Something went wrong (error ${response.status}).`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_PATH}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export const api = {
  login: (username: string, password: string) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: { username, password } }),
  me: (token: string) => request<{ username: string }>('/auth/me', { token }),
  listUrls: () => request<UrlItem[]>('/urls'),
  createUrl: (token: string, input: UrlInput) =>
    request<UrlItem>('/urls', { method: 'POST', token, body: input }),
  updateUrl: (token: string, id: number, input: UrlInput) =>
    request<UrlItem>(`/urls/${id}`, { method: 'PUT', token, body: input }),
  deleteUrl: (token: string, id: number) =>
    request<void>(`/urls/${id}`, { method: 'DELETE', token }),
};
