interface CatalogTool { name: string; description: string; inputSchema: { type: string; properties: Record<string, { type: string }>; required: string[]; additionalProperties: boolean }; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown }
import CategoryIcon from './CategoryIcon';
import Breadcrumbs from './Breadcrumbs';
import ManufacturerLibrary from './ManufacturerLibrary';
import { searchProducts, dimensionOptions, emptyDimensions, normalizeSearch, type DimensionKey, type DimensionFilters } from '../../lib/showroom';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Search,
  Grid2X2,
  List,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { usePlatform, DataState } from './Context';
import { ProductCard, ShowroomProductPanel } from './Product';
import type { BearingProduct } from '../../domain/product';
import { hubPath, productBelongsToHub, type CatalogHub } from '../../domain/catalog-hubs';
import { BallBearingNavigation, CatalogHubGuide, CatalogHubLinks } from './CatalogHubContent';
import TechnicalText from './TechnicalText';
export const categoryNames: Record<string, readonly [string, string]> = {
  ball: ['Ball bearings', 'بلبرینگ'],
  roller: ['Tapered roller', 'رولبرینگ مخروطی'],
  spherical: ['Spherical roller', 'رولبرینگ بشکه‌ای'],
  cylindrical: ['Cylindrical & needle', 'استوانه‌ای و سوزنی'],
  thrust: ['Thrust bearings', 'بیرینگ کف‌گرد'],
  housing: ['Units & housings', 'یاتاقان و محفظه'],
  seal: ['Industrial seals', 'کاسه نمد صنعتی'],
  lubricant: ['Lubricants', 'روانکارها'],
};
export { searchProducts } from '../../lib/showroom';
function columnsForViewport() {
  if (window.innerWidth <= 760) return 1;
  if (window.innerWidth <= 1100) return 2;
  return window.innerWidth >= 1500 ? 4 : 3;
}
export default function Catalog({ embedded = false, hub }: { embedded?: boolean; hub?: CatalogHub }) {
  const { products, t, loading, error } = usePlatform();
  const catalogProducts = useMemo(() => hub ? products.filter(product => productBelongsToHub(product, hub)) : products, [products, hub]);
  const familyScroll = useRef<HTMLFieldSetElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const sizeId = useId();
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [dimensions, setDimensions] = useState<DimensionFilters>(() => ({
    d: normalizeSearch(params.get('d') || ''), D: normalizeSearch(params.get('D') || ''), B: normalizeSearch(params.get('B') || ''),
  }));
  const [sizesOpen, setSizesOpen] = useState(() => ['d', 'D', 'B'].some(key => params.has(key)));
  const [columns, setColumns] = useState(columnsForViewport);
  const [table, setTable] = useState(false),
    [selected, setSelected] = useState(params.get('item') || '');
  const pageKey = JSON.stringify([q, cat, dimensions, columns]);
  const [page, setPage] = useState({ key: pageKey, count: columns * 6, expanded: false });
  if (page.key !== pageKey) setPage({ key: pageKey, count: columns * 6, expanded: false });
  const expanded = page.key === pageKey && page.expanded;
  const visibleCount = page.key === pageKey ? page.count : columns * 6;
  const results = useMemo(
    () => searchProducts(catalogProducts, q, cat, dimensions.d, dimensions.D, dimensions.B),
    [catalogProducts, q, cat, dimensions],
  );
  const sizes = useMemo(() => dimensionOptions(catalogProducts, q, cat, dimensions), [catalogProducts, q, cat, dimensions]);
  const familyMatches = useMemo(() => searchProducts(catalogProducts, q, 'all', dimensions.d, dimensions.D, dimensions.B), [catalogProducts, q, dimensions]);
  const activeSizes = (Object.keys(dimensions) as DimensionKey[]).filter(key => dimensions[key]);
  const hasFilters = !!q || cat !== 'all' || activeSizes.length > 0;
  const clearFilters = () => { setQ(''); setCat('all'); setDimensions(emptyDimensions()); };
  const scrollFamilies = (left: number) => familyScroll.current?.scrollBy({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  useEffect(() => {
    const update = () => setColumns(columnsForViewport());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: CatalogTool, options: { signal: AbortSignal }) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: 'search_bearing_catalog',
          description:
            'Filter the visible bearing catalog by code or technical keywords.',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute(input: unknown) {
            if (!input || typeof input !== 'object' || !('query' in input) || typeof input.query !== 'string' || input.query.length > 200)
              throw new Error('Query must be a short string.');
            setQ(input.query);
            setCat('all');
            setDimensions(emptyDimensions());
            setSelected('');
            return {
              products: searchProducts(catalogProducts, input.query).map((p) => ({
                code: p.code,
                slug: p.slug,
                d: p.d,
                D: p.D,
                B: p.B,
              })),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [catalogProducts]);
  useEffect(() => {
    const next = new URLSearchParams(location.search);
    for (const key of ['q', 'category', 'd', 'D', 'B', 'item']) next.delete(key);
    for (const [key, value] of Object.entries({ q, category: cat === 'all' ? '' : cat, ...dimensions, item: selected })) {
      if (value) next.set(key, value);
    }
    history.replaceState(null, '', location.pathname + (next.size ? '?' + next.toString() : '') + location.hash);
  }, [q, cat, dimensions, selected]);
  const chooseProduct = (product: BearingProduct) => {
    setSelected(product.slug || product.id);
  };
  const currentProduct = catalogProducts.find((product) => !product.isArchived && (product.slug === selected || product.id === selected));
  const preview = !table && !expanded && results.length > columns * 2;
  const renderCount = table ? Math.max(12, expanded ? visibleCount : 12) : expanded ? visibleCount : columns * 3;
  const moreAvailable = preview || results.length > renderCount;
  const showMore = () => {
    setPage({ key: pageKey, expanded: true, count: expanded ? visibleCount + (table ? 12 : columns * 3) : Math.max(visibleCount, table ? 24 : columns * 6) });
  };
  const Container = embedded ? 'div' : 'main';
  return (
    <Container id={embedded ? undefined : 'main'} className={embedded ? 'catalog-workspace embedded-workspace' : 'catalog-workspace'}>
      <section className={embedded ? 'section-heading catalog-intro' : 'page-heading'}>
        {!embedded && <Breadcrumbs route={hub ? hubPath(hub) : '/catalog'} />}
        <div className="section-label">
          {embedded ? '02 / ' : ''}{t(
            'PRODUCT SHOWROOM / TECHNICAL DISCOVERY',
            'کاتالوگ محصولات / جستجوی فنی',
          )}
        </div>
        {embedded ? <h2>{t('Explore every component.', 'همه قطعات را بررسی کنید.')}</h2> : <h1>
          <TechnicalText text={hub ? t(hub.en.title, hub.fa.title) : t('Industrial bearing catalog', 'کاتالوگ بیرینگ صنعتی')} />
        </h1>}
        <p>
          <TechnicalText text={hub ? t(hub.en.description, hub.fa.description) : t(
            'Search by designation, dimensions or application. Explore the details, then speak to our engineering team.',
            'بر اساس شماره فنی، ابعاد یا کاربرد جستجو کنید؛ مشخصات را بررسی کنید و با تیم فنی در ارتباط باشید.',
          )} />
        </p>
        {hub && <a className="catalog-guide-jump" href="#selection-guide">{t('Read the selection guide', 'مطالعه راهنمای انتخاب')} ↓</a>}
      </section>
      {hub?.slug === 'ball-bearings' && <BallBearingNavigation />}
      <CatalogHubLinks current={hub} />
      <section className="catalog-finder" aria-label={t('Find a component', 'یافتن قطعه')}>
        <label htmlFor={sizeId + '-search'}>{t('Search the catalog', 'جستجوی کاتالوگ')}</label>
        <div className="catalog-finder-row">
          <div className="search-field">
            <Search size={20} aria-hidden="true" />
            <input ref={searchInput} id={sizeId + '-search'} type="search" maxLength={200} value={q} onChange={event => setQ(event.target.value)} placeholder={t('Part code, dimensions or application', 'کد قطعه، ابعاد یا کاربرد')} />
            {!!q && <button type="button" aria-label={t('Clear search', 'پاک کردن جستجو')} onClick={() => { setQ(''); searchInput.current?.focus(); }}><X size={16} /></button>}
          </div>
          <button type="button" className="catalog-size-toggle" aria-expanded={sizesOpen} aria-controls={sizeId} onClick={() => setSizesOpen(!sizesOpen)}><SlidersHorizontal size={17} />{t('Filter by size', 'فیلتر ابعاد')}{activeSizes.length > 0 && <span>{activeSizes.length}</span>}</button>
        </div>
        <div id={sizeId} className="catalog-sizes" hidden={!sizesOpen}>
          {(['d', 'D', 'B'] as DimensionKey[]).map((key, index) => <label key={key}><span>{[t('Bore diameter', 'قطر داخلی'), t('Outside diameter', 'قطر خارجی'), t('Width', 'عرض')][index]} <b dir="ltr">{key} / mm</b></span>
            <select value={dimensions[key]} onChange={event => setDimensions({ ...dimensions, [key]: event.target.value })}>
              <option value="">{t('Any size', 'همه ابعاد')}</option>
              {dimensions[key] && !sizes[key].includes(Number(dimensions[key])) && <option value={dimensions[key]}>{dimensions[key]} mm · {t('no matches', 'بدون نتیجه')}</option>}
              {sizes[key].map(value => <option key={value} value={value}>{value} mm</option>)}
            </select>
          </label>)}
          <p>{t('Available sizes follow your search and other filters.', 'ابعاد موجود بر اساس جستجو و سایر فیلترها نمایش داده می‌شوند.')}</p>
        </div>
        <div className="catalog-filter-summary">
          {hasFilters ? <><div className="catalog-active-filters" aria-label={t('Active filters', 'فیلترهای فعال')}>
            {!!q && <button type="button" onClick={() => setQ('')} aria-label={t('Remove search filter: ', 'حذف فیلتر جستجو: ') + q}><span>{q}</span><X size={13} /></button>}
            {cat !== 'all' && <button type="button" onClick={() => setCat('all')} aria-label={t('Remove family filter', 'حذف فیلتر خانواده')}><span>{t(...(categoryNames[cat] || [cat, cat]))}</span><X size={13} /></button>}
            {activeSizes.map(key => <button type="button" key={key} aria-label={t('Remove dimension filter: ', 'حذف فیلتر ابعاد: ') + key} onClick={() => setDimensions({ ...dimensions, [key]: '' })}><span dir="ltr">{key} {dimensions[key]} mm</span><X size={13} /></button>)}
          </div><button type="button" className="catalog-clear" onClick={clearFilters}>{t('Clear all', 'پاک کردن همه')}</button></> : <p>{t('Start with a code, such as 6204, or dimensions: 20 × 47 × 14.', 'با کدی مثل 6204 یا ابعادی مانند 20 × 47 × 14 شروع کنید.')}</p>}
        </div>
      </section>
      <div className="family-bar">
        <div className="family-bar-heading"><span className="section-label">{t('BEARING FAMILIES', 'خانواده بیرینگ')}</span><div className="family-bar-arrows"><button type="button" aria-label={t('Scroll families left', 'پیمایش خانواده‌ها به چپ')} onClick={() => scrollFamilies(-320)}><ChevronLeft size={17} /></button><button type="button" aria-label={t('Scroll families right', 'پیمایش خانواده‌ها به راست')} onClick={() => scrollFamilies(320)}><ChevronRight size={17} /></button></div></div>
        <fieldset ref={familyScroll} className="family-options"  aria-label={t('Bearing families', 'خانواده‌های بیرینگ')}>
          <button type="button" aria-pressed={cat === 'all'} className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}><span className="category-tile-label">{t('All components', 'همه قطعات')}</span><small>{familyMatches.length}</small><CategoryIcon category="all"/></button>
          {Object.entries(categoryNames).filter(([key]) => !hub || catalogProducts.some(product => product.category === key)).map(([key, names]) => <button type="button" key={key} aria-pressed={cat === key} className={cat === key ? 'active' : ''} onClick={() => setCat(key)}><span className="category-tile-label">{t(...names)}</span><small>{familyMatches.filter(product => product.category === key).length}</small><CategoryIcon category={key}/></button>)}
        </fieldset>
      </div>
      <div className="catalog-layout">
        <div className="catalog-results">
          <div className="catalog-results-heading">
            <output className="result-count" aria-live="polite">
              <strong>{results.length} {t('components', 'قطعه')}</strong>
              <span>{t('Showing', 'نمایش')} {Math.min(results.length, preview ? columns * 2 : renderCount)} {t('of', 'از')} {results.length}</span>
            </output>
            <fieldset className="catalog-view-controls" aria-label={t('Catalog display', 'نمایش کاتالوگ')}>
              <button type="button" className={'icon-button ' + (!table ? 'active' : '')} onClick={() => setTable(false)} aria-label={t('Grid view', 'نمای شبکه‌ای')} aria-pressed={!table}><Grid2X2 size={18} /></button>
              <button type="button" className={'icon-button ' + (table ? 'active' : '')} onClick={() => setTable(true)} aria-label={t('Table view', 'نمای جدولی')} aria-pressed={table}><List size={18} /></button>
            </fieldset>
          </div>
          <DataState />
          {!loading &&
            !error &&
            (results.length === 0 ? (
              <div className="state">
                <h2>{t('No matching components', 'قطعه‌ای یافت نشد')}</h2>
                <p>
                  {t(
                    'Try a shorter code or clear the filters to explore other components.',
                    'کد کوتاه‌تری وارد کنید یا برای بررسی سایر قطعات، فیلترها را پاک کنید.',
                  )}
                </p>
                <button type="button" className="button" onClick={clearFilters}>{t('Reset search & filters', 'بازنشانی جستجو و فیلترها')}</button>
              </div>
            ) : table ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[t('Code', 'کد'), t('Family', 'خانواده'), 'd / mm', 'D / mm', 'B / mm', 'Cr / kN', t('Details', 'جزئیات')].map(
                        (h, i) => (
                          <th key={i} scope="col">{h}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, renderCount).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <a aria-label={t('View product details', 'مشاهده جزئیات محصول') + ' ' + p.code} href={'/product/' + encodeURIComponent(p.slug || p.id)} onClick={(event) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); chooseProduct(p); } }}>
                            <code>{p.code}</code>
                          </a>
                        </td>
                        <td>
                          {t(
                            categoryNames[p.category]?.[0] || p.category,
                            categoryNames[p.category]?.[1] || p.category,
                          )}
                        </td>
                        <td>{p.d > 0 ? p.d : '—'}</td>
                        <td>{p.D > 0 ? p.D : '—'}</td>
                        <td>{p.B > 0 ? p.B : '—'}</td>
                        <td>{p.crKn > 0 ? p.crKn : '—'}</td>
                        <td>
                          <button
                            onClick={() => chooseProduct(p)}
                            aria-label={t('View ', 'مشاهده ') + p.code}
                          >
                            <ArrowUpRight size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={preview ? 'catalog-grid-preview' : ''}>
                <div className="product-grid">
                  {results.slice(0, renderCount).map((p, index) => (
                    <div className="showroom-card" key={p.id} inert={preview && index >= columns * 2} aria-hidden={preview && index >= columns * 2 ? true : undefined}><ProductCard p={p} onSelect={chooseProduct} /></div>
                  ))}
                </div>
              </div>
            ))}
          {moreAvailable && <button className="button catalog-more" onClick={showMore}>{t('Show more components', 'نمایش قطعات بیشتر')} <span>↓</span></button>}
        </div>
      </div>
      {hub && <CatalogHubGuide hub={hub} />}
      <div className="section catalog-library"><ManufacturerLibrary /></div>
      {currentProduct && <ShowroomProductPanel p={currentProduct} onSelect={chooseProduct} onClose={() => setSelected('')} />}
    </Container>
  );
}
