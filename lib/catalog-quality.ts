import type { BearingProduct } from '../domain/product';

export const gapLabels = {
  image: ['Product photo missing', 'تصویر محصول ثبت نشده'],
  specifications: ['Specifications incomplete', 'مشخصات ناقص'],
  documents: ['Product PDF missing', 'PDF محصول ثبت نشده'],
  sources: ['Source link missing', 'پیوند منبع ثبت نشده'],
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
  if (!p.pdfUrl?.trim()) gaps.push('documents');
  if (!p.technicalSources?.some(source => source.url?.trim() && source.reference?.trim())) gaps.push('sources');
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

/** Presence checks are a content checklist, not independent manufacturer verification. */
export function catalogReview(p:BearingProduct){
 const missingFields:string[]=[];
 const dimensional=p.category!=='lubricant';
 if(dimensional){for(const field of ['d','D','B'] as const)if(!(p[field]>0))missingFields.push(field);if(p.D<=p.d)missingFields.push('D must exceed d');}
 if(!(p.weightKg>0))missingFields.push('weightKg');
 if(['ball','roller','spherical','cylindrical','thrust'].includes(p.category)){
  for(const field of ['crKn','corKn'] as const)if(!(p[field]>0))missingFields.push(field);
  if(![p.speedLimitingRpm,p.speedGreaseRpm,p.speedOilRpm].some(value=>value&&value>0))missingFields.push('operating speed');
  if(!p.clearanceOptions?.length)missingFields.push('clearanceOptions');
  for(const field of ['cageMaterialEn','cageMaterialFa','sealingEn','sealingFa'] as const)if(!p[field]?.trim())missingFields.push(field);
 }
 for(const field of ['nameEn','nameFa','descriptionEn','descriptionFa'] as const)if(!p[field]?.trim())missingFields.push(field);
 const photos=[...new Set([p.imageUrl,...p.images||[]].filter((url):url is string=>Boolean(url?.trim())))];
 const exactPhotoCandidates=photos.filter(url=>!url.startsWith('/assets/images/')&&!url.startsWith('/reference-images/'));
 return {id:p.id,code:p.code,category:p.category,archived:Boolean(p.isArchived),gaps:productGaps(p),missingFields,photos,exactPhotoCandidates,pdfUrl:p.pdfUrl||null,
  sources:(p.technicalSources||[]).map(source=>({...source})),
  reviewReasons:[...(p.brands.length>1?['Multiple manufacturers share one specification record']:[]),...(/\//.test(p.code)?['Designation contains alternative suffixes']:[])],
  manufacturerVerification:'Pending independent check; recorded source metadata is not proof of current accuracy'};
}
