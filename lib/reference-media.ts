// Display derivatives of the same local family references. Original files remain available.
const references = {
  "/reference-images/ball-bearing.jpg": {
    "src": "/reference-images/optimized/ball-bearing-dc8f0de122f1-960.jpg",
    "srcSet": "/reference-images/optimized/ball-bearing-2150fdc7b990-480.jpg 480w, /reference-images/optimized/ball-bearing-dc8f0de122f1-960.jpg 960w",
    "webpSrcSet": "/reference-images/optimized/ball-bearing-07cce3031001-480.webp 480w, /reference-images/optimized/ball-bearing-569bffdc715d-960.webp 960w"
  },
  "/reference-images/cylindrical-roller.png": {
    "src": "/reference-images/optimized/cylindrical-roller-8fc69c3a76fe-960.png",
    "srcSet": "/reference-images/optimized/cylindrical-roller-8fc69c3a76fe-960.png 300w",
    "webpSrcSet": "/reference-images/optimized/cylindrical-roller-424fe0d8cf82-960.webp 300w"
  },
  "/reference-images/needle-bearing.jpg": {
    "src": "/reference-images/optimized/needle-bearing-ec52f8c56f8c-960.jpg",
    "srcSet": "/reference-images/optimized/needle-bearing-ec52f8c56f8c-960.jpg 400w",
    "webpSrcSet": "/reference-images/optimized/needle-bearing-aded5a504347-960.webp 400w"
  },
  "/reference-images/pillow-block.jpg": {
    "src": "/reference-images/optimized/pillow-block-3c86bea8add6-960.jpg",
    "srcSet": "/reference-images/optimized/pillow-block-d6c342d6c5b0-480.jpg 480w, /reference-images/optimized/pillow-block-3c86bea8add6-960.jpg 960w",
    "webpSrcSet": "/reference-images/optimized/pillow-block-97ca6c5322fb-480.webp 480w, /reference-images/optimized/pillow-block-1f0595d3c371-960.webp 960w"
  },
  "/reference-images/shaft-seal.jpg": {
    "src": "/reference-images/optimized/shaft-seal-14c123b892e4-960.jpg",
    "srcSet": "/reference-images/optimized/shaft-seal-4d2fc6cdb0d8-480.jpg 360w, /reference-images/optimized/shaft-seal-14c123b892e4-960.jpg 720w",
    "webpSrcSet": "/reference-images/optimized/shaft-seal-12d747d2ceff-480.webp 360w, /reference-images/optimized/shaft-seal-ae3a667d86d9-960.webp 720w"
  },
  "/reference-images/spherical-roller.png": {
    "src": "/reference-images/optimized/spherical-roller-24727cd4640a-960.png",
    "srcSet": "/reference-images/optimized/spherical-roller-24727cd4640a-960.png 300w",
    "webpSrcSet": "/reference-images/optimized/spherical-roller-286dd6c24965-960.webp 300w"
  },
  "/reference-images/tapered-roller-bearing.jpg": {
    "src": "/reference-images/optimized/tapered-roller-bearing-744730a090bb-960.jpg",
    "srcSet": "/reference-images/optimized/tapered-roller-bearing-4db4793542da-480.jpg 480w, /reference-images/optimized/tapered-roller-bearing-744730a090bb-960.jpg 960w",
    "webpSrcSet": "/reference-images/optimized/tapered-roller-bearing-07dd57c00cd6-480.webp 480w, /reference-images/optimized/tapered-roller-bearing-cb584149a58c-960.webp 960w"
  }
};
export function referenceMedia(src:string){return Object.prototype.hasOwnProperty.call(references,src)?references[src as keyof typeof references]:null;}
