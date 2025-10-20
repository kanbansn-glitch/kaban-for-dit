const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
const IS_DEV = import.meta.env.DEV;

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const hasBody = text.length > 0;

  let data = null;

  if (hasBody && contentType.includes('application/json')) {
    try {
      data = JSON.parse(text);
    } catch {
      // ignore parse error, treat as raw payload
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.message || (IS_DEV ? text || 'Erreur serveur.' : response.statusText || 'Erreur serveur.');
    const error = new Error(message);
    error.status = response.status;
    error.errors = data?.errors;
    error.data = data;
    error.rawBody = hasBody ? text : null;
    error.contentType = contentType;
    throw error;
  }

  return data ?? (hasBody ? text : null);
}

export async function apiRequest(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(`${API_URL}/${path.replace(/^\/+/, '')}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

export function getApiUrl(path = '') {
  return `${API_URL}/${path.replace(/^\/+/, '')}`;
}
