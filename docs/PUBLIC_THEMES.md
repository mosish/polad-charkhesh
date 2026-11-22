# Public light and dark appearance

The established public design remains the default dark appearance. A bilingual sun/moon button in the shared header switches to a cold silver and navy light palette. It applies to home, catalog, product pages, engineering tools, dialogs and public recovery screens. Layout, product data and engineering behavior are retained.

The selection is saved under `pc-theme` in localStorage for each origin. An external same-origin bootstrap restores it before stylesheet paint without adding inline scripts or weakening CSP. Invalid preferences fall back to dark; blocked storage leaves the current visit's switch usable. Storage changes synchronize other tabs on the same origin. Each domain stores its own preference. Administration retains its established appearance.

The theme control has translated accessible names, a pressed state, keyboard focus and a compact mobile layout. Palette overrides are scoped to the light root attribute, with the established dark styles as the baseline. No automatic animation or theme transition is introduced.

Validation includes bootstrap preference/error/admin cases, the existing regression suite, typecheck, lint, production build/budgets and production smoke. Browser checks cover English and Persian, mobile and desktop, persisted reloads, navigation, catalog/product/engineering screens, storage restrictions and restoring dark appearance. This source change is prepared for review; production publication is separate.
