# Public light and dark appearance

The public site defaults to Automatic: light from 07:00 inclusive until 19:00 exclusive, dark otherwise, using the visitor device's local time and timezone. These are fixed clock hours, not calculated sunrise/sunset. No location permission or network time service is needed.

The bilingual public header has a three-position pill toggle: moon on the left, Auto in the center, sun on the right in both languages. A sliding thumb marks the selected preference. No time explanation appears in the control. Native radio inputs support keyboard arrows, focus and screen readers, and reduced motion disables the thumb animation. Manual choices remain saved and take priority until Automatic is selected again. Existing light/dark preferences are respected.

The `pc-theme` preference is stored separately for each origin. Missing, invalid or inaccessible stored preferences select Automatic. An external synchronous bootstrap resolves the appearance before stylesheet paint under the existing CSP. It owns the clock and storage policy; React observes that controller rather than duplicating the rules. On an open page, it checks at each minute boundary and refreshes after focus, visibility changes and restored navigation. Storage changes synchronize tabs on the same origin. If storage is blocked, a manual choice remains usable for the current visit. Administration retains its dark appearance.

The cold silver/navy light palette applies to public home, catalog, product, engineering, dialog and recovery views. Existing dark styling, catalog records and engineering behavior are retained. No animated theme transition is added.

Validation covers day/night boundaries, existing manual preferences, automatic resets, storage changes, timer/focus updates, blocked storage and admin isolation, plus the existing regression suite, typecheck, lint, production build/budgets and smoke. Browser checks simulate different visitor timezones and clock transitions, as well as persisted manual overrides and the bilingual mobile selector. Production publication is separate from this review branch.
