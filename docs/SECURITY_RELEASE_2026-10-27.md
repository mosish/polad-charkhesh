# Security activation and verification — 27 October 2026

The owner approved PR #2 and the concrete production activation procedure.
Security changes were staged and checked before activation. Search indexing and
engineering approval remain separate release gates.

## Source and running components

- Security application change: `3ecb2b40a6d5c037fe725adebdf79def60157cb3`, merged in [PR #2](https://github.com/mosish/polad-charkhesh/pull/2).
- A concurrent Persian brand/SEO update was preserved. The application observed
  at the final server check is `367021c6fad31fecdcdfbbefd00d0f769e618232`,
  which includes the security application change.
- The standalone operations monitor uses the corrected implementation from
  `16c1203553eb0a136bc93e53acbfb5f0748c58d4`; its source and closeout are in
  [PR #4](https://github.com/mosish/polad-charkhesh/pull/4).
- Source synchronization does not automatically deploy the website.

## Completed changes

1. The locked graph's four newly published advisories were addressed with scoped
   overrides: `body-parser` 2.4.0 under Express and DOMPurify 3.4.17 under jsPDF.
   Plain JSON clients continue to work. Compressed JSON is rejected before
   decompression, with a 415 response covered by regression testing.
2. The previously prepared mandatory-MFA, lockout, upload normalization and
   restricted PDF-processing package was activated. Persistent MFA encryption
   configuration was generated on the server without disclosure. Enrollment and
   recovery-code storage remain actions for each account's owner.
3. Verified encrypted backups and an isolated restore/startup drill passed on
   the VPS. The existing daily schedule now runs the encrypted backup verifier.
   Original rollback material and older backups were preserved.
4. Five-minute VPS-local monitoring checks trusted HTTPS, certificate lifetime,
   service health, disk space, encrypted-backup freshness and structured security
   warnings. Reports and logs remain local; no external messages or backup
   transfers were configured. Automatic timer execution was observed.
5. Header, server HTML and robots.txt now consistently honor the single indexing
   switch. It remains disabled. Existing security headers were retained.
6. GitHub main requires pull requests and the three CI jobs, including the new
   checksum-pinned full-history Gitleaks check. Administrators are subject to the
   checks; force pushes and branch deletion are disabled.

## Monitoring verification and corrections

The first monitor entrypoint comparison did not account for the production
`current` symlink: Node resolved the module URL while retaining the launch alias.
The correction resolves the entrypoint's real path. A regression test executes
the actual script through a temporary directory alias and requires its launch
marker, without network requests or production filesystem access.

The monitor retains an empty capability set. It consumes the application's
existing structured journal warnings instead of requesting access to the private
application database. Only event names and timestamps enter the report; account
identifiers and other payload fields are discarded. A parser regression test
checks this boundary. The actual restricted systemd service produced a healthy
report, and a later scheduled run produced a fresh healthy report.

## Verification evidence

| Check | Result |
| --- | --- |
| Security package before activation | 138 tests, types, lint, build, bundle budgets and isolated production smoke passed on Windows and the actual Ubuntu VPS; Ubuntu GitHub CI passed |
| Combined source including concurrent SEO and monitor regressions | 142 tests passed locally, no skips; types and lint passed; PR CI remains the merge gate |
| Final public route checks | 226 page/language combinations per domain, 452 total, passed after the concurrent SEO release |
| Public TLS | TLS 1.0/1.1 rejected; TLS 1.2/1.3 accepted with certificate/hostname validation enabled |
| Public exposure checks | Tested environment/Git/package/server-source paths and actual entry-script source-map URLs returned 404 |
| Anonymous private API checks | Status, backup, media and inquiry reads denied; no owner account was used |
| Data preservation | Product, administrator, inquiry and media row hashes matched the pre-activation baseline; SQLite integrity passed |
| Public images | All 105 unique displayed image URLs passed bounded pixel decoding |
| Browser checks | Persian/English desktop; Persian 320/390/768 layouts; search, product dialog/Escape focus recovery, valid manual-life result and unapproved-product refusal |
| Isolated administration | Synthetic MFA/recovery sign-in, settings save/reload/restoration, invalid dimensions, upload normalization, filename-confirmation gate, Persian mobile and logout checked |
| Secret scan | Reachable history scanned with redacted output; only the published RFC 6238 test vector is narrowly allowlisted |

Certificates had more than 77 days remaining at the final operations check.
Backups, monitoring and renewal timers were enabled and their last runs succeeded.
The operational records and private configuration remain on the VPS.

## Acceptance still open

- Owner authenticator enrollment and private recovery-code handling.
- Engineering reviewer acceptance and exact stock identity decisions. The
  existing technical ledger remains 61 partial, 47 ambiguous and two blocked;
  this security release does not certify any product or enable a calculation profile.
- Nine exact-image replacements and product-document provenance remain open.
  A decoded image or a populated field is not manufacturer verification.
- Full accessibility/physical-device acceptance, cold-host recovery and any
  forensic compromise investigation require their own evidence. Targeted
  checks do not close the complete C4/C5 matrix.
- DNS provider delegation is transitioning to HostIran. Authoritative apex/www
  records were checked; this work did not change DNS or configure Cloudflare Access.
- Search indexing remains disabled until the outstanding release acceptance and
  owner indexing decision are recorded.

Dependency versions here describe the tested lockfile and staged build. Deployed
source lineage and public behavior are separately recorded; a fresh inspection of
the final release's installed library files is not claimed.

## Advisory references

- [body-parser request-decompression denial of service](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828)
- [DOMPurify template-expression handling](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7)
- [DOMPurify detached subtree handling](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr)
- [DOMPurify XHTML/SMIL handling](https://github.com/cure53/DOMPurify/security/advisories/GHSA-c6gr-qvv4-5v3f)

DOMPurify advisory severities describe the upstream configurations. The current
catalog-summary generator uses PDF text/image methods; exploitation of these
HTML-sanitizer configurations was not demonstrated in this application.
