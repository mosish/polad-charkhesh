const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object';
const safeKey = (key: string | number) => !['__proto__', 'constructor', 'prototype'].includes(String(key));
/** Editor paths come from controls, not uploaded schemas. Preserve sibling fields. */
export function readEditorPath(value: unknown, path: readonly (string | number)[]): unknown {
  for (const key of path) {
    if (!safeKey(key) || !record(value)) return undefined;
    value = value[key];
  }
  return value;
}
export function updateEditorPath<T>(value: T, path: readonly (string | number)[], next: unknown): T {
  if (!path.length || path.some(key => !safeKey(key))) throw new Error('Invalid editor field.');
  const copy = structuredClone(value);
  const parent = readEditorPath(copy, path.slice(0, -1));
  if (!record(parent)) throw new Error('Editor field no longer exists. Reload the editor.');
  parent[path[path.length - 1]] = next;
  return copy;
}
export const textValue = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
export const stringList = (value: unknown): string[] => Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string') : [];
