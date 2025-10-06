import { appConfig } from '@/config/appConfig';

const withTimeout = (ms, promise) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms));
  return Promise.race([promise, timeout]);
};

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const url = path.startsWith('http') ? path : `${appConfig.apiBaseUrl}${path}`;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  // TODO: attach bearer token when available
  const response = await withTimeout(
    appConfig.requestTimeoutMs,
    fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    })
  );

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
  if (!response.ok) {
    const message = data?.message || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}


