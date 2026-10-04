import CategoryIcon from './CategoryIcon';
import ManufacturerLibrary from './ManufacturerLibrary';
import { searchProducts } from '../../lib/showroom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Grid2X2,
  List,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePlatform, DataState } from './Context';
import { ProductCard, ShowroomProductPanel } from './Product';
import type { BearingProduct } from '../../domain/product';
export const categoryNames: any = {
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
export default function Catalog({ embedded = false }: { embedded?: boolean }) {
  const { products, t, loading, error } = usePlatform();
  const familyScroll = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [columns, setColumns] = useState(columnsForViewport);
  const [table, setTable] = useState(false),
    [selected, setSelected] = useState(params.get('item') || ''),
    [visibleCount, setVisibleCount] = useState(columns * 6),
    [expanded, setExpanded] = useState(false);
  const results = useMemo(
    () => searchProducts(products, q, cat),
    [products, q, cat],
  );
  useEffect(() => {
    const update = () => setColumns(columnsForViewport());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  useEffect(() => {
    const context = (document as any).modelContext;
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
          execute(input: any) {
            if (typeof input?.query !== 'string' || input.query.length > 200)
              throw new Error('Query must be a short string.');
            setQ(input.query);
            setCat('all');
            return {
              products: searchProducts(products, input.query).map((p) => ({
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
  }, [products]);
  useEffect(() => {
    const next = new URLSearchParams(location.search);
    for (const key of ['q', 'category', 'd', 'D', 'B', 'item']) next.delete(key);
    for (const [key, value] of Object.entries({ q, category: cat === 'all' ? '' : cat, item: selected })) {
      if (value) next.set(key, value);
    }
    history.replaceState(null, '', location.pathname + (next.size ? '?' + next.toString() : '') + location.hash);
  }, [q, cat, selected]);
  useEffect(() => { setExpanded(false); setVisibleCount(columns * 6); }, [q, cat, columns]);
  const chooseProduct = (product: BearingProduct) => {
    setSelected(product.slug || product.id);
  };
  const currentProduct = products.find((product) => product.slug === selected || product.id === selected);
  const preview = !table && !expanded && results.length > columns * 2;
  const renderCount = table ? Math.max(12, expanded ? visibleCount : 12) : expanded ? visibleCount : columns * 3;
  const moreAvailable = preview || results.length > renderCount;
  const showMore = () => {
    setVisibleCount((count) => expanded ? count + (table ? 12 : columns * 3) : Math.max(count, table ? 24 : columns * 6));
    setExpanded(true);
  };
  const Container = embedded ? 'div' : 'main';
  return (
    <Container id={embedded ? undefined : 'main'} className={embedded ? 'catalog-workspace embedded-workspace' : 'catalog-workspace'}>
      <section className={embedded ? 'section-heading catalog-intro' : 'page-heading'}>
        <div className="section-label">
          {embedded ? '02 / ' : ''}{t(
            'PRODUCT SHOWROOM / TECHNICAL DISCOVERY',
            'کاتالوگ محصولات / جستجوی فنی',
          )}
        </div>
        {embedded ? <h2>{t('Explore every component.', 'همه قطعات را بررسی کنید.')}</h2> : <h1>
          {t('The right part.', 'قطعه درست.')}{' '}
          <em>{t('Precisely.', 'با دقت.')}</em>
        </h1>}
        <p>
          {t(
            'Search by designation, dimensions or application. Explore the details, then speak to our engineering team.',
            'بر اساس شماره فنی، ابعاد یا کاربرد جستجو کنید؛ مشخصات را بررسی کنید و با تیم فنی در ارتباط باشید.',
          )}
        </p>
      </section>
      <div className="section"><ManufacturerLibrary/></div>
      <div className="family-bar">
        <div className="family-bar-heading"><span className="section-label">{t('BEARING FAMILIES', 'خانواده بیرینگ')}</span><div className="family-bar-arrows"><button type="button" aria-label={t('Scroll families left', 'پیمایش خانواده‌ها به چپ')} onClick={() => familyScroll.current?.scrollBy({ left: -320, behavior: 'smooth' })}><ChevronLeft size={17} /></button><button type="button" aria-label={t('Scroll families right', 'پیمایش خانواده‌ها به راست')} onClick={() => familyScroll.current?.scrollBy({ left: 320, behavior: 'smooth' })}><ChevronRight size={17} /></button></div></div>
        <div ref={familyScroll} className="family-options" role="group" aria-label={t('Bearing families', 'خانواده‌های بیرینگ')}>
          <button type="button" aria-pressed={cat === 'all'} className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}><span className="category-tile-label">{t('All components', 'همه قطعات')}</span><small>{products.filter(p=>!p.isArchived).length}</small><CategoryIcon category="all"/></button>
          {Object.entries(categoryNames).map(([key, names]: any) => <button type="button" key={key} aria-pressed={cat === key} className={cat === key ? 'active' : ''} onClick={() => setCat(key)}><span className="category-tile-label">{t(names[0], names[1])}</span><small>{products.filter((product) => !product.isArchived && product.category === key).length}</small><CategoryIcon category={key}/></button>)}
        </div>
      </div>
      <div className="catalog-layout">
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <div className="search-field">
              <Search size={20} />
              <input
                aria-label={t('Search catalog', 'جستجوی کاتالوگ')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t(
                  'Code, dimensions or application',
                  'کد، ابعاد یا کاربرد',
                )}
              />
            </div>
            <button
              className={'icon-button ' + (!table ? 'active' : '')}
              onClick={() => setTable(false)}
              aria-label="Grid view"
              aria-pressed={!table}
            >
              <Grid2X2 size={19} />
            </button>
            <button
              className={'icon-button ' + (table ? 'active' : '')}
              onClick={() => setTable(true)}
              aria-label="Table view"
              aria-pressed={table}
            >
              <List size={20} />
            </button>
          </div>
          <div className="presets">
            {t('APPLICATION', 'کاربرد')}{' '}
            {['Pumps', 'Motors', 'Gearboxes'].map((x) => (
              <button onClick={() => setQ(x)} key={x}>
                {t(
                  x,
                  (
                    {
                      Pumps: 'پمپ',
                      Motors: 'الکتروموتور',
                      Gearboxes: 'گیربکس',
                    } as any
                  )[x],
                )}
              </button>
            ))}
          </div>
          <div className="result-count" role="status">
            {results.length} {t('components', 'قطعه')}
            <span>
              {t(
                'Specifications before selection.',
                'مشخصات فنی، پیش از انتخاب.',
              )}
            </span>
          </div>
          <DataState />
          {!loading &&
            !error &&
            (results.length === 0 ? (
              <div className="state">
                <h2>{t('No matching components', 'قطعه‌ای یافت نشد')}</h2>
                <p>
                  {t(
                    'Try a shorter code or another bearing family.',
                    'کد کوتاه‌تر یا خانواده بیرینگ دیگری را امتحان کنید.',
                  )}
                </p>
              </div>
            ) : table ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {['Code', 'Family', 'd', 'D', 'B', 'Cr kN', ''].map(
                        (h, i) => (
                          <th key={i}>{h}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, renderCount).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <a href={'/product/' + encodeURIComponent(p.slug || p.id)} onClick={(event) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); chooseProduct(p); } }}>
                            <code>{p.code}</code>
                          </a>
                        </td>
                        <td>
                          {t(
                            categoryNames[p.category]?.[0] || p.category,
                            categoryNames[p.category]?.[1] || p.category,
                          )}
                        </td>
                        <td>{p.d}</td>
                        <td>{p.D}</td>
                        <td>{p.B}</td>
                        <td>{p.crKn}</td>
                        <td>
                          <button
                            onClick={() => chooseProduct(p)}
                            aria-label={'View ' + p.code}
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
                  {results.slice(0, renderCount).map((p) => (
                    <div className="showroom-card" key={p.id}><ProductCard p={p} onSelect={chooseProduct} /></div>
                  ))}
                </div>
              </div>
            ))}
          {moreAvailable && <button className="button catalog-more" onClick={showMore}>{t('Show more components', 'نمایش قطعات بیشتر')} <span>↓</span></button>}
        </div>
      </div>
      {currentProduct && <ShowroomProductPanel key={currentProduct.id} p={currentProduct} onClose={() => setSelected('')} />}
    </Container>
  );
}
