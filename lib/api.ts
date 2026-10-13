export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = any>(
  path: string,
  method = 'GET',
  data?: unknown,
): Promise<T> {
  const verb = method.toUpperCase();
  if ((verb === 'GET' || verb === 'HEAD') && data !== undefined)
    throw new Error('Read requests cannot contain a body.');
  const options: RequestInit = {
    method: verb,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (data !== undefined) options.body = JSON.stringify(data);
  let r: Response;
  try {
    r = await fetch('/api' + path, options);
  } catch {
    throw new Error('Connection unavailable. Please retry.');
  }
  let body: unknown;
  try {
    body = await r.json();
  } catch {
    throw new Error('Unexpected server response. Please retry.');
  }
  if (!r.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      && typeof body.error === 'string' && body.error.trim()
      ? body.error : 'Request failed. Please retry.';
    throw new ApiError(message, r.status);
  }
  return body as T;
}
