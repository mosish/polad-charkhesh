# Product image label removal — 2026-10-18

The owner clarified that “watermark under all pictures” means labels and source text beneath images, not marks embedded in image files.

Published release: `326782d58fa8065c2219c6011a24a9eff1473ba3` on both language domains. Product cards, product pages and Quick View no longer display supplier/reference image badges, photo notes or source links around their photographs. Initial product HTML no longer emits reference-image captions. Drawing and exploded-view guidance remains in those respective views.

Image files, accessible alternative text, source evidence and the separate Image credits page are preserved. All catalog API records were compared before and after activation and remained identical. No database import was performed. A verified pre-update backup remains on the VPS only; the previous application release is retained for rollback.

Type checking, nine media/SEO tests, production builds and bundle checks passed. The VPS production smoke test passed. Both public health endpoints and product pages passed; the separate credits page still contains the supplier attribution. Persian and English Quick View were checked in the browser after publication.

This owner-requested presentation change supersedes earlier deployment notes stating that source labels are visible beside product images; underlying image provenance and unresolved catalog limitations remain unchanged.
