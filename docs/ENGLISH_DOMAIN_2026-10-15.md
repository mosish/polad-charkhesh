# English domain activation — 2026-10-15

**English:** [poladcharkhesh.com](https://poladcharkhesh.com/) · [Admin login](https://poladcharkhesh.com/admin/)

**Persian:** [poladcharkhesh.ir](https://poladcharkhesh.ir/)

The owner reported that the registrar nameserver problem was resolved. Current public NS resolution now returns `andy.ns.cloudflare.com` and `mckinley.ns.cloudflare.com`. English apex/www A records resolve to `213.176.28.119`; the independent activation helper checked both Cloudflare and Google DNS and rejected unexpected IPv6 routing before continuing. The previous registrar-suspension blocker is superseded.

## Configuration completed

- Ran the already reviewed `/usr/local/sbin/polad-connect-com` on the existing VPS. Its SHA-256 matched the repository helper. No application rebuild, data import or account change was required; installed application revision remains `640b590a37aab56f4241d73565895f5ff6c9d74a`.
- Issued Let's Encrypt lineage `polad-com` covering both the English apex and www, expiring **2027-01-13**. Keys remain private on the server.
- Activated the independent English Nginx vhost and removed the pending English vhost symlink. The configuration was validated and reloaded. English www redirects to the English apex with path/query preserved. The two language apex domains do not redirect to each other except when the visitor deliberately uses the language switch.
- The existing `polad-certbot.timer` renews all lineages. The new English lineage's renewal dry-run, including deployment hooks, succeeded with exit status zero.
- The Persian Nginx configuration checksum stayed unchanged. SQLite integrity and product/admin/settings/media row hashes matched before and after: **110 products, one administrator, zero registered uploads**. Credentials, mail records, uploads and indexing acceptance settings were preserved.
- Saved **Full (strict)** in the English Cloudflare zone. The dashboard confirmed the saved mode and success notification.

## Verification and limits

The complete trusted-TLS suite run from the VPS against the public English hostname passed **226 page/language variants, 110 products and six initial assets** at `2026-10-15T09:01:32.672Z`. This covers metadata, canonical/hreflang, admin route delivery, SEO files, 404, security headers and unauthenticated private-API denial. This is a VPS-origin test, not an independent external-network full-suite result.

Independent Windows curl/PowerShell checks returned HTTP 200 and the expected default English/LTR/canonical HTML on `.com`; the Persian origin returned HTTP 200. The English www product request returned HTTP 301 to `https://poladcharkhesh.com/product/6204-2rs?lang=en`, preserving path/query. Normal Chrome loaded the English homepage, real WebGL 2 model and correct English canonical URL without horizontal overflow. The language switch navigated to `.ir` with Persian/RTL, then back to `.com` with English/LTR.

Two attempts to run the entire Node-based suite from Windows timed out; they are not counted as passes. Normal external browser/curl access succeeded. A new owner-authenticated English admin login/save was not performed, and full browser/accessibility/manufacturer-data acceptance remains separate.

## Cloudflare completion still pending

Cloudflare still displayed the zone as **pending** and its Universal edge certificate as **Pending Validation (TXT)** during this check. Both English records remain **DNS only**. The site is already usable with trusted HTTPS directly from the VPS; enabling the proxy before the edge certificate is ready could interrupt visitors.

After Cloudflare confirms the zone and edge certificate as active, enable the proxy for the existing apex/www records and verify trusted HTTPS, redirects and public/private cache behavior again. No background watcher or scheduled change was created. Noindex remains until the separate content/audit acceptance gate is approved.
