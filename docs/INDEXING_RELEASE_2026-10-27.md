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

## Search Console follow-up

Search Console submission was not performed: browser automation could not safely
control the current Firefox session and stopped. For each verified domain property:

1. Open **Sitemaps** and submit `https://<domain>/sitemap.xml`.
2. Inspect `https://<domain>/` in **URL Inspection**, run **Test live URL**, and
   request indexing once it reports the page is available to Google.
3. Monitor the indexing report. A previously cached robots result can remain
   visible until Google fetches the updated file.

Inspect a public HTML page to request page indexing; the sitemap belongs in the
Sitemaps report. Allowing crawling and submitting URLs do not guarantee inclusion
or ranking. Google says recrawling can take days to weeks:
<https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl>.

## Rollback

If explicitly requested, restore the private environment and vhost copies from
the server-only evidence directory, run `nginx -t`, restart the application and
reload nginx. Recheck HTML, HTTP headers and robots.txt together. Reinstating a
block does not immediately remove pages already indexed by a search engine.
