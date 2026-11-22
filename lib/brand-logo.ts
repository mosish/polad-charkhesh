// Optimized variants apply only to the bundled logo; owner uploads are untouched.
export const brandVariants = [
  {
    "width": 64,
    "url": "/brand/logo-64-45ec62b6f81e.webp",
    "bytes": 3210
  },
  {
    "width": 128,
    "url": "/brand/logo-128-76a82273a678.webp",
    "bytes": 7992
  },
  {
    "width": 256,
    "url": "/brand/logo-256-a64b082d1d71.webp",
    "bytes": 19226
  }
];
export function brandLogo(source?: string) {
  return !source || source === '/brand/logo.png'
    ? {
        src: brandVariants[1].url,
        srcSet: brandVariants
          .map((v) => v.url + ' ' + v.width + 'w')
          .join(', '),
        sizes: '68px',
      }
    : { src: source };
}
