import ManufacturerLibrary from './ManufacturerLibrary';
import Comparison from './Comparison';
import FitGuide from './FitGuide';
import Copy from './Copy';
import { useState } from 'react';
import { Calculator, RotateCw, ArrowUpRight } from 'lucide-react';
import { calculate, basicLife } from '../../lib/engineering';
import { usePlatform, DataState } from './Context';
import { BearingViewer } from './Viewer';
export default function Engineering({ embedded = false }: { embedded?: boolean }) {
  const { products, fa, t, loading, error, content } = usePlatform();
  const [selected, setSelected] = useState(
    new URLSearchParams(location.search).get('product') || '6204-2rs',
  );
  const [tab, setTab] = useState('life'),
    [fr, setFr] = useState(2),
    [axial, setAxial] = useState(0),
    [rpm, setRpm] = useState(1500),
    [rel, setRel] = useState(90),
    [confirmed, setConfirmed] = useState(false),
    [result, setResult] = useState<any>(null),
    [err, setErr] = useState('');
  const [val, setVal] = useState(25.4),
    [unit, setUnit] = useState('mm-inch');
  const [c, setC] = useState(13.5),
    [load, setLoad] = useState(2),
    [roller, setRoller] = useState(false);
  const p = products.find((x) => x.slug === selected || x.id === selected) || products[0];
  const clear = () => {
    setResult(null);
    setErr('');
  };
  const run = () => {
    try {
      setResult(
        tab === 'basic'
          ? basicLife(c, load, rpm, roller)
          : calculate(p, fr, axial, rpm, rel, confirmed),
      );
      setErr('');
    } catch (e: any) {
      setErr(e.message);
      setResult(null);
    }
  };
  const Container = embedded ? 'div' : 'main';
  return (
    <Container id={embedded ? undefined : 'main'} className={embedded ? 'engineering-workspace embedded-workspace' : 'engineering-workspace'}>
      <section className={embedded ? 'section-heading engineering-intro' : 'page-heading'}>
        <div className="section-label">
          {embedded ? '03 / ' : ''}{t('MECHANICAL ENGINEERING REFERENCE TOOLS', 'ابزارهای مرجع مهندسی مکانیک')}
        </div>
        <div className="engineering-heading-row">
          {embedded ? <h2>{content?.engineering?.[fa ? 'titleFa' : 'titleEn'] || t('Make the numbers work.', 'انتخاب بر پایه محاسبه.')}</h2> : <h1>
            {content?.engineering?.[fa ? 'titleFa' : 'titleEn'] ||
              t('Make the numbers work.', 'انتخاب بر پایه محاسبه.')}
          </h1>}
          <label className="engineering-product-picker">
            {t('Selected component', 'قطعه انتخاب‌شده')}
            <select
              value={p?.slug || p?.id || ''}
              disabled={!products.length}
              onChange={(event) => {
                setSelected(event.target.value);
                const nextProduct = products.find((product) => (product.slug || product.id) === event.target.value);
                if (nextProduct?.crKn) setC(nextProduct.crKn);
                if (nextProduct) setRoller(['tapered', 'spherical', 'cylindrical', 'needle', 'carb', 'spherical-thrust'].includes(nextProduct.schematicType));
                setConfirmed(false);
                clear();
              }}
            >
              {products.map((product) => <option key={product.id} value={product.slug || product.id}>{product.code}</option>)}
            </select>
            {p && <small dir="ltr">{p.d} × {p.D} × {p.B} mm</small>}
          </label>
        </div>
        <p>
          {t(
            'Explore bearing geometry, estimate basic rating life, and check your operating inputs.',
            'هندسه بیرینگ را بررسی کنید، عمر پایه را برآورد کنید و شرایط کار را بسنجید.',
          )}
        </p>
      </section>
      <DataState />
      {!loading && !error && p && (
        <>
          <div className="section engineering-section">
            <BearingViewer p={p} rpm={rpm} onRpmChange={(value) => { setRpm(value); clear(); }} />
            <div className="tool-header">
              <h2>{t('Engineering tools', 'ابزارهای مهندسی')}</h2>
            </div>
            <div className="tool-tabs">
              {[
                ['life', 'Life & equivalent load', 'عمر و بار معادل'],
                ['basic', 'Known equivalent load', 'بار معادل معلوم'],
                ['converter', 'Unit converter', 'تبدیل واحد'],
                ['clearance', 'Clearance guide', 'راهنمای لقی'],
                ['fits', 'Fit limits', 'حدود انطباق'],
                ['compare', 'Technical comparison', 'مقایسه فنی'],
              ].map(([k, e, f]) => (
                <button
                  key={k}
                  className={tab === k ? 'active' : ''}
                  onClick={() => {
                    setTab(k);
                    clear();
                  }}
                >
                  {t(e, f)}
                </button>
              ))}
            </div>
            {tab==='compare'?<Comparison key={p.id} initial={[p.id]}/>:tab==='fits'?<FitGuide/>:['life', 'basic'].includes(tab) ? (
              <div className="calculator-grid">
                <form
                  className="panel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run();
                  }}
                >
                  <div className="section-label">
                    {t('OPERATING CONDITIONS', 'شرایط کارکرد')}
                  </div>
                  <h3>{t('Basic rating life', 'عمر نامی پایه')}</h3>
                  {tab === 'life' ? (
                    <>
                      <div className="form-grid">
                        <label>
                          {t('Radial load Fr / kN', 'بار شعاعی Fr / kN')}
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={fr}
                            onChange={(e) => {
                              setFr(Number(e.target.value));
                              clear();
                            }}
                          />
                        </label>
                        <label>
                          {t('Axial load Fa / kN', 'بار محوری Fa / kN')}
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={axial}
                            onChange={(e) => {
                              setAxial(Number(e.target.value));
                              clear();
                            }}
                          />
                        </label>
                      </div>
                      <label>
                        {t('Reliability', 'قابلیت اطمینان')}
                        <select
                          value={rel}
                          onChange={(e) => {
                            setRel(Number(e.target.value));
                            clear();
                          }}
                        >
                          {[90, 95, 98, 99].map((x) => (
                            <option key={x} value={x}>
                              {x}%
                            </option>
                          ))}
                        </select>
                      </label>
                      {p.schematicType === 'tapered' && (
                        <label className="check">
                          <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => {
                              setConfirmed(e.target.checked);
                              clear();
                            }}
                          />
                          {t(
                            'The bearing arrangement and induced axial loads have been reviewed.',
                            'آرایش بیرینگ و بارهای محوری القایی بررسی شده‌اند.',
                          )}
                        </label>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="form-grid">
                        <label>
                          <Copy text="C / kN" />
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={c}
                            onChange={(e) => {
                              setC(+e.target.value);
                              clear();
                            }}
                          />
                        </label>
                        <label>
                          <Copy text="P / kN" />
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={load}
                            onChange={(e) => {
                              setLoad(+e.target.value);
                              clear();
                            }}
                          />
                        </label>
                      </div>
                      <label>
                        {t('Bearing type', 'نوع بیرینگ')}
                        <select
                          value={roller ? 'roller' : 'ball'}
                          onChange={(e) => {
                            setRoller(e.target.value === 'roller');
                            clear();
                          }}
                        >
                          <option value="ball">
                            <Copy text="Ball · p = 3" />
                          </option>
                          <option value="roller">
                            <Copy text="Roller · p = 10/3" />
                          </option>
                        </select>
                      </label>
                      <p className="note">
                        {t(
                          'Use a manufacturer-verified equivalent load that accounts for the exact bearing family and arrangement.',
                          'بار معادل تأییدشده سازنده را با در نظر گرفتن خانواده و آرایش بیرینگ وارد کنید.',
                        )}
                      </p>
                    </>
                  )}
                  <label>
                    {t('Rotational speed / rpm', 'سرعت دوران / rpm')}
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={rpm}
                      onChange={(e) => {
                        setRpm(+e.target.value);
                        clear();
                      }}
                    />
                  </label>
                  <button className="button primary" type="submit">
                    <Calculator size={18} />
                    {t('Calculate rating life', 'محاسبه عمر پایه')}
                  </button>
                </form>
                <div className="calculation-result" aria-live="polite">
                  <span className="section-label">
                    {t('CALCULATION RESULT', 'نتیجه محاسبه')}
                  </span>
                  {err ? (
                    <>
                      <h3>
                        {t(
                          'Engineering review required',
                          'نیاز به بررسی مهندسی',
                        )}
                      </h3>
                      <p className="error">{err}</p>
                      <a href="/#contact" className="button">
                        {t('Contact an engineer', 'ارتباط با کارشناس')}
                      </a>
                    </>
                  ) : result ? (
                    <>
                      <div className="result-number">
                        {Math.round(result.hours).toLocaleString()}
                        <small>{t('hours · L10h', 'ساعت · L10h')}</small>
                      </div>
                      <div className="result-metrics">
                        <div>
                          <strong>{result.L10.toFixed(2)}</strong>
                          <span>
                            <Copy text="L10 · 10⁶ rev" />
                          </span>
                        </div>
                        {result.P !== undefined && (
                          <>
                            <div>
                              <strong>
                                {result.P.toFixed(3)}
                                <Copy text="kN" />
                              </strong>
                              <span>
                                {t('Equivalent load P', 'بار معادل P')}
                              </span>
                            </div>
                            <div>
                              <strong>{result.safety.toFixed(2)}</strong>
                              <span>
                                {t(
                                  'Static safety C₀/P₀',
                                  'ضریب اطمینان استاتیکی',
                                )}
                              </span>
                            </div>
                            <div>
                              <strong>
                                {Math.round(
                                  result.adjustedHours,
                                ).toLocaleString()}{' '}
                                <Copy text="h" />
                              </strong>
                              <span>
                                <Copy text="a₁ =" />
                                {result.a1}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <code>{result.formula || 'L10 = (C/P)^p'}</code>
                      <p>{t('L10 is the fatigue life reached or exceeded by 90% of a sufficiently large group of identical bearings under the same conditions. It is not a guaranteed service interval.','L10 عمر خستگی است که ۹۰٪ گروه بزرگی از بیرینگ‌های یکسان در شرایط یکسان به آن می‌رسند یا از آن عبور می‌کنند؛ زمان سرویس تضمین‌شده نیست.')}</p>
                      <p>{t('Hours = million revolutions × 1,000,000 ÷ (60 × RPM).','ساعت = میلیون دور × ۱٬۰۰۰٬۰۰۰ ÷ (۶۰ × دور در دقیقه).')}</p>
                      {result.overspeed && (
                        <p className="error">
                          {t(
                            'Speed exceeds at least one catalog lubricant speed rating. Check the lubricant-specific limit.',
                            'سرعت از حد مجاز حداقل یکی از روانکارها بالاتر است. حد مرتبط با روانکار را بررسی کنید.',
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <RotateCw size={40} />
                      <h3>
                        {t(
                          'Start with your operating loads.',
                          'از بارهای کاری شروع کنید.',
                        )}
                      </h3>
                      <p>
                        {t(
                          'Your basic rating life, equivalent load and static safety factor will appear here.',
                          'عمر پایه، بار معادل و ضریب اطمینان استاتیکی در این بخش نمایش داده می‌شوند.',
                        )}
                      </p>
                    </>
                  )}
                  <p className="note">
                    {t(
                      'Basic rating life only. Reliability adjustment is not full ISO 281 modified life. Lubrication, contamination, fit and duty cycle require separate assessment.',
                      'فقط عمر نامی پایه محاسبه می‌شود. اصلاح قابلیت اطمینان معادل عمر اصلاح‌شده کامل ISO 281 نیست. روانکاری، آلودگی، انطباق و چرخه کاری نیاز به بررسی جداگانه دارند.',
                    )}
                  </p>
                </div>
              </div>
            ) : tab === 'converter' ? (
              <div className="panel converter">
                <h3>
                  {t('Engineering unit converter', 'تبدیل واحدهای مهندسی')}
                </h3>
                <div className="form-grid">
                  <label>
                    {t('Value', 'مقدار')}
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => setVal(+e.target.value)}
                    />
                  </label>
                  <label>
                    {t('Conversion', 'تبدیل')}
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="mm-inch">
                        <Copy text="mm → inch" />
                      </option>
                      <option value="inch-mm">
                        <Copy text="inch → mm" />
                      </option>
                      <option value="kn-n">
                        <Copy text="kN → N" />
                      </option>
                      <option value="c-f">
                        <Copy text="°C → °F" />
                      </option>
                      <option value="rpm-rad">
                        <Copy text="rpm → rad/s" />
                      </option>
                    </select>
                  </label>
                </div>
                <output className="result-number">
                  {(unit === 'mm-inch'
                    ? val / 25.4
                    : unit === 'inch-mm'
                      ? val * 25.4
                      : unit === 'kn-n'
                        ? val * 1000
                        : unit === 'c-f'
                          ? (val * 9) / 5 + 32
                          : (val * Math.PI) / 30
                  ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </output>
              </div>
            ) : (
              <div className="panel">
                <h3>
                  {t(
                    'Clearance is an application decision.',
                    'لقی با توجه به کاربرد انتخاب می‌شود.',
                  )}
                </h3>
                <p>
                  {t(
                    'CN denotes normal internal clearance; C3 is greater than normal and C4 greater than C3. These are clearance groups, not accuracy classes. Exact micrometre ranges vary with bore and bearing family.',
                    'CN نشان‌دهنده لقی داخلی نرمال، C3 بیشتر از نرمال و C4 بیشتر از C3 است. این‌ها گروه لقی هستند، نه کلاس دقت. دامنه دقیق میکرومتری به قطر داخلی و خانواده بیرینگ بستگی دارد.',
                  )}
                </p>
                <p>
                  {t(
                    'Available options in this record:',
                    'گزینه‌های این رکورد:',
                  )}{' '}
                  <code>{p.clearanceOptions.join(' / ')}</code>
                </p>
                <p>
                  {t(
                    'Interference fits and temperature differences can reduce operating clearance. Confirm residual clearance with manufacturer tables.',
                    'انطباق تداخلی و اختلاف دما می‌توانند لقی کارکرد را کاهش دهند. لقی باقیمانده را با جداول سازنده بررسی کنید.',
                  )}
                </p>
                <a className="button" href={'/?item=' + encodeURIComponent(p.slug || p.id) + '#catalog'}>
                  {t('View source record', 'مشاهده رکورد منبع')}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            )}
            {!embedded && <ManufacturerLibrary/>}
            <div className="source-note">
              {t('Calculation reference', 'مرجع محاسبات')}:{' '}
              <a
                href="https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <Copy text="SKF — Basic rating life" />
              </a>
              .{' '}
              {t(
                'Imported manufacturer ratings still require independent verification.',
                'مقادیر واردشده سازنده همچنان نیاز به بررسی مستقل دارند.',
              )}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
