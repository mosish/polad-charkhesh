/** Isolate Latin designations in RTL prose without changing their characters. */
export function technicalTextParts(text: string): Array<{ text: string; ltr: boolean }> {
  const parts: Array<{ text: string; ltr: boolean }> = [];
  let offset = 0;
  for (const match of text.matchAll(/[A-Za-z0-9][A-Za-z0-9₀]*(?:[-/ ][A-Za-z0-9₀]+)*/g)) {
    const index = match.index;
    if (index > offset) parts.push({ text: text.slice(offset, index), ltr: false });
    parts.push({ text: match[0], ltr: true });
    offset = index + match[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset), ltr: false });
  return parts;
}
