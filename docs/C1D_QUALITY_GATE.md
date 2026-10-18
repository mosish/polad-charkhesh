# C1-D — Restore the required source-quality gate

**Date:** 2026-10-18 · **Status:** implementation and local validation complete; GitHub synchronization is part of delivery. Subsequently deployed with C0-C/C3-A at `46272c6e8a9f0c95da739b1b21539dc2e9dde60d`; see [the release evidence](engineering-tools/C3A_INPUTS_UNITS.md).

## Result

Repository lint decreased from **63 errors to zero diagnostics**. This closes C1's original 197-finding backlog across C1-A/B/C/D. No lint rules, severity levels or ignore patterns were weakened, and no suppression comments were added. GitHub Actions now treats lint as a required step: `continue-on-error` is removed. This is workflow enforcement, not a claim that GitHub branch protection has been configured.

## Changes

- Native status outputs and fieldsets replace redundant roles. SVG drawings have named titles, the GPU scene has a labeled figure, and catalog links have explicit accessible names. Supporting CSS preserves their existing layout.
- The hero angle control is a native button: arrow keys tilt, Enter resets, and the existing pointer interaction remains. Native modal Escape/backdrop dismissal and return focus are preserved.
- Filter pagination resets when its inputs change, including returning to an earlier search. Product image failures are associated with the failed URL. A keyed viewer resets product-specific state. Admin loads carry user and request-version identity so stale responses do not appear after navigation/reload.
- Animation values move into refs after commit. GPU allocation and cleanup follow the scene element's lifetime, preserving WebGL 2 → WebGL 1 → SVG recovery. Observer-free startup uses initial state instead of synchronous effect updates.
- All three editors share a dirty-only unload guard with overlap-safe cleanup. It cancels the event and returns a truthy value through the property handler for legacy compatibility, avoiding direct use of deprecated `returnValue`. This follows the supported handler mechanism in [MDN's beforeunload documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event). Browser unload prompts still have platform limitations; this is not an autosave feature.
- Remaining product/media/PDF/test types are explicit. CSS side-effect imports have a declaration and bundler-compatible extension resolution. Website-preview dependencies and unused declarations are corrected.

## Verification

- Full lint: **zero diagnostics**, 149 files / 187 rules at the recorded run. TypeScript passed.
- **95/95 tests** passed. New tests cover dirty guard cancellation/legacy return, clean cleanup, overlapping editors and preservation of another handler.
- Production build, bundle budgets and isolated production smoke passed. Initial JavaScript: **84.3 KB gzip**; largest chunk: **403.5 KB**; 23 JavaScript chunks.
- Built local preview: English/Persian rendering at 1280 CSS pixels with no horizontal overflow; WebGL 2 canvas; arrow-key tilt and Enter reset; catalog expansion then filter/clear returns to the initial count; product exploded view; Escape and backdrop close the modal and restore trigger focus/body scrolling.
- Local admin: overview/products/company navigation; dirty tab-switch confirmation canceled with the unsaved value retained; original fixture value restored and saved; clean reload succeeds. A dirty reload retained the editor, but the browser adapter did not expose that native dialog, so its visible prompt text is not independently verified.
- Isolated source-level fault probe: context loss switches WebGL 2 to WebGL 1; a second context loss displays SVG with no canvas; unmount/remount returns one canvas; failed GPU context initialization also displays SVG. Expected injected context errors were isolated to this probe. This does not claim fresh Safari-device or full accessibility acceptance.

Logs, local fixtures, fault-injection harness and screenshot remain under ignored `work/readme-review/`. Production SQLite, media, engineering formulas, product identities and the empty approval registry are unchanged by this package.

## Next

Continue C0-C / ENG-03 method evidence and independent benchmarks, then C2 identity/media work and the balanced toolbox modules. Engineering approval remains pending the owner's nominated reviewer. Full application acceptance, operations and indexing remain separate gates in [COMPLETE-01](COMPLETION_PLAN.md).
