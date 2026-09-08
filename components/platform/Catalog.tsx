import ManufacturerLibrary from './ManufacturerLibrary';
import { searchProducts } from '../../lib/showroom';
import Comparison from './Comparison';
import Dialog from './Dialog';
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
export { searchProducts } from '../../lib/showroom';
export default function Catalog() {
  const { products, fa, t, loading, error } = usePlatform();
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [d, setD] = useState(params.get('d') || ''),
    [outer, setOuter] = useState(params.get('D') || '');
  const [width,setWidth]=useState(params.get('B')||'');
  const [compare,setCompare]=useState<string[]>([]);
  const [comparing,setComparing]=useState(false);
  const [table, setTable] = useState(false),
    [selected, setSelected] = useState<BearingProduct | null>(null),
    [filters, setFilters] = useState(false);
  const results = useMemo(
    () => searchProducts(products, q, cat, d, outer, width),
    [products, q, cat, d, outer, width],
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
            setOuter(''); setWidth('');
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
  const toggleCompare=(id:string)=>setCompare(old=>old.includes(id)?old.filter(x=>x!==id):old.length<3?[...old,id]:old);
  useEffect(()=>{const next=new URLSearchParams();for(const [key,value] of Object.entries({q,category:cat==='all'?'':cat,d,D:outer,B:width}))if(value)next.set(key,value);history.replaceState(null,'',location.pathname+(next.size?'?'+next.toString():''));},[q,cat,d,outer,width]);
  return (
    <main id="main">
      <section className="page-heading">
        <div className="section-label">
          {t(
            'PRODUCT SHOWROOM / TECHNICAL DISCOVERY',
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
      <div className="section"><ManufacturerLibrary/></div>
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
                  step="any"
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
                  step="any"
                  value={outer}
                  onChange={(e) => setOuter(e.target.value)}
                  placeholder="Any"
                />
              </label>
              <label>{t('Width B','عرض B')}<input type="number" min="0" step="any" value={width} onChange={e=>setWidth(e.target.value)} placeholder={t('Any','همه')}/></label>
              <button
                className="reset"
                onClick={() => {
                  setD('');
                  setOuter(''); setWidth('');
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
                      {['Code', 'Family', 'd', 'D', 'B', 'Cr kN', t('Compare','مقایسه'), ''].map(
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
                        <td>{p.crKn}</td><td><input type="checkbox" aria-label={t('Compare','مقایسه')+' '+p.code} checked={compare.includes(p.id)} disabled={!compare.includes(p.id)&&compare.length>=3} onChange={()=>toggleCompare(p.id)}/></td>
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
                  <div className="showroom-card" key={p.id}><ProductCard p={p} onSelect={setSelected} /><label className="compare-choice"><input type="checkbox" checked={compare.includes(p.id)} disabled={!compare.includes(p.id)&&compare.length>=3} onChange={()=>toggleCompare(p.id)}/>{t('Compare','مقایسه')} <span dir="ltr">{p.code}</span></label></div>
                ))}
              </div>
            ))}
        </div>
      </div>
      {compare.length>0&&<div className="comparison-dock"><span>{compare.length} / 3 {t('components selected','قطعه انتخاب شده')}</span><button className="button primary" disabled={compare.length<2} onClick={()=>setComparing(true)}>{t('Compare specifications','مقایسه مشخصات')}</button><button className="button" onClick={()=>setCompare([])}>{t('Clear','پاک کردن')}</button></div>}
      {comparing&&<Dialog title={t('Technical comparison','مقایسه فنی')} onClose={()=>setComparing(false)}><Comparison initial={compare}/></Dialog>}
      {selected && <QuickView p={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
