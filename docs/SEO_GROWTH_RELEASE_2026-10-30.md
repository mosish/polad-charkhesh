# SEO growth package activation — 30 October 2026

The owner authorized proceeding with the reviewed SEO package. [PR #9](https://github.com/mosish/polad-charkhesh/pull/9) was already merged when this activation began. Its merged application source is **`d999f4d6638add30149f22cab6aeeb8891380048`**; the previous running release was `c914767c8afc04cdc9234a57ccd0385422e5ffe3`.

The new bilingual bearing-identification cards, exact sourced example links and consultation prompt are now live on both [Persian](https://poladcharkhesh.ir/catalog/ball-bearings) and [English](https://poladcharkhesh.com/catalog/ball-bearings) domains. Engineering approval remains pending. This source activation does not establish a ranking, traffic or conversion improvement.

## Activation and preservation

- Verified the existing SSH host-key pin and inspected the actual running revision, services, runtime versions and enabled indexing gate before staging. SSH login and its authentication method were not changed.
- Transferred only a Git archive of the merged source, verified its SHA-256 and rejected private paths, databases and symlinks. No live database, uploaded file, private environment or backup was copied to the workstation or GitHub.
- Staged the new release separately. Eight checks passed on the actual Ubuntu VPS: frozen dependency installation, dependency audit, TypeScript, lint, all **157 tests**, production build, bundle budgets and isolated production smoke. The [merge commit's GitHub Actions](https://github.com/mosish/polad-charkhesh/actions/runs/41063086977) also passed.
- Created a verified encrypted backup with the existing server backup helper. Backup and rollback evidence remain on the VPS under `/var/backups/polad-charkhesh/seo-growth-d999f4d6638a/`.
- Switched the existing `current` release link, restarted the application and checked health. Automatic source rollback was prepared and was not needed.
- Hashes of products, media, settings, administrators, inquiries and uploaded files matched before/after activation. Runtime environment and the installed nginx vhosts/indexing map also matched. The existing `ENABLE_SEARCH_INDEXING=true` release setting remained enabled.
- Application, nginx and the existing five-minute monitor timer are active. No additional traffic-generation or monitoring schedule was installed.

## Verification

| Check | Result |
| --- | --- |
| VPS-local public pages | 234 responses, 117 per domain: HTTP 200, indexable header and HTML robots, one matching canonical and reciprocal language alternatives |
| VPS-local private/missing routes | 10 responses: admin/preview retained noindex, private API reads denied, missing pages returned 404 |
| Independent workstation HTTPS audit | All 234 public pages and 10 private/missing responses passed; **zero retries** in this run |
| Discovery | Both public robots files allow the public site and advertise their own sitemap; each sitemap has 117 distinct URLs |
| Asset delivery and HTTP redirects | 22 checks passed: scripts/styles returned 200 with immutable caching; eligible files were gzip-compressed; HTTP homepages redirect 301 to same-domain HTTPS |
| Initial HTML | The new guide and company contact are present before JavaScript on both domains |
| Chrome, live domains | Persian/English desktop at 1440px and mobile at 390px; correct language/direction/canonical and no horizontal overflow |
| Navigation | Example link opened the actual product record; language switching crossed .ir/.com while preserving the route; company telephone target matched published details |

The asset check initially required gzip even for sub-kilobyte wrappers. Both actual vhosts specify `gzip_min_length 1024`; the criterion was corrected to that verified threshold, retaining the original raw report. No nginx change was needed. All observed asset responses were HTTP 200.

The independent raw reports are local ignored files under `outputs/seo-growth-release-2026-10-30/`; browser images remain local artifacts. Server backup records and private fingerprints were not downloaded. These successful samples do not establish that the earlier intermittent delivery issue is permanently resolved, and they are not mobile Core Web Vitals field measurements.

## Measurement and the proposed Gemini task

Do not create a task that repeatedly opens the site merely to inflate visits. Direct synthetic visits provide no evidence of additional relevant customers or improved organic ranking and can distort the website's statistics. The existing analytics excludes known bots; HTTP release checks used the transparent `PoladReleaseVerificationBot/1.0` user-agent and did not impersonate Googlebot.

The useful task is a periodic review of Search Console queries/pages, real customer questions, exact product evidence and relevant contacts. Google's guidance prioritizes useful, reliable information for people: [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Keep the existing dated [baseline and phased work](SEO_GROWTH_PLAN_2026-10-30.fa.md); compare complete available periods rather than manufacture growth from two impressions.

No paid subscription, advertising campaign, third-party message or fake visit task was created. Persian homepage/catalog/hub indexing was confirmed earlier today; the English homepage's Google-side indexing remains unconfirmed. Successful deployment and live indexability do not replace Google URL Inspection or prove a rank improvement.
