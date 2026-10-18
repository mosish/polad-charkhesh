import ManufacturerLibrary from './ManufacturerLibrary';
import Breadcrumbs from './Breadcrumbs';
import Comparison from './Comparison';
import FitGuide from './FitGuide';
import Copy from './Copy';
import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { calculate, basicLife } from '../../lib/engineering';
import { calculationEligibility, eligibilityMessage, selectedCalculationProduct } from '../../lib/engineering-eligibility';
import { usePlatform, DataState } from './Context';

type ToolTab = 'life' | 'basic' | 'fits' | 'compare' | 'converter';
type CalculationPreview =
  | { kind: 'life'; value: ReturnType<typeof calculate> }
  | { kind: 'basic'; value: ReturnType<typeof basicLife> }
  | { kind: 'error'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'incomplete' }
  | { kind: 'idle' };

const numberInput = (value: string) => value.trim() === '' ? NaN : Number(value);

export default function Engineering({ embedded = false }: { embedded?: boolean }) {
  const { products, fa, t, loading, error, content } = usePlatform();
  const [selected, setSelected] = useState(
    new URLSearchParams(location.search).get('product') || '',
  );
  const [tab, setTab] = useState<ToolTab>(selected ? 'life' : 'basic'),
    [fr, setFr] = useState('2'),
    [axial, setAxial] = useState('0'),
    [rpm, setRpm] = useState('1500'),
    [rel, setRel] = useState(90),
    [confirmed, setConfirmed] = useState(false);
  const [val, setVal] = useState(25.4),
    [unit, setUnit] = useState('mm-inch');
  const [c, setC] = useState(''),
    [load, setLoad] = useState(''),
    [bearingType, setBearingType] = useState<'' | 'ball' | 'roller'>('');
  const p = selectedCalculationProduct(products, selected);
  const eligibility = calculationEligibility(p);
  const roller = bearingType === 'roller';
  const preview = useMemo<CalculationPreview>(() => {
    if (tab !== 'life' && tab !== 'basic') return { kind: 'idle' };
    if (tab === 'life') {
      const state = calculationEligibility(p);
      if (!state.eligible) return { kind: 'unavailable', message: eligibilityMessage(state.reason, fa) };
    }
    if (tab === 'basic' && !bearingType) return { kind: 'incomplete' };
    if ((tab === 'basic' ? [c, load, rpm] : [fr, axial, rpm]).some((value) => value.trim() === '')) return { kind: 'incomplete' };
    try {
      if (tab === 'basic') return { kind: 'basic', value: basicLife(numberInput(c), numberInput(load), numberInput(rpm), roller) };
      if (!p) return { kind: 'idle' };
      return { kind: 'life', value: calculate(p, numberInput(fr), numberInput(axial), numberInput(rpm), rel, confirmed) };
    } catch (e) {
      return { kind: 'error', message: fa ? 'ورودی‌های عددی، بار، سرعت و محدوده مجاز روش را بررسی کنید.' : e instanceof Error ? e.message : 'Calculation unavailable.' };
    }
  }, [p, tab, c, load, rpm, roller, bearingType, fr, axial, rel, confirmed, fa]);
  const resetInputs = () => {
    const axialFamily = eligibility.eligible && ['thrust-ball', 'spherical-thrust'].includes(eligibility.profile.family);
    setFr(axialFamily ? '0' : '2');
    setAxial(axialFamily ? '2' : '0');
    setRpm('1500');
    setRel(90);
    setConfirmed(false);
    setC('');
    setLoad('');
    setBearingType('');
  };
  const Container = embedded ? 'div' : 'main';
  return (
    <Container id={embedded ? undefined : 'main'} className={embedded ? 'engineering-workspace embedded-workspace' : 'engineering-workspace'}>
      <section className={embedded ? 'section-heading engineering-intro' : 'page-heading'}>
        {!embedded && <Breadcrumbs route="/engineering" />}
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
              disabled={loading || Boolean(error) || !products.some((product) => !product.isArchived)}
              onChange={(event) => {
                setSelected(event.target.value);
                setConfirmed(false);
              }}
            >
              <option value="">{t('Select a catalog product (optional for manual tools)', 'انتخاب محصول کاتالوگ (برای ابزار دستی اختیاری)')}</option>
              {products.filter((product) => !product.isArchived).map((product) => <option key={product.id} value={product.slug || product.id}>{product.code}</option>)}
            </select>
            {p && <small dir="ltr">{p.d} × {p.D} × {p.B} mm{p.crKn > 0 ? ` · Cr ${p.crKn} kN` : ''}</small>}
          </label>
        </div>
        <p>
          {t(
            'Estimate bearing life as you adjust the inputs, then compare components and check fit limits.',
            'با تغییر ورودی‌ها عمر بیرینگ را همان‌لحظه برآورد کنید، سپس قطعات را مقایسه و حدود انطباق را بررسی کنید.',
          )}
        </p>
      </section>
      <DataState />
      {(
        <>
          <div className="section engineering-section">
            <div className="tool-header">
              <h2>{t('Engineering tools', 'ابزارهای مهندسی')}</h2>
            </div>
            <div className="tool-tabs">
              {([
                ['life', 'Life & equivalent load', 'عمر و بار معادل'],
                ['basic', 'Known equivalent load', 'بار معادل معلوم'],
                ['fits', 'Fit limits', 'حدود انطباق'],
                ['compare', 'Technical comparison', 'مقایسه فنی'],
                ['converter', 'Unit converter', 'تبدیل واحد'],
              ] as const).map(([k, e, f]) => (
                <button
                  key={k}
                  type="button"
                  className={tab === k ? 'active' : ''}
                  aria-pressed={tab === k}
                  onClick={() => setTab(k)}
                >
                  {t(e, f)}
                </button>
              ))}
            </div>
            {tab==='compare'?<Comparison key={p?.id || 'manual'} initial={p ? [p.id] : []}/>:tab==='fits'?<FitGuide/>: preview.kind === 'unavailable' ? (
              <section className="panel" aria-live="polite">
                <h3>{t('Product calculation unavailable', 'محاسبه بر اساس محصول در دسترس نیست')}</h3>
                <p>{preview.message}</p>
                <div className="calculation-actions">
                  <button type="button" className="button" onClick={() => setTab('basic')}>{t('Use verified manual inputs', 'ورود دستی مقادیر تأییدشده')}</button>
                  <a className="button" href="/#contact">{t('Contact an engineer', 'ارتباط با کارشناس')}</a>
                </div>
              </section>
            ) : ['life', 'basic'].includes(tab) ? (
              <div className="calculator-grid">
                <div className="panel">
                  <div className="section-label">
                    {t('OPERATING CONDITIONS', 'شرایط کارکرد')}
                  </div>
                  <h3>{t('Basic rating life', 'عمر نامی پایه')}</h3>
                  <p className="engineering-live-hint">{tab === 'basic' ? t('Independent manual calculation. Enter verified C, P and bearing type; no catalog ratings are copied.', 'محاسبه مستقل دستی است. مقادیر تأییدشده C و P و نوع بیرینگ را وارد کنید؛ اطلاعات کاتالوگ کپی نمی‌شود.') : t('Example operating inputs are shown; results update as you edit them.', 'ورودی‌های کاری نمونه نمایش داده شده‌اند؛ نتیجه با تغییر آنها به‌روز می‌شود.')}</p>
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
                            onChange={(e) => setFr(e.target.value)}
                          />
                        </label>
                        <label>
                          {t('Axial load Fa / kN', 'بار محوری Fa / kN')}
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={axial}
                            onChange={(e) => setAxial(e.target.value)}
                          />
                        </label>
                      </div>
                      <label>
                        {t('Reliability', 'قابلیت اطمینان')}
                        <select
                          value={rel}
                          onChange={(e) => setRel(Number(e.target.value))}
                        >
                          {[90, 95, 98, 99].map((x) => (
                            <option key={x} value={x}>
                              {x}%
                            </option>
                          ))}
                        </select>
                      </label>
                      {eligibility.eligible && eligibility.profile.family === 'tapered' && (
                        <label className="check">
                          <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
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
                            onChange={(e) => setC(e.target.value)}
                          />
                        </label>
                        <label>
                          <Copy text="P / kN" />
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={load}
                            onChange={(e) => setLoad(e.target.value)}
                          />
                        </label>
                      </div>
                      <label>
                        {t('Bearing type', 'نوع بیرینگ')}
                        <select
                          value={bearingType}
                          onChange={(e) => setBearingType(e.target.value as '' | 'ball' | 'roller')}
                        >
                          <option value="">{t('Select bearing type', 'نوع بیرینگ را انتخاب کنید')}</option>
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
                      onChange={(e) => setRpm(e.target.value)}
                    />
                  </label>
                  <button className="button" type="button" onClick={resetInputs}>
                    <RotateCcw size={17} />
                    {tab === 'basic' ? t('Clear manual inputs', 'پاک کردن ورودی‌های دستی') : t('Reset example inputs', 'بازنشانی ورودی‌های نمونه')}
                  </button>
                </div>
                <div className="calculation-result" aria-live="polite">
                  <span className="section-label">
                    {t('LIVE CALCULATION RESULT', 'نتیجه زنده محاسبه')}
                  </span>
                  {preview.kind === 'error' ? (
                    <>
                      <h3>
                        {t(
                          'Check the inputs or product data',
                          'ورودی‌ها یا اطلاعات محصول را بررسی کنید',
                        )}
                      </h3>
                      <p className="error">{preview.message}</p>
                      <div className="calculation-actions">
                        {tab === 'life' && (
                          <button type="button" className="button" onClick={() => setTab('basic')}>
                            {t('Use known equivalent load', 'استفاده از بار معادل معلوم')}
                          </button>
                        )}
                        <a href="/#contact" className="button">
                          {t('Contact an engineer', 'ارتباط با کارشناس')}
                        </a>
                      </div>
                    </>
                  ) : preview.kind === 'life' || preview.kind === 'basic' ? (
                    <>
                      <div className="result-number">
                        {Math.round(preview.value.hours).toLocaleString()}
                        <small>{t('hours · L10h', 'ساعت · L10h')}</small>
                      </div>
                      <div className="result-metrics">
                        <div>
                          <strong>{preview.value.L10.toFixed(2)}</strong>
                          <span>
                            <Copy text="L10 · 10⁶ rev" />
                          </span>
                        </div>
                        {preview.kind === 'life' ? (
                          <>
                            <div>
                              <strong>
                                {preview.value.P.toFixed(3)}
                                <Copy text="kN" />
                              </strong>
                              <span>
                                {t('Equivalent load P', 'بار معادل P')}
                              </span>
                            </div>
                            <div>
                              <strong>{preview.value.safety.toFixed(2)}</strong>
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
                                  preview.value.adjustedHours,
                                ).toLocaleString()}{' '}
                                <Copy text="h" />
                              </strong>
                              <span>
                                <Copy text="a₁ =" />
                                {preview.value.a1}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div><strong>{numberInput(c).toLocaleString()} kN</strong><span>{t('Dynamic rating C', 'ظرفیت دینامیکی C')}</span></div>
                            <div><strong>{numberInput(load).toLocaleString()} kN</strong><span>{t('Known equivalent load P', 'بار معادل معلوم P')}</span></div>
                            <div><strong>{roller ? '10/3' : '3'}</strong><span>{t('Life exponent p', 'توان عمر p')}</span></div>
                          </>
                        )}
                      </div>
                      <code>{preview.kind === 'life' ? preview.value.formula : 'L10 = (C/P)^p'}</code>
                      <p>{t('L10 is a statistical fatigue-life estimate, not a guaranteed service interval.','L10 برآورد آماری عمر خستگی است و زمان سرویس تضمین‌شده نیست.')}</p>
                      {preview.kind === 'life' && (
                        <p className={preview.value.speed.status === 'exceeded' ? 'error' : 'note'}>
                          {preview.value.speed.status === 'unknown' ? t('Speed limit unknown; no speed acceptance is established.', 'حد سرعت نامشخص است؛ مجاز بودن سرعت تأیید نشده است.') : <>
                            {preview.value.speed.status === 'exceeded' ? t('Entered speed exceeds ', 'سرعت واردشده بیشتر است از ') : t('Entered speed is within ', 'سرعت واردشده در محدوده است: ')}
                            {preview.value.speed.basis === 'limiting' ? t('the catalog limiting speed: ', 'سرعت حدی کاتالوگ: ') : t('the lowest available lubricant speed rating: ', 'کمترین حد سرعت روانکار موجود: ')}
                            {preview.value.speed.limit.toLocaleString()} rpm.
                            {' '}{t('This comparison does not establish application suitability.', 'این مقایسه مناسب بودن برای کاربرد را تأیید نمی‌کند.')}
                          </>}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <h3>
                        {t(
                          'Enter all required values',
                          'همه مقادیر ضروری را وارد کنید',
                        )}
                      </h3>
                      <p>
                        {t(
                          'The result will update as soon as the inputs are complete.',
                          'به‌محض کامل شدن ورودی‌ها، نتیجه به‌روز می‌شود.',
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
            ) : null}
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
