import type {ComponentProps} from 'react';
import {referenceMedia} from '../../lib/reference-media';

/** Responsive copies only for known family references; uploaded/remote photos stay untouched. */
export default function ReferenceImage({src,alt,sizes='(max-width: 760px) 90vw, 640px',...props}:ComponentProps<'img'>&{src:string;alt:string}){
  const media=referenceMedia(src);
  return media?<picture className="reference-picture">
    <source type="image/webp" srcSet={media.webpSrcSet} sizes={sizes}/>
    <img {...props} src={media.src} srcSet={media.srcSet} sizes={sizes} alt={alt} decoding="async"/>
  </picture>:<img {...props} src={src} alt={alt} decoding="async"/>;
}
