export function publicError(error: unknown) {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  // SQLITE_CONSTRAINT_UNIQUE / PRIMARYKEY are distinct from BUSY, IOERR and corruption.
  if (value.errcode === 2067 || value.errcode === 1555)
    return { status: 409, error: 'A record with this code or URL already exists.' };
  if (value.errcode === 5 || value.errcode === 6)
    return { status: 503, error: 'Database is busy. Please try again shortly.' };
  if (value.status === 413) return { status: 413, error: 'Request too large.' };
  if (value.status === 400) return { status: 400, error: 'Malformed request.' };
  return { status: 500, error: 'Unable to complete the request.' };
}
