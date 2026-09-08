import type { BearingProduct } from '../domain/product';
export const normalizeSearch = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/[\s/\-]/g, '');
export function searchProducts(
  products: BearingProduct[],
  q: string,
  category = 'all',
  d = '',
  D = '',
  B = '',
) {
  const n = normalizeSearch(q);
  const score = (p: BearingProduct) => {
    const code = normalizeSearch(p.code);
    if (code === n) return 100;
    if (code.startsWith(n)) return 80;
    if (code.includes(n)) return 60;
    return normalizeSearch(
      [
        p.nameEn,
        p.nameFa,
        p.category,
        p.schematicType,
        ...p.applicationsEn,
        ...p.applicationsFa,
        ...p.brands,
        `${p.d}x${p.D}x${p.B}`,
      ].join(' '),
    ).includes(n)
      ? 20
      : 0;
  };
  return products
    .filter(
      (p) =>
        !p.isArchived &&
        (category === 'all' || p.category === category) &&
        (!d || p.d === Number(normalizeSearch(d))) &&
        (!D || p.D === Number(normalizeSearch(D))) &&
        (!B || p.B === Number(normalizeSearch(B))) &&
        (!n || score(p) > 0),
    )
    .sort((a, b) => (n ? score(b) - score(a) : 0));
}
export function fitRange(
  holeMin: number,
  holeMax: number,
  shaftMin: number,
  shaftMax: number,
) {
  if (
    ![holeMin, holeMax, shaftMin, shaftMax].every(Number.isFinite) ||
    Math.min(holeMin, shaftMin) <= 0 ||
    holeMin > holeMax ||
    shaftMin > shaftMax
  )
    throw new Error('Invalid limits');
  const min = (holeMin - shaftMax) * 1000,
    max = (holeMax - shaftMin) * 1000;
  return {
    min,
    max,
    kind: min >= 0 ? 'clearance' : max <= 0 ? 'interference' : 'transition',
  };
}
