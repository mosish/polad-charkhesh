# Company domain connection — 2026-10-14

**Status: server prepared; public DNS delegation blocks domain HTTPS activation.** The existing [temporary HTTPS website](https://213.176.28.119/) remains healthy. Application revision `174a233291ccd9ca81de25a3c669568e3d61548a`, owner data and credentials were not changed by this work.

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

## Finish after registry publication

This helper is for the existing VPS layout only, not a first-install script. It is not scheduled or a background watcher. After both public resolvers return the expected IPv4 for all four names and no unverified AAAA records, run on the VPS:

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
