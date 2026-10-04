import type { BearingProduct } from '../domain/product';

export const gapLabels = {
  image: ['Product image missing', 'تصویر محصول ثبت نشده'],
  specifications: ['Specifications incomplete', 'مشخصات ناقص'],
  documents: ['Document missing', 'سند ثبت نشده'],
  translations: ['Language content incomplete', 'محتوای زبان ناقص'],
} as const;
export type CatalogGap = keyof typeof gapLabels;
export function productGaps(p: BearingProduct): CatalogGap[] {
  const gaps: CatalogGap[] = [];
  const images = [p.imageUrl, ...(p.images || [])];
  if (!images.some(url => url && !url.startsWith('/assets/images/') && !url.startsWith('/reference-images/')))
    gaps.push('image');
  const rolling = ['ball', 'roller', 'spherical', 'cylindrical', 'thrust'].includes(p.category);
  if ((p.category !== 'lubricant' && !(p.d > 0 && p.D > p.d && p.B > 0)) ||
      (rolling && (!(p.crKn > 0 && p.corKn > 0) ||
        !(p.speedLimitingRpm || p.speedGreaseRpm || p.speedOilRpm) ||
        !p.cageMaterialEn?.trim() || !p.clearanceOptions?.length))) gaps.push('specifications');
  if (!p.pdfUrl && !p.technicalSources?.some(source => source.url)) gaps.push('documents');
  if (![p.nameEn, p.nameFa, p.descriptionEn, p.descriptionFa].every(text => text?.trim())) gaps.push('translations');
  return gaps;
}
/** Discovery suggestions only, never a mechanical interchangeability claim. */
export function relatedComponents(p: BearingProduct, catalog: BearingProduct[], limit = 3) {
  return catalog.filter(x => x.id !== p.id && !x.isArchived && x.category === p.category)
    .map(x => ({ product: x, score: (x.schematicType === p.schematicType ? 100 : 0) +
      (x.d === p.d ? 30 : 0) + (x.D === p.D ? 15 : 0) + (x.B === p.B ? 5 : 0),
      distance: Math.abs(x.d - p.d) + Math.abs(x.D - p.D) }))
    .sort((a, b) => b.score - a.score || a.distance - b.distance || a.product.code.localeCompare(b.product.code))
    .slice(0, limit).map(x => x.product);
}
