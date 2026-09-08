import { lazy, Suspense, useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { BearingProduct } from '../../domain/product';
import { usePlatform } from './Context';
import { Schematic } from './Schematic';
import BearingModel from './BearingModel';
import { bearingGeometry } from '../../lib/bearing-motion';
const BearingScene = lazy(() => import('./HeroBearingScene'));

export function BearingViewer({ p, rpm, onRpmChange }: { p: BearingProduct; rpm: number; onRpmChange: (rpm: number) => void }) {
  const { t } = usePlatform();
  const [mode, setMode] = useState('motion');
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playback, setPlayback] = useState(1);
  const [reference, setReference] = useState('grease');
  const g = bearingGeometry(p);
  const limit = reference === 'oil' ? p.speedOilRpm : p.speedGreaseRpm;
  const hasLimit = Number.isFinite(limit) && limit > 0;
  const safeRpm = Number.isFinite(rpm) ? Math.max(0, rpm) : 0;
  const ratio = hasLimit ? safeRpm / limit : 0;
  const temp = 25 + 10 * ratio + 65 * ratio * ratio;
  useEffect(() => { if (!g.supported) setMode('section'); }, [p.id, g.supported]);
  return <div className="viewer">
    <div className="viewer-toolbar">
      <div><span className="section-label">{t('BEARING EXPLORER', 'کاوش بیرینگ')}</span><strong>{p.code}</strong></div>
      <div className="viewer-tabs">
        {[['motion','Motion','حرکت'],['section','Section & dimensions','مقطع و ابعاد'],['thermal','Thermal','حرارتی']].map(([key,en,fa]) => <button key={key} disabled={!g.supported && key !== 'section'} onClick={()=>setMode(key)} className={mode===key?'active':''}>{t(en,fa)}</button>)}
      </div>
    </div>
    <div className="viewer-body">
      <div className="mechanical-model">
        {mode==='section' || !g.supported ? <Schematic p={p}/> : <div className="explorer-model">
          <div className="explorer-model-heading">{t('PRODUCT GEOMETRY / OPEN CUTAWAY','هندسه محصول / نمای باز')}<span>3D</span></div>
          <div className="explorer-model-stage">
            <Suspense fallback={<BearingModel p={p} rpm={0} paused playback={1} compact/>}>
              <BearingScene key={p.id} family={g.roller?'rolling':'precision'} product={p} rpm={safeRpm} playback={playback} paused={paused} label={`${p.code} · ${p.d} × ${p.D} × ${p.B} mm`} fallback={<BearingModel p={p} rpm={safeRpm} paused={paused} playback={playback} compact/>}/>
            </Suspense>
          </div>
          <div className="explorer-model-dimensions"><span>{p.d} × {p.D} × {p.B} mm</span><span>{p.schematicType}</span></div>
        </div>}
        {g.supported && mode!=='section' && <div className="motion-controls">
          <button className="motion-toggle" aria-label={t(paused?'Play rotation':'Pause rotation',paused?'شروع دوران':'توقف دوران')} title={t(paused?'Play rotation':'Pause rotation',paused?'شروع دوران':'توقف دوران')} onClick={()=>setPaused(!paused)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
          <label>{t('Speed','سرعت')}<span className="rpm-input"><input aria-label={t('Shaft speed in RPM','سرعت شفت بر حسب دور در دقیقه')} type="number" min="0" max="200000" step="100" value={safeRpm} onChange={e=>onRpmChange(Math.min(200000,Math.max(0,Number(e.target.value))))}/><span>RPM</span></span></label>
          <label>{t('Playback','نمایش')}<select value={playback} onChange={e=>setPlayback(Number(e.target.value))}><option value="1">{t('1× · Real time','۱× · زمان واقعی')}</option><option value="0.1">{t('0.1× · Slow motion','۰٫۱× · حرکت آهسته')}</option><option value="0.02">{t('0.02× · Inspection','۰٫۰۲× · بررسی جزئیات')}</option></select></label>
        </div>}
        {g.supported && mode!=='section' && <div className="motion-status" role="status">{paused?t('Paused','متوقف'):safeRpm===0?t('Stopped · 0 RPM','توقف · ۰ دور در دقیقه'):playback===1?t('Real-time rotation','دوران در زمان واقعی'):t('Slow-motion inspection','بررسی با حرکت آهسته')} · {t('Displayed shaft','شفت نمایشی')}: {(paused?0:safeRpm*playback).toLocaleString()} RPM</div>}
      </div>
      <div className="viewer-notes">
        {mode==='section' || !g.supported ? <><div className="section-label">{t('SELECTED PRODUCT DIMENSIONS','ابعاد محصول انتخاب‌شده')}</div><h3>{p.d} × {p.D} × {p.B} mm</h3><p>{t('Bore × outside diameter × width, from this product’s catalog record.','قطر داخلی × قطر خارجی × عرض، از اطلاعات کاتالوگ این محصول.')}</p>{!g.supported&&<p>{t('This component has no supported rolling-element animation. Its catalog dimensions are shown instead.','این قطعه مدل متحرک اجزای غلتشی ندارد. ابعاد کاتالوگ آن نمایش داده می‌شود.')}</p>}</> : <>
          <div className="section-label">{t('OPERATING SPEED','سرعت کارکرد')}</div>
          <div className="shaft-readout">{safeRpm.toLocaleString()} <small>RPM</small></div>
          <p>{t('Shaft rotation follows this input, shared with the life calculator.','دوران شفت از این ورودی مشترک با محاسبه‌گر عمر پیروی می‌کند.')}</p>
          <div className="speed-reference"><label>{t('Catalog speed reference','سرعت مرجع کاتالوگ')}<select value={reference} onChange={e=>setReference(e.target.value)}><option value="grease">{t('Grease','گریس')}</option><option value="oil">{t('Oil','روغن')}</option></select></label><strong>{hasLimit?limit.toLocaleString()+' RPM':t('Not specified','ذکر نشده')}</strong><button disabled={!hasLimit} onClick={()=>onRpmChange(limit)}>{t('Use reference RPM','استفاده از دور مرجع')}</button></div>
          {hasLimit && safeRpm>limit && <p className="speed-exceeded" role="status">{t('Input exceeds the selected catalog speed reference.','سرعت ورودی از مرجع انتخاب‌شده کاتالوگ بیشتر است.')}</p>}
          {mode==='thermal' ? <><div className="thermal-value">{hasLimit?temp.toFixed(1):'—'}<small>°C</small></div><p>{t('Illustrative temperature only: 25 + 10r + 65r², where r is RPM / reference RPM. Load, lubrication and heat dissipation are not modeled.','دمای صرفاً نمایشی: ۲۵ + ۱۰r + ۶۵r²؛ r نسبت دور ورودی به دور مرجع است. بار، روانکاری و دفع حرارت مدل‌سازی نشده‌اند.')}</p></> : <dl className="motion-readings"><div><dt>{t('Inner ring / shaft','رینگ داخلی / شفت')}</dt><dd>{safeRpm.toLocaleString()} RPM</dd></div><div><dt>{t('Cage · estimated','قفسه · تخمینی')}</dt><dd>{Math.round(safeRpm*g.cageRatio).toLocaleString()} RPM</dd></div><div><dt>{t('Outer ring','رینگ خارجی')}</dt><dd>{t('Fixed','ثابت')}</dd></div></dl>}
          <p className="model-disclosure">{t('Outer dimensions match the selected product. Raceway shape, rolling-element count and cage geometry are representative estimates; seals are removed to show the mechanism. Catalog ratings are not live RPM measurements.','ابعاد خارجی مطابق محصول انتخاب‌شده است. شکل مسیر غلتش، تعداد اجزای غلتشی و هندسه قفسه تقریبی‌اند؛ آب‌بندها برای نمایش سازوکار حذف شده‌اند. دور کاتالوگ اندازه‌گیری زنده نیست.')}</p>
          {playback===1&&safeRpm>600&&<p className="model-disclosure">{t('At high RPM, screen sampling can make rotation appear slow or reversed. Select slow motion to inspect the parts.','در دور بالا، نمونه‌برداری نمایشگر ممکن است حرکت را کند یا معکوس نشان دهد. برای بررسی قطعات، حرکت آهسته را انتخاب کنید.')}</p>}
        </>}
      </div>
    </div>
  </div>;
}
