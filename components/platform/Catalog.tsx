import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Grid2X2,
  List,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { usePlatform, DataState } from './Context';
import { ProductCard, QuickView } from './Product';
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
export function searchProducts(
  products: BearingProduct[],
  q: string,
  category = 'all',
  d = '',
  D = '',
) {
  const n = q
    .trim()
    .toLowerCase()
    .replace(/[\s/-]/g, '');
  const score = (p: BearingProduct) => {
    const code = p.code.toLowerCase().replace(/[\s/-]/g, '');
    if (code === n) return 100;
    if (code.startsWith(n)) return 80;
    if (code.includes(n)) return 60;
    const text = [
      p.nameEn,
      p.nameFa,
      p.category,
      p.schematicType,
      ...p.applicationsEn,
      ...p.applicationsFa,
      ...p.brands,
      `${p.d}x${p.D}x${p.B}`,
    ]
      .join(' ')
      .toLowerCase()
      .replace(/[\s/-]/g, '');
    return text.includes(n) ? 20 : 0;
  };
  return products
    .filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!d || p.d === Number(d)) &&
        (!D || p.D === Number(D)) &&
        (!q || score(p) > 0),
    )
    .sort((a, b) => (q ? score(b) - score(a) : 0));
}
export default function Catalog() {
  const { products, fa, t, loading, error } = usePlatform();
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [d, setD] = useState(''),
    [outer, setOuter] = useState('');
  const [table, setTable] = useState(false),
    [selected, setSelected] = useState<BearingProduct | null>(null),
    [filters, setFilters] = useState(false);
  const results = useMemo(
    () => searchProducts(products, q, cat, d, outer),
    [products, q, cat, d, outer],
  );
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
            setD('');
            setOuter('');
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
  return (
    <main id="main">
      <section className="page-heading">
        <div className="section-label">
          {t(
            'PRODUCT CATALOG / TECHNICAL DISCOVERY',
            'کاتالوگ محصولات / جستجوی فنی',
          )}
        </div>
        <h1>
          {t('The right part.', 'قطعه درست.')}{' '}
          <em>{t('Precisely.', 'با دقت.')}</em>
        </h1>
        <p>
          {t(
            'Search by designation, dimensions or application. Explore the details, then speak to our engineering team.',
            'بر اساس شماره فنی، ابعاد یا کاربرد جستجو کنید؛ مشخصات را بررسی کنید و با تیم فنی در ارتباط باشید.',
          )}
        </p>
      </section>
      <div className="catalog-layout">
        <aside className={'filters ' + (filters ? 'expanded' : '')}>
          <button
            className="mobile-filters button"
            onClick={() => setFilters(!filters)}
          >
            <SlidersHorizontal size={18} />
            {t('Filters', 'فیلترها')}
          </button>
          <div className="filter-body">
            <div className="section-label">
              {t('BEARING FAMILIES', 'خانواده بیرینگ')}
            </div>
            <button
              className={cat === 'all' ? 'active' : ''}
              onClick={() => setCat('all')}
            >
              {t('All components', 'همه قطعات')}
              <small>{products.length}</small>
            </button>
            {Object.entries(categoryNames).map(([k, v]: any) => (
              <button
                className={cat === k ? 'active' : ''}
                key={k}
                onClick={() => setCat(k)}
              >
                {t(v[0], v[1])}
                <small>{products.filter((p) => p.category === k).length}</small>
              </button>
            ))}
            <div className="filter-dimensions">
              <div className="section-label">
                {t('DIMENSIONS / mm', 'ابعاد / mm')}
              </div>
              <label>
                {t('Bore diameter d', 'قطر داخلی d')}
                <input
                  type="number"
                  min="0"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                  placeholder="Any"
                />
              </label>
              <label>
                {t('Outside diameter D', 'قطر خارجی D')}
                <input
                  type="number"
                  min="0"
                  value={outer}
                  onChange={(e) => setOuter(e.target.value)}
                  placeholder="Any"
                />
              </label>
              <button
                className="reset"
                onClick={() => {
                  setD('');
                  setOuter('');
                  setCat('all');
                  setQ('');
                }}
              >
                {t('Reset all filters', 'پاک کردن فیلترها')}
              </button>
            </div>
            <div className="filter-help">
              <strong>
                {t('Need a second opinion?', 'نیاز به راهنمایی دارید؟')}
              </strong>
              <p>
                {t(
                  'Our team can help identify your component.',
                  'تیم فنی در شناسایی قطعه همراه شماست.',
                )}
              </p>
              <a href="/#contact">
                {t('Ask an engineer', 'ارتباط با کارشناس')}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </aside>
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
                    'Try a shorter code or remove dimensional filters.',
                    'کد کوتاه‌تر وارد کنید یا فیلتر ابعاد را بردارید.',
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
                    {results.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <button onClick={() => setSelected(p)}>
                            <code>{p.code}</code>
                          </button>
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
                            onClick={() => setSelected(p)}
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
              <div className="product-grid">
                {results.map((p) => (
                  <ProductCard p={p} key={p.id} onSelect={setSelected} />
                ))}
              </div>
            ))}
        </div>
      </div>
      {selected && <QuickView p={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
