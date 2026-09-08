import type { BearingProduct } from '../domain/product';
export function mediaFor(p: BearingProduct, content?: any) {
  if (p.imageUrl && !p.imageUrl.startsWith('/assets/images/'))
    return { url: p.imageUrl, reference: false };
  if (p.category === 'ball')
    return { url: content?.media?.ballUrl ?? '/reference-images/ball-bearing.jpg', reference: true };
  if (p.schematicType === 'tapered')
    return {
      url: content?.media?.taperedUrl ?? '/reference-images/tapered-roller-bearing.jpg',
      reference: true,
    };
  return { url: '', reference: true };
}
