# Banner interaction revision — 2026-10-13

This supersedes the motion controls and continuous-background behavior in the earlier banner report, following the owner's updated request.

- Removed the Follow scroll button and hero family selection buttons. The catalog's product-family filters are unchanged.
- Assembled mode uses scroll progress automatically. Exploded view disables that progress and stays fully separated across scrolling until Assembled is selected. Pause, presentation speed and reduced-motion behavior remain available.
- Removed both the global 3D background and the old SVG background fallback, their page-scroll listener and styles. The separate bottom assembly section remains contained within its own card; when automatic motion is disabled it shows an assembled model.
- A page load chooses a ball, spherical roller, thrust, housed or track bearing. The previous choice is used only to avoid immediate repeats, not to restore a persistent selection. Storage being unavailable does not prevent rendering.
- The bilingual headline uses a shuffled sequence, types at 65 ms per character, holds for 3.2 seconds and erases at 28 ms per character. Admin's Hero section accepts up to six additional phrases per language; blank fields use the supplied engineering phrases. The primary CMS title stays in the sequence and remains the complete accessible heading. Initial server-rendered SEO content remains unchanged.
- Headline motion has a separate pause button, respects reduced motion, and suspends outside the viewport or in a hidden tab. Space for all phrases is reserved to avoid moving the search and calls to action during typing.

## Checks

- 51 regression tests, TypeScript, production build, JavaScript budgets and isolated production smoke passed. Initial JavaScript is 81.6 KB gzip; the largest lazy chunk remains 403.2 KB.
- Browser checks confirmed the selector and background DOM are absent, the Follow scroll button is absent, Exploded view remains at expansion 1.000 after scrolling, and Assembled restores automatic progress.
- Separate page loads produced different bearing types. English/Persian text sequences and headline pause/resume were exercised. Desktop and 390 px phone layouts had no horizontal overflow.
- Reduced-motion behavior was inspected in code; an OS-level preference change was not emulated. Admin phrase persistence uses the existing validated content endpoint; no owner database or media were modified for testing.

This is a source and local-preview update, not a server deployment. Existing release audit and catalog/media gates remain open.
