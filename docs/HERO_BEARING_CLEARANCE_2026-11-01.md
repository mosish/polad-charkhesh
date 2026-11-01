# Bearing trio clearance correction — 2026-11-01

The previous fixed companion offsets allowed the protruding stud of a track roller to enter the central thrust-bearing model. The issue was visible despite the earlier scroll/reload checks passing. Those checks did not establish geometric or visual separation.

The banner now places complete model bounds beside the central model with world-space clearance and a separate perspective-projected silhouette gap. Both bounds are recalculated through scrolling and rotation, and the camera fits the complete trio. Studs, housings and all exploded parts are included. The fallback uses three separate CSS slots. Product-viewer geometry, catalog data, languages and public SEO behavior are unchanged.

Illustrative family geometry was moved without profile changes into `lib/bearing-family-3d.ts`, allowing the regression test to use the actual model meshes. Texture engraving remains browser-only. `lib/bearing-trio-layout.ts` owns clearance and camera framing.

The regression reproduces the reported thrust/track intersection before applying the correction. All 60 distinct trios are tested at 840 combined scroll/rotation poses and five viewport aspect ratios (4,200 layout checks). Assertions independently recompute complete geometry bounds, visible projected gaps, and camera containment. Tests include assembled, intermediate and full expansion states.

Validation: 162 tests, TypeScript, lint, production build, bundle budgets and isolated production smoke pass. An ignored browser harness in `outputs/hero-clearance/` renders the real production renderer, with review sheets for every central family and a full-resolution reproduction of the reported trio at three expansion states. The normal bilingual page and live release are checked separately. This record describes the source correction; activation evidence belongs in its PR.