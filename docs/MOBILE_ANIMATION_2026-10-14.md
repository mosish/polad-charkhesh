# Mobile bearing animation — 2026-10-14

The owner confirmed the previous Safari empty-page fix, then clarified that bearing shapes appeared but did not move. The original GPU failure and exact iOS version have not been captured. The existing hero fallback hard-coded `rpm=0` and `paused`, and several other model fallbacks displayed text only. These were confirmed source defects independent of the precise phone exception.

## Correction

- Added a small, GPU-independent SVG projection for ball, spherical roller, thrust, housed and track bearing families, plus mounting accessories. Metallic faces, depth, rolling elements and cage remain visible without WebGL or the lazy Three.js module. These are illustrative models, not manufacturer CAD.
- The hero fallback now rotates, follows scroll only in assembled mode, supports explicit exploded view, and obeys pause and playback speed. The footer fallback closes the same family as the visitor reaches it.
- Product panels retain an exploded illustration instead of an unavailable message. Product viewer projections use the existing catalog geometry, RPM and cage-ratio functions; no catalog records or engineering formulas changed.
- Motion stops outside the viewport, in hidden tabs and with reduced-motion preferences. Explicit Play can enable motion for the selected viewer. The fallback limits drawing to 30 frames per second and does not require GPU contexts.
- GPU scenes remain the preferred renderer on supported devices. Shader errors that do not throw now select the local fallback. Older CSS engines receive explicit banner heights and positioning before modern values.

Three.js's current [WebGLRenderer documentation](https://threejs.org/docs/pages/WebGLRenderer.html) states that WebGL 2 is required. A compatible fallback therefore remains necessary even when the rest of the site runs successfully. Lack of WebGL 2 on the owner's device is an inference, not a captured diagnosis.

## Local verification

- TypeScript, all **59 tests**, production build, size budgets and isolated production smoke passed. Initial JavaScript is **83.0 KB gzip**; largest chunk is **402.7 KB**. No dependencies added.
- New fallback and compatibility files pass targeted lint. Full repository lint still reports **197 findings**, so no full lint pass is claimed.
- In a 390px browser iframe with WebGL unavailable, legacy media listeners and no ResizeObserver, the roller projection's shaft angle advanced. Pause held exactly at `67.597` degrees across observations; Play resumed, 1.5x was selectable, and exploded expansion reached `1.000` in manual mode.
- The footer projection resumed on entering the viewport and completed reassembly (`expansion=0.000`). The product panel kept `6204-2RSH / 2RS1`, all dimensions/specifications and four separated parts without WebGL.
- Reduced-motion simulation started stationary at zero degrees; explicit Play changed it to playing. Ball, roller, thrust and housed projections displayed; a deliberately rejected scene module retained the track projection. Document width matched scroll width.

These are controlled Chrome failure-path checks, not a physical Safari certification. The owner still needs to confirm animation on the phone after publication. Private fixture code/screenshots are excluded from source and deployment.

Publication evidence will be added after the pinned revision passes checks on the existing VPS. The previous working release, private owner database, uploaded files and HTTPS/domain configuration must be retained during rollout.
