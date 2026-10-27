# Brand search and directory reference

Owner-requested brand update, 2026-10-27. Directory listings will be created or managed by the owner.

## Persian homepage metadata

Title: **پولاد چرخش آرین تک | تأمین تخصصی انواع بلبرینگ و رولبرینگ صنعتی**

Description: شرکت پولاد چرخش آرین تک؛ مرکز تخصصی تأمین، مشاوره فنی و فروش انواع بلبرینگ، رولبرینگ، یاتاقان و کاسه نمد صنعتی برندهای SKF، FAG، TIMKEN، NSK و NTN در تهران.

The default upgrade replaces only the known previous Persian defaults. Custom CMS titles/descriptions, English metadata, catalog metadata and engineering metadata remain editable and are preserved.

The existing JSON-LD graph uses one `LocalBusiness` entity, a subtype of `Organization`. It includes the other language's business name as `alternateName`, the published company logo, company address with province/country, and the primary sales contact with Persian/English availability. Province and country are editable under **Admin → Company → Address & maps**. Existing saved values take precedence over defaults. Do not add a second, conflicting organization script.

## Consistent public business details

| Field | Value |
| --- | --- |
| Persian business name | پولاد چرخش آرین تک |
| English business name | Polad Charkhesh Arian Tech |
| Primary business telephone | 09127195313 / +989127195313 |
| Office telephone | 02177209117 / +982177209117 |
| Persian address | تهران، منطقه نارمک، خیابان دردشت، پلاک ۴۳۳ |
| English address | No. 433, Dardasht Street, Narmak, Tehran, Iran |
| Province / country | تهران / Tehran / IR |
| Persian website | https://poladcharkhesh.ir/ |
| English website | https://poladcharkhesh.com/ |
| Email | info@poladcharkhesh.ir |
| Hours | شنبه تا چهارشنبه، ۰۸:۰۰ تا ۱۶:۰۰ / Saturday–Wednesday, 08:00–16:00 |
| Suggested category | تأمین‌کننده بلبرینگ و قطعات صنعتی — choose the closest actual directory category |

Use the actual company name as the listing name, without appended search keywords. Use the primary business telephone consistently and add the office telephone as an additional number where supported. Check for an existing listing before creating a duplicate. Confirm the precise office entrance on the map; the website's current generic map links are not verified business profiles.

Suggested listing description:

> پولاد چرخش آرین تک در تهران؛ تأمین تخصصی بلبرینگ، رولبرینگ، یاتاقان و کاسه نمد صنعتی و ارائه مشاوره فنی برای شناسایی و انتخاب قطعات صنعتی.

| Directory | Status / next action |
| --- | --- |
| [Neshan business management](https://business.neshan.org/) | Login is required; owner will complete the listing and confirm the map pin. |
| [Balad](https://balad.ir/) | Owner will check for an existing location and submit or update the business details. |
| Google Business Profile | Iran is currently unsupported in [Google's country policy](https://support.google.com/business/answer/6270107?hl=en); do not create a false foreign address. This restriction is specific to Business Profile, not a claim that ordinary Google Maps places are unavailable. |
| Industrial trade portals | Choose a relevant portal and verify its listing and account requirements before publication; none were submitted in this task. |

After a listing is approved, retain its exact public URL and update the corresponding company map link. Only confirmed company profile URLs should be added to `sameAs`; directory homepages and generic coordinate-search URLs do not establish company identity.

## Release boundaries

These changes improve brand identity signals but do not guarantee a search position. Search indexing remains explicitly gated; engineering approval and indexing authorization are separate from this metadata update. Check both the HTTP `X-Robots-Tag` and HTML robots metadata when an indexing release is eventually approved.

References: [Google Organization guidance](https://developers.google.com/search/docs/appearance/structured-data/organization), [Schema.org LocalBusiness](https://schema.org/LocalBusiness).
