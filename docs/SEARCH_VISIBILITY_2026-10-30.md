# Search visibility follow-up — 30 October 2026

The owner authorized diagnosing and fixing public Google visibility on both company domains. Public indexing was already enabled on 27 October; today's inspection does not reclassify unreviewed engineering data as approved.

## Later same-day inspection and first ranking-work package

A fresh signed-in Search Console inspection now confirms **both the Persian homepage and `/catalog` are indexed**, in addition to the ball-bearing hub. The homepage crawl is displayed as 30 October, 15:47:18, and catalog crawl as 15:53:01; both are Googlebot smartphone, successful/indexing allowed, with Google-selected canonical matching the inspected HTTPS URL. The UI did not label the timezone beside those times. No already-accepted Persian request was repeated.

Performance baseline, Web, selected 1–28 October (the charts expose only 26–28 October): Persian domain **2 impressions, 0 clicks, 0% CTR, average position 1**, with no query rows. Both impressions belong to the old HTTP homepage, one in Iran and one in the US, all Desktop. English domain **0 impressions / 0 clicks**, with no query/page/country/device rows; its displayed position 0 is not a measured ranking. This is insufficient evidence for the broad bearing keyword or a growth claim.

Both sitemap Success/117 reports were reconfirmed. Twelve priority public responses passed a new HTTP check, with matching indexable HTML/canonical/hreflang on the eight HTML pages; HTTP homepages redirect 301 to same-domain HTTPS. This smaller no-timeout sample does not close the earlier intermittent-delivery concern.

The English homepage still exposes the historical 21 October noindex crawl record. One later retry in this continuation did not show an acceptance receipt; no accepted request or indexed English homepage is claimed.

The first source package adds bilingual bearing-type identification cards, exact sourced product-example links and a company contact prompt to the existing ball-bearing hub, including initial HTML. A range-compatible qs update resolves a fresh dependency-audit finding. Source checks and responsive review are recorded in the [Persian baseline, phased plan, cost priorities and implementation report](SEO_GROWTH_PLAN_2026-10-30.fa.md). The package was subsequently deployed to both domains with the owner's authorization. [Activation evidence](SEO_GROWTH_RELEASE_2026-10-30.md) records 234 public/10 private checks from both the VPS and workstation, preserved data/configuration and live bilingual review. Engineering approval remains pending.

## Earlier same-day inspection (before the later confirmation)


- Both verified Search Console domain properties show their sitemap as **Success**, last read **29 October 2026**, with **117 discovered pages** each. Sitemap processing has recovered from the earlier fetch failures. Discovered pages are not an indexed-page count.
- Search Console reports `https://poladcharkhesh.ir/catalog/ball-bearings` as **URL is on Google / Page is indexed**, with one valid breadcrumb item and HTTPS. The earlier empty `site:` search was not a complete inventory of Google's index and must not be interpreted as proof that the entire Persian domain is absent.
- The Persian homepage's stored Google record still refers to the **18 October** crawl and its old `X-Robots-Tag: noindex`; the English homepage record refers to **21 October**. Those historic records do not describe the current response.
- Google accepted a new Persian homepage indexing request and explicitly confirmed that the URL was added to its priority crawl queue. Actual homepage inclusion remains pending.
- Persian Search Console reports **No issues detected** for both Manual actions and Security issues.
- Google Public DNS and Cloudflare's public recursive DNS return the correct origin address for both domains, HostIran delegation and no AAAA record. No DNS record change was needed.

## Live HTTP and server verification

A fresh external audit checked all **234 public sitemap URLs**: each ultimately returned HTTP 200, an indexable HTTP header and HTML robots tag, and exactly one canonical matching the clean URL. Public robots files allow crawling and advertise the correct sitemap for each language. Ten additional checks preserved noindex on admin, private API, preview and missing-page responses; anonymous private API reads remained unauthorized and missing pages returned 404.

The first audit stopped on a network timeout. A second audit with bounded retries completed and recorded **four timeout attempts**: Persian catalog twice, Persian engineering once, and English catalog once. Subsequent attempts succeeded. This verifies indexability while retaining evidence of intermittent delivery; it does not establish that the timeout issue has been permanently resolved.

The installed application revision remains `c914767c8afc04cdc9234a57ccd0385422e5ffe3`. Nginx and the application are active. During the Persian homepage live test, reverse DNS with forward confirmation verified Google crawler addresses, and 29 corresponding recent Google-agent requests in the inspected interval returned HTTP 200. The standalone Search Console live test nevertheless ended with a generic “Something went wrong”; the separate Persian homepage indexing request then succeeded. HTTP success is not a claim that every rendered feature passed Google's test.

The raw public-page check report and screenshots are kept locally under ignored `outputs/indexing-followup-2026-10-30/`. Private server logs, credentials, database files, uploads and backups are not included in this documentation or GitHub.

## Remaining Google-side work

Google also accepted the Persian `/catalog` indexing request and confirmed its priority crawl queue entry. Its stored record had said that the URL was unknown to Google. Neither this confirmation nor the homepage confirmation proves that those two pages are already indexed.

The English homepage submission failed with **“We had a problem submitting your indexing request. Please try again later.”** One retry after the failure produced the same error. No accepted English homepage request is claimed; retry later through Search Console rather than repeatedly resubmitting or weakening server protections. Its sitemap is already successfully processed and several English product/category URLs were visibly present in Google search results.

Google controls crawling, inclusion and ranking. Recrawling may take days to weeks, and repeated accepted submissions do not increase a URL's queue priority. The existing successful sitemaps cover the wider catalog; individual requests are reserved for a few important missing pages.

## Next phase: Persian bearing-search visibility

The owner wants the site to compete for searches such as **بلبرینگ**. This is a separate ranking project, with the existing Persian `/catalog/ball-bearings` hub as the initial landing page rather than creating duplicate keyword pages.

1. Record Search Console query/page impressions, clicks, CTR and average position as a baseline. Distinguish brand searches, bearing types, exact product codes and the broad keyword.
2. Review actual Persian search intent and competing results. Improve the existing hub's useful selection guidance, exact product links and company contact information; preserve source-backed specifications and review states.
3. Improve delivery reliability and mobile interaction performance, including the timeouts observed in today's audit and the supplied PageSpeed reports. Measure both successful full loads and failures.
4. Add useful, original guides for demonstrated customer questions and connect them to relevant category/product pages. Avoid duplicated pages, unsupported technical claims, fabricated reviews, hidden keyword text and purchased link schemes.
5. Use verified company listings and consistent public business details. The existing owner-managed listing scope remains as documented in `BRAND_SEO.md`; no directory account, public review or third-party business listing was created in this follow-up.
6. Evaluate progress with Search Console data after Google has crawled the changes. No fixed ranking position, deadline or outcome for every user's search is promised.

References: [Google URL Inspection](https://support.google.com/webmasters/answer/9012289), [Request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [Sitemap report](https://support.google.com/webmasters/answer/7451001).
