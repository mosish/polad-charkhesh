# Company domain connection — 2026-10-14

> **2026-10-15 update:** The English registrar blocker is resolved and both language domains now serve trusted HTTPS. English origin activation, renewal and preserved-data checks passed. English Cloudflare remains DNS only pending edge-certificate validation; the zone is active. [Current evidence](ENGLISH_DOMAIN_2026-10-15.md). Earlier blocked-domain statements below record the previous state.

**Current status: Persian domain live; English domain blocked by the registrar.** [Persian website](https://poladcharkhesh.ir/) · [Admin panel](https://poladcharkhesh.ir/admin/). `.ir` defaults to Persian; `.com` remains the intended English origin. Do not redirect one language apex to the other. The [temporary IP website](https://213.176.28.119/) remains available. Domain activation used application revision `174a233291ccd9ca81de25a3c669568e3d61548a` without rebuilding/resetting data. The later [mobile 3D compatibility release](MOBILE_ANIMATION_2026-10-14.md), `aac7b756d6b96fa02481007064996597c8327372`, is now installed with unchanged domain routing and owner rows.

## Cloudflare activation and current blocker

Both owner-created Cloudflare zones lacked an apex A record. Added `A @ → 213.176.28.119` to each, retaining the existing www records. Assigned nameservers for both zones are `andy.ns.cloudflare.com` and `mckinley.ns.cloudflare.com`.

| Domain | Current registry evidence | Cloudflare configuration | HTTPS |
| --- | --- | --- | --- |
| `.ir` and `www` | Direct parent query at `a.nic.ir` now returns the assigned Cloudflare NS pair | Active; apex/www A records point to the VPS and are Proxied; **Full (strict)** saved | Valid origin certificate covers both names; public homepage/admin work |
| `.com` and `www` | Direct parent query at `a.gtld-servers.net` still returns `ns1.nonverifieddomain.com` and `ns2.nonverifieddomain.com` | Apex/www point to the VPS, **DNS only**; activation awaits delegation | Certificate and final English vhost remain gated |

Submitting the assigned Cloudflare NS pair on the actual `.com` HostIran record produced:

> updateDomainNameServers : Domain is suspended. Nameserver update is not allowed.

The panel labels that domain active, but the registrar rejects its NS change. The underlying suspension reason is not established. Do not assume an email-verification cause, unlock transfer or change ownership. The owner confirmed that a support ticket was already sent; the agent did not send a duplicate.

## Persian HTTPS and checks completed

- Issued Let's Encrypt lineage `polad-ir` for the Persian apex and www, expiring **2027-01-12**. Keys remain private under `/etc/letsencrypt/`.
- Activated `/etc/nginx/sites-available/polad-ir` and its enabled symlink. [Reviewed configuration](../deploy/nginx-ir.conf.example). HTTP-01 paths remain reachable; other HTTP requests redirect to HTTPS. The www HTTPS host redirects to the Persian apex with path/query preserved.
- Narrowed the earlier pending `polad-domains` vhost to `.com` and its www. The existing IP/default vhost stays enabled.
- Installed [Cloudflare client-IP handling](../deploy/cloudflare-realip.conf.example) using the official [IPv4](https://www.cloudflare.com/ips-v4) and [IPv6](https://www.cloudflare.com/ips-v6) lists. Only those networks may supply `CF-Connecting-IP`; the loopback application receives the sanitized address. Refresh those ranges if Cloudflare changes them; never trust every source address.
- Saved **Full (strict)** after the valid origin certificate was installed. This satisfies [Cloudflare's matching-origin-certificate requirements](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).
- Nginx validation/reload passed. `certbot renew --cert-name polad-ir --dry-run --run-deploy-hooks` passed, including the reload hook; the existing timer renews all lineages.
- External `node deploy/check-live.mjs https://poladcharkhesh.ir` passed **after proxy activation at 2026-10-14T13:04:53.224Z**: 110 products, 226 language/page variants and five assets; trusted TLS, metadata, SEO files/custom 404, admin routes, security headers and unauthenticated private-API denial.
- Chrome rendered the default Persian homepage. Existing-owner login succeeded on `/admin/` and saving unchanged company settings returned the success message, with no cross-origin rejection. No new administrator or role was created.
- The Products workspace loaded the preserved 110-record catalog. Bash syntax checks for both helpers passed; the English Nginx example passed a separate syntax-only check with the existing Persian certificate path substituted **only for that isolated check**, not activated for English. Both helper refusals were tested; live vhost checksums stayed unchanged and Nginx, application and renewal timer remained active.
- A Cloudflare-served www request returned 301 to `https://poladcharkhesh.ir/product/6204-2rs?lang=fa`, preserving the path/query. Chrome's normal `https://www.poladcharkhesh.ir/` visit also redirected and rendered the Persian homepage successfully.

### Network verification scope

The workstation's default DNS still cached the previous apex origin IP `213.176.28.119` during the final check. Thus the 226-page suite verifies the public Persian domain with trusted origin TLS; it is **not** a claim that every page was tested through Cloudflare. Separate curl requests using the freshly observed authoritative Cloudflare address `188.114.98.0` retained normal certificate validation and returned `Server: cloudflare`, health 200 and the expected www 301. Chrome's normal www navigation succeeded too.

Some other Cloudflare-address requests from this network timed out or received an empty response. A subsequent Node-based attempt to run the full suite through the fresh Cloudflare address ended with a closed connection before page checks began; it is not counted as a pass. No workstation DNS settings or certificate-validation protections were changed. These observations do not prove global connectivity or load capacity; investigate resolver/network paths if a particular visitor still cannot connect.

Noindex remains while manufacturer-content, lint and full-audit acceptance are open. Domain connectivity does not close those separate gates. Operational screenshots, private configuration backups and keys are excluded from GitHub.

## Complete the English origin after registrar recovery

Keep both `.com` records DNS only until trusted origin HTTPS is installed. The prepared [English configuration](../deploy/nginx-com.conf.example) uses a separate `polad-com` certificate. The root-only [English activation helper](../deploy/connect-english-domain.sh) is installed as `/usr/local/sbin/polad-connect-com` for this existing VPS only:

```bash
sudo /usr/local/sbin/polad-connect-com
```

It requires both public resolvers to return only the VPS IPv4 for the English apex/www with no unverified AAAA route. It checks the existing renewal/Persian setup before requesting a certificate, activates only English, removes the pending English symlink and checks both origins locally. Routing failures restore the previous configuration. Its actual current run stopped at the DNS gate; English activation has **not** passed.

After successful activation, run external checks and the new lineage's renewal dry-run:

```bash
node /opt/polad-charkhesh/current/deploy/check-live.mjs https://poladcharkhesh.com
sudo /opt/polad-certbot/bin/certbot renew --cert-name polad-com --dry-run --run-deploy-hooks
```

Check English default language, www path/query preservation, owner login and protected unchanged-settings saving. Then set that zone to **Full (strict)** before enabling its proxy. Preserve unrelated mail records. No automatic watcher or later deployment is configured.

The legacy combined helper now refuses to run when an independent language vhost exists. **Do not run `/usr/local/sbin/polad-connect-domains` on this VPS:** its combined layout would conflict with live Persian routing.

## Earlier preparation evidence — superseded for `.ir`

The sections below preserve the state before Cloudflare/registry activation. Their original all-domain pending status and combined-helper workflow are historical; use the independent English workflow above now.

## Verified DNS evidence

The owner confirmed changing both domains' nameservers. Read-only inspection of HostIran's registrar screens confirmed `ns1.hostiran.net` and `ns2.hostiran.net` for both domains. No registrar, mail, ownership or transfer-lock setting was changed by the agent.

Both HostIran authoritative servers answer the apex A records with `213.176.28.119`. Each `www` CNAME points to its matching apex. No apex AAAA or CAA records were returned by HostIran. These correct zone records do not, by themselves, establish registry delegation.

| Query | Observed result |
| --- | --- |
| Cloudflare / Google public resolution of `.ir` | NXDOMAIN |
| Direct `.ir` parent query at `a.nic.ir` | NXDOMAIN; no delegation returned |
| Cloudflare / Google public resolution of `.com` | SERVFAIL; no reachable authoritative server |
| Direct `.com` parent query at `a.gtld-servers.net` | `ns1.nonverifieddomain.com`, `ns2.nonverifieddomain.com` |
| Verisign RDAP for `.com` | The same two old nameservers; client delete/transfer/update prohibited; last changed 2026-10-09 |

The cause of the provider/registry discrepancy is not confirmed. These observations do not establish that the `.ir` domain is unregistered or that an email-verification hold is the cause. The registrar needs to confirm actual registry publication/activation. Do not remove unrelated DNS/mail records or unlock domain transfer to work around it.

The direct parent-registry queries still returned the same results at **2026-10-14T11:38:55Z**. This was a fresh query to the parent authorities, not only a cached local-browser lookup.

## Server work completed

- Added `/etc/nginx/sites-available/polad-domains` and its enabled symlink for all four apex/www names. HTTP-01 challenge paths are served from `/var/www/letsencrypt`; other HTTP requests temporarily redirect to the already trusted IP HTTPS address. A pending domain TLS vhost explicitly rejects the handshake until the correct domain certificate is issued.
- Tested all four challenge routes and temporary redirects using explicit host resolution to the VPS. The four challenge routes also passed from outside the VPS. Existing IP HTTPS health remained OK.
- Saved the reviewed [domain HTTPS configuration](../deploy/nginx-domains.conf.example) privately at `/root/polad-preparation/nginx-domain-https-ready.conf`. It preserves the existing default/IP vhost, proxies the two apex domains to the existing application and redirects each www name to its own apex. The two language origins remain distinct.
- Nginx syntax passed using the existing IP certificate **only for the syntax check**. The final domain configuration is not enabled, and the IP certificate was not presented as a valid domain certificate.
- Updated the existing `polad-certbot.service` to renew all certificate lineages instead of only `polad-ip`. Systemd validation and a manual renewal-service run passed; its existing timer and Nginx deployment hook remain active.
- Installed the [activation helper](../deploy/connect-existing-domains.sh) as root-only `/usr/local/sbin/polad-connect-domains`. Shell syntax passed. Its real run refused the unresolved public DNS before requesting a certificate or changing HTTPS configuration; the pending vhost checksum was unchanged.

No domain certificate has been issued yet. [HTTP-01 validation](https://letsencrypt.org/docs/challenge-types/) requires the certificate authority to reach the domain's validation URL. Public DNS must lead to this VPS first. Existing temporary IP TLS, private data, backups and application supervision remain in service.

## Historical combined workflow — no longer applicable to this VPS

This was the prepared workflow before independent Persian activation. It is not a first-install script or background watcher. The command below is retained as historical evidence only and is now guarded against the active independent vhost:

```bash
sudo /usr/local/sbin/polad-connect-domains
```

The helper requests one certificate covering all four names through the existing ACME account, validates and activates the prepared Nginx configuration, verifies local HTTPS health and confirms automatic renewal is enabled. Configuration errors restore the previous vhost. It does not alter registrar/DNS records or reset the owner database.

Then run external trusted-TLS checks for both origins:

```bash
node /opt/polad-charkhesh/current/deploy/check-live.mjs https://poladcharkhesh.ir
node /opt/polad-charkhesh/current/deploy/check-live.mjs https://poladcharkhesh.com
```

Verify www redirects preserve the path/query, `.ir` defaults to Persian and `.com` to English, owner login works without a cross-origin rejection, and certificate-renewal dry-run passes for the new lineage. Keep noindex until the separately documented content/audit acceptance gate is cleared. No domain-live or domain-renewal-dry-run pass is claimed in this record.

## متن پیگیری برای مالک دامنه

> سلام. در پنل ثبت دامنه، NS هر دو دامنه poladcharkhesh.ir و poladcharkhesh.com روی ns1.hostiran.net و ns2.hostiran.net است و هر دو DNS هاست‌ایران رکورد A را با IP 213.176.28.119 پاسخ می‌دهند. با این حال، مرجع .ir برای دامنه پاسخ NXDOMAIN می‌دهد و مرجع .com هنوز ns1.nonverifieddomain.com و ns2.nonverifieddomain.com را نشان می‌دهد. لطفاً وضعیت فعال‌سازی دامنه‌ها و اعمال واقعی NS در ایرنیک/رجیستری را بررسی و نتیجه را اعلام کنید. وب‌سرور و مسیر تأیید SSL آماده‌اند.

This message has not been sent by the agent. The owner can send it to HostIran support if registry publication does not complete. Runtime logs, configuration backups and certificate keys remain private and excluded from GitHub.
