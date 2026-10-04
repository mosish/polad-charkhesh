import type { BearingProduct } from '../domain/product';
export function mediaFor(p: BearingProduct, content?: any) {
  if (p.imageUrl && !p.imageUrl.startsWith('/assets/images/'))
    return { url: p.imageUrl, reference: p.imageUrl.startsWith('/reference-images/') };
  if(p.category==='seal')return {url:'/reference-images/shaft-seal.jpg',reference:true};
  if(p.schematicType==='spherical')return {url:'/reference-images/spherical-roller.png',reference:true};
  if(p.schematicType==='cylindrical')return {url:'/reference-images/cylindrical-roller.png',reference:true};
  if(p.category==='housing')return {url:'/reference-images/pillow-block.jpg',reference:true};
  if(p.schematicType==='needle')return {url:'/reference-images/needle-bearing.jpg',reference:true};
  if (p.category === 'ball')
    return { url: content?.media?.ballUrl ?? '/reference-images/ball-bearing.jpg', reference: true };
  if (p.schematicType === 'tapered')
    return {
      url: content?.media?.taperedUrl ?? '/reference-images/tapered-roller-bearing.jpg',
      reference: true,
    };
  return { url: '', reference: true };
}
