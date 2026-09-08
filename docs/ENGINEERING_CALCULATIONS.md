# Engineering calculations

Basic rating life: `L10 = (C/P)^p` in millions of revolutions. `L10h = L10 × 10^6 / (60n)`. Ball exponent is 3; roller exponent is 10/3. Reliability factors supported: 90%=1, 95%=0.64, 98%=0.37, 99%=0.25. The reliability-adjusted result is not a full ISO 281 modified life calculation.

Reference for basic life: [SKF basic rating life](https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf). [SKF cylindrical bearing load discussion](https://evolution.skf.com/en/axial-load-carrying-capacity/) distinguishes non-locating NU/N arrangements. Published manufacturer references support the formulas; imported product ratings have not been independently reverified.

Supported combined-load branches use product-specific spherical and tapered factors. Tapered calculation requires acknowledgment that the arrangement and induced axial loads have been reviewed. Cylindrical, needle and CARB calculations are restricted to radial load. Flat thrust requires pure axial load. Spherical thrust rejects invalid radial-to-axial ratios and missing factors. Deep-groove combined loads use the product f0 factor and a bounded manufacturer-style interpolation table.

Angular-contact and self-aligning families intentionally request a manufacturer-verified equivalent load rather than guessing arrangement-specific factors. The known-equivalent-load tool can compute basic life once the engineer has established P. Housings, seals and lubricants are excluded from bearing-life calculations. All inputs require finite values; zero speed, negative loads and zero total load are rejected.

Static safety is `C0/P0`. Results exceeding lubricant-specific catalog speed limits are flagged. These calculations do not establish minimum-load, fatigue, lubrication, mounting, fit, temperature or failure safety for a real installation.

The thermal view is expressly illustrative: `25 + 10r + 65r²` °C where `r = rpm / grease-reference-speed`. It is not a validated physical thermal model. Ambient conditions, load, lubricant, fit, shaft/housing, cage and heat dissipation determine actual temperature.

The motion and axial half-section diagrams are idealized ball-bearing explanations. The dimensional envelope uses the selected record and is marked not to scale. They are not CAD manufacturing drawings or product-specific 3D models.
