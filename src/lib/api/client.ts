export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let authToken: string | null = null;

export function setClientToken(token: string | null) {
  authToken = token;
  if (token) {
    sessionStorage.setItem('jp_auth_token', token);
  } else {
    sessionStorage.removeItem('jp_auth_token');
  }
}

export function getClientToken(): string | null {
  if (!authToken) {
    authToken = sessionStorage.getItem('jp_auth_token');
  }
  return authToken;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getClientToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    throw new ApiError(0, `Не удалось соединиться с сервером (${url}): ${errorMsg}`);
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }

    if (response.status === 401) {
      setClientToken(null);
    }

    throw new ApiError(response.status, errorDetail || `Ошибка запроса (${response.status})`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
