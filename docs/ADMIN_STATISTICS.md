# Administration statistics and server status

The top of the authenticated Overview workspace shows real page-view aggregates and live readings from the application host. English and Persian layouts share the existing administration theme. Refresh runs every 30 seconds while the page is visible; a manual refresh is available. Failed refreshes label the previous readings as stale.

## Website counts

- Today, yesterday, the last seven days and the last 30 days use calendar days in `Asia/Tehran`.
- The seven-day chart includes zero-count days. The two production domains have separate 30-day totals, followed by the five most-viewed public paths.
- These are page views, not unique visitors or authenticated users. Counting starts when this version is installed; historical traffic is not invented or imported from logs.
- A visible public document sends one small same-origin request without credentials. Language toggles in that document do not add another view. Admin pages, unknown/archived products and embedded previews are excluded. Query strings, fragments and arbitrary paths are not stored.
- The collector honors DNT/GPC and filters common bot user agents. Blocked scripts, privacy controls and unrecognized automation affect coverage; this is an operational counter, not a billing or audited audience measurement.
- Only day, domain, public path, language and aggregate count are persisted. There are no analytics cookies, visitor IDs, stored visitor IPs, referrers or raw user agents. Rate admission uses a bounded, short-lived in-memory HMAC bucket with a per-process random key.
- Live aggregates retain 90 calendar days. Pruning runs on startup, hourly and on the first accepted report of a new day. Existing encrypted SQLite backups retain these tables under the separately configured backup retention. The manual content JSON export/restore does not export or reset analytics.

## Server readings and access

`GET /api/system/dashboard` uses the existing authenticated/MFA-assured middleware and no-store response policy. Both existing administration roles may read these coarse operational metrics. No credentials, environment values, filesystem paths, account lists or logs are returned.

The application and database status reflect a successful API/database query, not an independent external uptime probe. Application and host uptime are separate. CPU utilization is the aggregate CPU-time delta since the previous sample, with at least one second between measurements; an initial unavailable sample is labeled. Memory includes the OS cache, with application RSS shown separately. Disk availability measures the filesystem containing the configured persistent database. Unsupported/restricted disk metrics show unavailable rather than a fabricated zero.

`POST /api/analytics/pageview` is the sole public collector. It requires an exact same-origin Origin header, a small plain JSON payload, an allowlisted route/language/domain, and bounded per-process admission. It has no public read/export endpoint and remains public when optional Cloudflare administration Access is enabled.

## Installation

The existing database receives two additive tables without replacing content, accounts or MFA state. No new dependency, external analytics service, DNS change, elevated system capability or indexing change is required. Deploy through the existing reviewed VPS release process after taking the normal encrypted backup. The previous release can ignore the new tables on rollback.

Validation includes private/pending-MFA denial, editor access, no-store/no-secret responses, route/origin/body/privacy checks, Tehran midnight boundaries, exact seven/30-day totals, pruning, rate admission and continued public health. Browser acceptance uses only an isolated synthetic account/database; screenshot resource values belong to the preview host, not the production VPS.
