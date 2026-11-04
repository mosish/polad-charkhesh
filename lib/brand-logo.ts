// Optimized variants apply only to the bundled logo; owner uploads are untouched.
export const brandVariants = [
  { width: 64, url: '/brand/logo-64-01bd347b9757.webp', bytes: 4070 },
  { width: 128, url: '/brand/logo-128-a1b3503ce411.webp', bytes: 10086 },
];
export function brandLogo(source?: string) {
  return !source || source === '/brand/logo.png'
    ? {
        src: brandVariants[1].url,
        srcSet: brandVariants
          .map((v) => v.url + ' ' + v.width + 'w')
          .join(', '),
        sizes: '54px',
      }
    : { src: source };
}
