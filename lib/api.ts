export async function api<T = any>(
  path: string,
  method = 'GET',
  data?: unknown,
): Promise<T> {
  let r: Response;
  try {
    r = await fetch('/api' + path, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new Error('Connection unavailable. Please retry.');
  }
  const body = await r
    .json()
    .catch(() => ({ error: 'Unexpected server response.' }));
  if (!r.ok) throw new Error(body.error || 'Request failed.');
  return body;
}
