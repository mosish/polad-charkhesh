import type { ComponentProps } from 'react';
import { brandLogo } from '../../lib/brand-logo';

export default function BrandLogo({
  source,
  alt,
  ...props
}: ComponentProps<'img'> & { source?: string; alt: string }) {
  const image = brandLogo(source);
  return (
    <picture style={{ display: 'contents' }}>
      {image.srcSet && (
        <source type="image/webp" srcSet={image.srcSet} sizes={image.sizes} />
      )}
      <img {...props} alt={alt} src={source || '/brand/logo.png'} />
    </picture>
  );
}
