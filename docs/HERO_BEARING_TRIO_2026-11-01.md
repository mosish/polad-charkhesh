# Homepage bearing trio — 2026-11-01

The existing homepage banner now renders three independent, distinct illustrative bearing families. Only the central assembly receives scroll-driven separation; both companions remain assembled and visible, including on mobile. Existing layout, bilingual content, pause/speed controls and reduced-motion handling are retained. Manual assembly buttons resume scroll following at the next scroll event.

`heroFamilies` in `lib/hero-presentation.ts` is the extensible selection list. Each reload replaces exactly one physical slot with a family absent from the previous trio, stored in optional sessionStorage. Invalid/unavailable storage starts a fresh unique trio. Adding a new family requires its geometry and bilingual description. These illustrations do not establish manufacturer/SKU identity or engineering approval.

The GPU-independent loading/error fallback also renders three distinct assemblies. Companion geometry/materials are disposed independently. Narrow viewports frame all three models; low-frame-rate scroll damping uses elapsed time without changing product-viewer motion.

Validation: 160 tests pass (local installed QPDF_PATH supplied), TypeScript, lint, production build, bundle budgets and isolated production smoke pass. Full-history and exact-diff Gitleaks scans report no leaks. Browser assertions passed for Persian and English at 1440 and 390 pixels: distinct trio, no horizontal overflow, forward/reverse scroll, one-slot reload and manual-view scroll recovery. Reduced motion and explicitly disabled-WebGL fallback passed separately (the original module-abort fallback test hit cached chunks and was replaced with actual WebGL unavailability). Browser evidence is local and ignored under `outputs/hero-trio/`.

Source sync uses a separate review branch and PR. This change does not deploy the live website; engineering approval remains pending.