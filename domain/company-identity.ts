/** Correct the former display name without changing domains, identifiers or other copy. */
export function correctCompanyName(text: string) {
  return text
    .replace(/\bPolad Charkhesh(?: Arian (?:Tech|Tak))?\b/gi, value => value === value.toUpperCase() ? 'POLAD CHARKHESH ARIAN TAK' : 'Polad Charkhesh Arian Tak')
    .replace(/\bPoladCharkhesh\b/g, 'Polad Charkhesh Arian Tak')
    .replace(/پولاد چرخِ?ش(?! آرین تک)/g, 'پولاد چرخش آرین تک');
}

export function correctCompanyCopy<T>(value: T): T {
  if (typeof value === 'string') return (/^(?:https?:\/\/|\/|mailto:|tel:)/i.test(value) ? value : correctCompanyName(value)) as T;
  if (Array.isArray(value)) return value.map(correctCompanyCopy) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /^(?:id|slug)$|(?:url|path|email|phone|domain)(?:en|fa)?$/i.test(key) ? item : correctCompanyCopy(item)])) as T;
  return value;
}
