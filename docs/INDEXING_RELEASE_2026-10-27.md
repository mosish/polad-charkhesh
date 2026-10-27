# Public search indexing release — 27 October 2026

The owner explicitly approved: "All public pages on both domains; keep admin/API private."
This authorizes the search-indexing release. Engineering approval remains pending;
opening indexing does not certify product identities, ratings or calculation methods.

## Applied configuration

- Kept application source at `c914767c8afc04cdc9234a57ccd0385422e5ffe3`.
- Changed only `ENABLE_SEARCH_INDEXING=false` to `ENABLE_SEARCH_INDEXING=true`
  in the private VPS runtime environment, then restarted the application.
- Restored the previously commented nginx response header in both domain vhosts:
  `add_header X-Robots-Tag $polad_robots always;`.
- Retained the upstream-driven nginx map. Public HTML receives `index, follow`;
  private responses and responses without an upstream indexing signal fail closed.
- Validated nginx configuration and gracefully reloaded nginx.
- Kept `.env.example` disabled by default for new installations.

Both robots files now allow public crawling, exclude `/api/` and `/admin/`, and
advertise their own domain's sitemap. Public page HTML includes
`index,follow,max-image-preview:large`; the browser snapshot has
`indexingEnabled: true`, so client metadata honors the same release setting.

## Verification

Checks from outside the VPS over trusted HTTPS passed for every sitemap URL:

| Domain | Public pages | Result |
| --- | ---: | --- |
| `poladcharkhesh.ir` | 117 | HTTP 200, indexable HTTP header and HTML, one matching canonical |
| `poladcharkhesh.com` | 117 | HTTP 200, indexable HTTP header and HTML, one matching canonical |

Each sitemap contains the homepage, catalog, engineering page, four category hubs
and 110 product pages. Persian and English canonical origins remain separate.

Fourteen additional responses across both domains retained `noindex, nofollow`:
`/admin`, `/admin/`, `/?preview=1`, an unknown page, `/api/health`,
`/api/system/backup` and `/api/inquiries`. The unknown page returned 404;
anonymous private backup and inquiry reads returned 401. API authentication was
not changed; crawl directives are not access controls.

Application and nginx services were active after activation. A verified backup
and private pre-change configuration copies remain on the VPS only. Catalog,
media, settings and uploaded-file fingerprints matched before and after the
change. SSH login and other runtime configuration were unchanged.

Local generated check results are in ignored
`outputs/indexing-release/live-verification.json`. Private rollback evidence is
kept on the VPS in
`/var/backups/polad-charkhesh/indexing-release-20261027T120658Z/`.
No database, uploaded file or private environment backup was downloaded.

## Search Console submission and remaining Google-side status

After Firefox automation stopped, the owner requested Chrome. Both verified
domain properties were accessible in the signed-in Chrome session. Submitted
`https://poladcharkhesh.ir/sitemap.xml` and
`https://poladcharkhesh.com/sitemap.xml` through the Sitemaps interface. The Persian
submission displayed "Sitemap submitted successfully"; both sitemap reports
registered their submitted URLs. Submission is not successful processing: both
reports still showed "Couldn't fetch" with zero discovered pages at that time.

Google's actual homepage live tests at 15:45 (.ir) and 15:48 (.com), Tehran time,
still reported "Blocked by robots.txt" and disabled Request indexing. The older
Google Index records cited the previous noindex header, from 18 October (.ir)
and 21 October (.com). Neither homepage was confirmed indexed.

The current public robots files returned 200 with the new allow-public rules,
also when independently requested with the Google Inspection Tool user-agent.
This does not impersonate a verified Google crawler or prove Google's own fetch.
A cached robots file appears to explain the discrepancy; it is not directly
confirmed because the new properties' Settings pages showed no robots report yet
and disabled Open report. No manual robots-recrawl request was available there.

Google generally caches robots.txt for up to 24 hours and can retain it longer
when refreshing fails. See
<https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#caching>.
Its robots report supports a recrawl request once that report becomes available:
<https://support.google.com/webmasters/answer/6062598?hl=en>.

Next, rerun each homepage's live test after Google refreshes robots.txt, and
request indexing when available. Check the sitemap processing status as well.
If the block persists after the usual cache period, inspect Google's current
robots version, DNS resolution and server-side Google fetch evidence rather than
assuming it is still a cache delay. Both live-test tabs were left open in Chrome.
Screenshots of submission and live-test results are saved in the ignored
`outputs/indexing-release/` folder.

Inspect a public HTML page to request page indexing; the sitemap belongs in the
Sitemaps report. Allowing crawling and submitting URLs do not guarantee inclusion
or ranking. Google says recrawling can take days to weeks:
<https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl>.

## Rollback

If explicitly requested, restore the private environment and vhost copies from
the server-only evidence directory, run `nginx -t`, restart the application and
reload nginx. Recheck HTML, HTTP headers and robots.txt together. Reinstating a
block does not immediately remove pages already indexed by a search engine.
