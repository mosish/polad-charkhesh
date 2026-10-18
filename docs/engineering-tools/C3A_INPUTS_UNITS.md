# C3-A — bilingual numerical inputs and unit conversion

**Date:** 2026-10-18 · **Scope:** ENG-05 and the numerical-input/state portion of ENG-04. Implementation and local acceptance complete; publication evidence is recorded below after deployment. Engineering approval remains pending and the production calculation-profile registry stays empty.

## Input contract

`lib/engineering-input.ts` is shared by manual life, product load/speed inputs, fit limits and the converter. Raw text remains editable; parsing does not rewrite it. Latin, Persian and Arabic digits may be mixed. Both `.` and `٫` are decimal marks. An optional sign (including Unicode minus), decimal fraction and `e`/`E` exponent are accepted. Edge whitespace is trimmed. Commas, Arabic grouping marks, internal whitespace, unit text, hexadecimal/binary notation and incomplete numbers are rejected rather than guessed or partially parsed. Blank is a separate state, never zero. Inputs exceeding 128 characters, nonfinite values and nonzero values that underflow to zero are invalid. Manual C/P/speed and fit diameters must be positive; radial/axial loads may be zero.

The text fields expose decimal keyboards, LTR numeric entry, localized errors, `aria-invalid` and linked error descriptions. Converter output is announced politely and uses explicit Persian/English number formatting. Output rounds to at most 12 significant digits; very small/large numbers use scientific notation. Calculations and swap use the unrounded JavaScript numeric result. This is IEEE-754 floating-point arithmetic, not arbitrary-precision arithmetic.

Converter drafts are separate for each quantity. Unit choices and inputs persist while switching tools or languages on the mounted page; fit and manual drafts also survive tool changes. Clear removes the current value. Reload/navigation resets transient drafts. Persistent cases and import/export belong to ENG-11.

## Definitions and supported units

Primary reference: [NIST SP 811 Appendix B.9](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9), with [footnotes, especially 24](https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes), checked 2026-10-18. The implementation derives factors from definitions instead of copying rounded table factors: inch = 0.0254 m; foot = 0.3048 m; lbf = 4.4482216152605 N; mechanical hp = 550 ft·lbf/s. Rotation uses one revolution = 2π radians. SI prefix factors are powers of ten.

| Quantity | Units | Independent fixed examples used in tests |
| --- | --- | --- |
| Length | µm, mm, m, in | 25.4 mm = 1 in; 2 in = 50.8 mm; 0.02 mm = 20 µm |
| Force | N, kN, lbf | 2 kN = 2000 N; 1000 N = 1 kN; 1 lbf = 4.4482216152605 N |
| Pressure | Pa, kPa, MPa, bar, psi | 1 bar = 100 kPa; 2 MPa = 20 bar; 1 psi ≈ 6894.757293168361 Pa |
| Torque | N·m, N·mm, lbf·ft | 2 N·m = 2000 N·mm; 1000 N·mm = 1 N·m; 1 lbf·ft ≈ 1.3558179483314 N·m |
| Power | W, kW, mechanical hp | 2 kW = 2000 W; 500 W = 0.5 kW; 1 hp ≈ 745.6998715822702 W |
| Absolute temperature | °C, °F, K | 0 °C = 32 °F; 212 °F = 100 °C; 0 K = −273.15 °C; −459.67 °F = 0 K; −40 °C = −40 °F |
| Temperature difference | Δ°C, Δ°F, ΔK | 10 Δ°C = 18 Δ°F; −18 Δ°F = −10 ΔK; 1 ΔK = 1 Δ°C |
| Rotational speed | rpm, rad/s, rev/s | 60 rpm = 2π rad/s; 1 rev/s = 60 rpm; π rad/s = 30 rpm |

Pressure derives psi from lbf/in²; torque derives lbf·ft from force × length. Absolute temperature applies offsets; differences apply scale only. Below-absolute-zero values are rejected, including identity conversions. Signed differences and other signed quantities are allowed. Force does not offer kg (mass), and hp is explicitly mechanical rather than metric. Unknown/cross-quantity units, overflow and conversion underflow are rejected. Unit conversion alone does not establish a safe operating condition.

## Verification

- **120/120 tests passed**, including 13 C3-A groups: locale grammar, invalid/blank states, localized manual/fit parity, fixed benchmarks for every quantity, every supported direction, round trips, limits and display precision. Fixed comparison tolerance is max(1e-10 absolute, 1e-12 relative); factors are not used to generate their own expected fixtures.
- TypeScript, zero-diagnostic full lint, production build, bundle budgets and isolated production smoke passed on Windows. Initial payload remains 84.3 KB gzip; largest JS chunk 403.5 KB gzip, within budgets.
- Browser checks: mixed Persian/Arabic manual inputs produced L10 = 1000 million revolutions and L10h ≈ 16,667 h for C=20 kN, P=2 kN, ball bearing, 1000 rpm. Localized fit inputs produced 10–30 µm clearance. The unapproved 6204 product still shows the unavailable/verified-manual-input path.
- Converter checks: ۲۵٫۴ mm → 1 in; reverse swap → 25.4 mm; Persian 0 °C → ۳۲ °F; below-zero and comma inputs show errors; clearing removes the result. Quantity, language and tool changes retain their drafts. Keyboard traversal reaches the conversion controls/reference link.
- English/Persian layouts checked at 360, 768 and 1440 px. No page-level horizontal overflow; the existing mobile tool strip scrolls within its container. No browser console errors in the local acceptance session. This is targeted C3-A acceptance, not completion of C4 or engineering sign-off.

## Release and next package

Owner explicitly authorized deployment of completed C1-D/C0-C work and C3-A. Stage a pinned GitHub source, run Ubuntu checks and an isolated owner-data startup probe, keep verified backups on the VPS, compare all table/upload fingerprints across activation, and check both domains. No catalog-field, database migration, image, approval, indexing or infrastructure-setting changes are part of this package.

Next executable package: **C3-B — independent manual target-life worksheet and explicit result assumptions**, the manual portion of ENG-06. Product-specific static/speed/life expansion remains gated on reviewed methods, applicability and operating envelopes. C2 identity decisions and C0 engineering acceptance remain open in parallel.
