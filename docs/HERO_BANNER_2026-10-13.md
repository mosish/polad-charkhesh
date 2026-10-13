# Animated bearing banner — 2026-10-13

The homepage now opens with a full-width 3D bearing composition inspired by the owner's Alpine Bearing screenshot: a large central assembly, quieter bearings behind it on desktop, a dark fade and the existing company headline and search beneath it.

## Behavior

- Ball bearings are the default for new visitors; an existing session's selected family remains respected. Ball and double-row spherical roller bearings lead the family selector, with all six existing family choices retained.
- Steel surfaces use locally generated machining grain, environmental reflections, polished rolling elements, cage pockets/rivets and roller end faces. The shaft, cage and rolling elements animate independently. These are illustrative family models, not manufacturer CAD or an actual operating-RPM simulation.
- Small pause/play controls and 0.5×, 1× and 1.5× presentation speeds. The catalog product viewer retains its existing product-specific geometry and RPM calculation path.
- Assembled and Exploded remain manual previews. Follow scroll stays enabled and resumes on the next scroll; the selected family continues into the page background and bottom reassembly.
- The banner starts assembled and opens while leaving the header without pinning or locking page scrolling. Pause, reduced-motion and hidden/offscreen suspension remain in place.
- Mobile uses one central bearing; secondary bearings are hidden. Family choices scroll horizontally, the camera fits the exploded assembly, and the part key is available in Persian and English. Explicit canvas bounds prevent the oversized canvas measured during desktop-to-mobile resizing.
- Existing CMS hero text, links, visibility and optional photo mode are preserved. No images from the reference, manufacturer assets or new dependencies were added. No local database, product values, uploads or engineering formulas were changed.

## Verification

- TypeScript, 50 regression tests, production build, bundle budgets and isolated production smoke checks passed.
- Initial JavaScript remains within budget at 82.0 KB gzip; the largest lazy chunk is unchanged at 403.2 KB. The scene stays lazy loaded and frame limited.
- Browser review covered assembled ball and spherical-roller compositions, mobile Persian framing, exploded labels, family switching, speed selection and paused animation time staying unchanged.
- Follow scroll remains pressed during manual preview and returns to automatic progress after scrolling. The background retains the selected roller family; the bottom reassembly also renders with the selected family.
- Desktop and 390 px mobile screenshots were captured. No horizontal overflow or browser errors were observed in the checked banner layouts. Reduced-motion handling remains implemented; an OS-level preference change was not part of this browser session.

The existing catalog/media reconciliation, lint backlog, full release audit and hosting/domain checks remain separate launch gates. This update is not a deployment.
