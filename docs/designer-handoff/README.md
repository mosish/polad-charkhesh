# Designer handoff

Prepared 18 October 2026 for Polad Charkhesh. These two sheets explain the implemented website structure for web designers and developers.

## Deliverables

- [Shareable two-page PDF](polad-charkhesh-designer-handoff.pdf).
- [Public sitemap and interaction model - editable SVG](01-public-sitemap.svg), with [PNG preview](01-public-sitemap.png).
- [Administration and data architecture - editable SVG](02-admin-data-architecture.svg), with [PNG preview](02-admin-data-architecture.png).
- [Reproducible diagram authoring source](build_diagrams.py).

SVGs contain standard shapes, paths and text. Font substitution and text editability depend on the importing design tool. SVG typography uses Arial/Helvetica and Courier-style route labels; the PDF uses standard Helvetica/Courier fonts.

## Reading conventions

- Solid hierarchy lines describe composition, not separate URLs.
- Dashed outlines identify retained direct routes.
- Blue directional arrows show interaction or progression.
- Two-way architecture arrows represent request/response or read/write relationships.
- The public tree groups related sections; it is not an exact page scroll-order specification.
- Design review coverage is a checklist, not a claim that every accessibility or responsive check has passed.

## Source basis

The maps were checked against [routing](../../app/Router.tsx), [home](../../components/platform/Home.tsx), [home sections](../../components/platform/HomeSections.tsx), [engineering](../../components/platform/Engineering.tsx), [admin modules](../../components/admin/Admin.tsx), [public-link mapping](../../lib/public-links.ts), and the [project README](../../README.md). The architecture summarizes the application, not the deployment topology or entity-level database schema.

## Regenerate

Requires Python with ReportLab and Poppler's `pdftoppm` on PATH. From the repository root:

```sh
python -m pip install reportlab
python docs/designer-handoff/build_diagrams.py
pdftoppm -f 1 -l 1 -singlefile -scale-to 1800 -png docs/designer-handoff/polad-charkhesh-designer-handoff.pdf docs/designer-handoff/01-public-sitemap
pdftoppm -f 2 -l 2 -singlefile -scale-to 1800 -png docs/designer-handoff/polad-charkhesh-designer-handoff.pdf docs/designer-handoff/02-admin-data-architecture
```

Inspect both rendered pages after edits. Keep the PDF, SVGs and PNG previews synchronized when publishing documentation changes.
