# Persian copy and PDF-label correction — 20 October 2026

## Delivery boundary

This source package corrects known Persian dictionary placeholders and clarifies the generated PDF action. It has been tested locally; it is not a production deployment. Engineering approval, indexing and the existing VPS-only backup instruction remain unchanged.

## Implemented corrections

- Corrected the eight reported dictionary entries: the three legacy headline fragments, Roller bearings, BASIC RATING LIFE, SIDE VIEW, the dimensional-envelope caption and the axial-section caption.
- Browser inspection also found English-only “Ball · p = 3” and “Roller · p = 10/3” options in the Persian manual calculator. Their Persian labels are now “بلبرینگ · p = 3” and “رولبرینگ · p = 10/3”.
- New databases receive the corrected defaults. An atomic, one-time migration repairs existing entries only when their original, English and Persian values still match the known shipped placeholders. Custom CMS wording is preserved. The marker `content.persian-copy-2026-10-20` prevents later owner changes from being overwritten on restart; changed entries are counted and audited.
- The product action is now **Catalog summary PDF / خلاصه کاتالوگ (PDF)**. It still generates the existing company catalog summary. Manufacturer attachment links remain conditional on `pdfUrl`; the existing missing-document explanation remains.

This migration changes content settings and migration/audit metadata only. It does not modify products, formulas, manufacturer approval, media or company contact details. A future deployment must back up the database on the VPS before startup and verify the content delta, rather than asserting that every database table remained unchanged.

## Fact-check of the seven supplied claims

| Claim | Evidence and disposition |
| --- | --- |
| English values in Persian dictionary | Confirmed in the live embedded data and source. Ten known placeholders are repaired. Dictionary presence is not proof that every key is rendered: the current Persian homepage headline already uses the Persian CMS title, and some reported keys are legacy entries. |
| noindex blocks indexing | Confirmed in current meta and HTTP headers. This is an existing launch gate, not an accidental setting to remove during a translation fix. |
| Direct VPS delivery | Earlier same-day DNS/HTTP checks showed origin delivery. Current responses still return nginx; the Cloudflare dashboard and firewall were not changed. Direct delivery does not itself prove a vulnerability, and the application already has login throttling and security headers. WebGL rendering runs in the visitor's browser; asset delivery and API requests are separate server workloads. A proxy/firewall rollout needs validated DNS, TLS, real-client-IP handling and recovery access. |
| PDF buttons fail because pdfUrl is empty | Incorrect description of the generated PDF action. `Product.tsx` calls `datasheet`, which uses jsPDF; `pdfUrl` is for a separate attached manufacturer document. A direct generation check with no pdfUrl produced an 11,697-byte PDF with a valid PDF header. The label was clarified to avoid implying manufacturer provenance. |
| Thousands of uncompressed translation keys slow FCP/LCP | Overstated. Fresh live responses contained 479 copy entries, approximately 80,760 UTF-8 bytes. The public snapshot is approximately 428,798 bytes, including the catalog and other settings. Decoded home HTML measured 448,071 bytes on .com and 451,182 on .ir. Raw curl requests explicitly accepting gzip confirmed Content-Encoding: gzip; transferred bodies measured 86,172 and 86,978 bytes respectively. These are payload measurements, not FCP/LCP benchmarks. An application/json script is data, not visible page text. Further payload reduction can be profiled separately without dropping CMS edits, language-switch data or catalog availability. |
| .ir email on .com is a schema error | Not established. Both domains use the same configured business contact address, info@poladcharkhesh.ir. A separate .com mailbox was not verified. Changing the address without confirming delivery could create a broken contact channel. |
| VPS-only backups share the host's failure risk | Valid operational concern. Off-site storage would change the owner's existing backup-location instruction and requires an agreed destination, encryption/key custody and retention/restore policy. No private backups were copied or uploaded. |

The initial PowerShell web-request result exposed decompressed content and did not retain a useful compression-header value. A subsequent raw curl header/body check resolved that ambiguity; absence in the first result was not treated as evidence that compression was disabled.

## Verification

- **122 tests pass**, including placeholder repair, owner-override preservation, malformed-input preservation and a persisted-database restart test proving the correction runs once.
- TypeScript, lint, production build and bundle budgets pass. Initial JavaScript remains approximately 84.3 KB gzip; the largest lazy chunk remains approximately 403.5 KB.
- Isolated production smoke passes using disposable local data.
- English and Persian product pages show the correct PDF action labels. Persian product schematics display the translated side-view/envelope captions.
- At a requested 390-pixel browser viewport override, the Persian page's content and scroll widths both measured 375 pixels (scrollbar excluded); no horizontal overflow was observed. The viewport override was reset afterward.
- Persian manual-calculator options now render both translated bearing-type labels.
- PDF generation was checked independently of manufacturer attachments. This is not a fresh engineering acceptance of the PDF's catalog values.

Local previews use disposable seed data, not a downloaded production database. Existing product images and technical values in that preview are not evidence of a production catalog change.

## Remaining work outside this patch

The earlier audit's image-decoding validation defect, password/MFA hardening, GitHub required-check enforcement and exact product-identity review remain separate tasks. Engineering acceptance remains pending. No changes to public indexing, DNS/firewall, email accounts or private backup destinations are included.
