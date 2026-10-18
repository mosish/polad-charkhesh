# Engineering calculations

**Source update — 2026-10-18:** Product calculations now require a reviewed family/arrangement/method profile matching the current technical snapshot; they no longer choose methods from illustration metadata. The production registry is empty pending the owner's nominated engineer, so catalog calculations are currently unavailable in the new source. Manual known-load life remains independent. This source update is not deployed. [Contracts, tests and delivery limits](engineering-tools/foundation/C0B_C1A_DELIVERY.md).

Basic rating life: `L10 = (C/P)^p` in millions of revolutions. `L10h = L10 × 10^6 / (60n)`. Ball exponent is 3; roller exponent is 10/3. Reliability factors supported: 90%=1, 95%=0.64, 98%=0.37, 99%=0.25. The reliability-adjusted result is not a full ISO 281 modified life calculation.

Reference for basic life: [SKF basic rating life](https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf). [SKF cylindrical bearing load discussion](https://evolution.skf.com/en/axial-load-carrying-capacity/) distinguishes non-locating NU/N arrangements. Published manufacturer references support the formulas; imported product ratings have not been independently reverified.

Supported combined-load branches use product-specific spherical and tapered factors. Tapered calculation requires acknowledgment that the arrangement and induced axial loads have been reviewed. Cylindrical, needle and CARB calculations are restricted to radial load. Flat thrust requires pure axial load. Spherical thrust rejects invalid radial-to-axial ratios and missing factors. Deep-groove combined loads use the product f0 factor and a bounded manufacturer-style interpolation table.

Angular-contact and self-aligning families intentionally request a manufacturer-verified equivalent load rather than guessing arrangement-specific factors. The known-equivalent-load tool can compute basic life once the engineer has established P. Housings, seals and lubricants are excluded from bearing-life calculations. All inputs require finite values; zero speed, negative loads and zero total load are rejected.

Static safety is `C0/P0`. Speed assessment distinguishes unknown, within and exceeded: it uses a positive finite limiting speed when available, otherwise the lowest available positive finite lubricant rating. Reference speed alone does not create a limit. The comparison does not establish suitability. These calculations do not establish minimum-load, fatigue, lubrication, mounting, fit, temperature or failure safety for a real installation.

The earlier illustrative Thermal view was removed. An operating-temperature estimate needs ambient conditions, load, lubricant, fit, shaft and housing details, cage behavior and heat-dissipation data; RPM alone cannot establish one.

The Motion view uses an illustrative bearing model whose dimensions and rolling-element arrangement follow the selected catalog record; the Section & dimensions view is a schematic. The internal geometry is not manufacturer CAD or a manufacturing drawing.
