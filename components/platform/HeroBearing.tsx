import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import BearingModel from './BearingModel';
import { usePlatform } from './Context';
import type { BearingFamily } from './HeroBearingScene';
const HeroBearingScene = lazy(() => import('./HeroBearingScene'));

export default function HeroBearing() {
  const { products, content, t } = usePlatform();
  const [family, setFamily] = useState<BearingFamily>('precision');
  const families: {id: BearingFamily; label: string; detail: string; caption: string}[] = [
    {id:'precision',label:t('Super-precision','فوق دقیق'),detail:t('Angular-contact ball bearing','بلبرینگ تماس زاویه‌ای'),caption:t('Precision for spindle applications','دقت برای کاربردهای اسپیندل')},
    {id:'rolling',label:t('Rolling bearings','بیرینگ‌های غلتشی'),detail:t('Cylindrical roller bearing','رولبرینگ استوانه‌ای'),caption:t('Rollers designed for radial loads','غلتک‌ها برای تحمل بار شعاعی')},
    {id:'plain',label:t('Plain bearings','یاتاقان‌های لغزشی'),detail:t('Spherical plain bearing','یاتاقان لغزشی کروی'),caption:t('Sliding contact. Angular freedom.','تماس لغزشی، آزادی زاویه‌ای')},
  ];
  const selected = families.find(f => f.id === family)!;
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const stage = useRef<HTMLDivElement>(null);
  const p = products.find(p => p.schematicType === (family === 'rolling' ? 'cylindrical' : 'angular-contact')) || products.find(p => p.schematicType === 'deep-groove');
  const stopped = paused || reduced || !visible || !tabVisible;
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches);
    const visibility = () => setTabVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    if (stage.current) observer.observe(stage.current);
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const resetTilt = () => {
    stage.current?.style.setProperty('--tilt-x', '0deg');
    stage.current?.style.setProperty('--tilt-y', '0deg');
  };
  return <div className={'hero-visual hero-bearing-showcase' + (stopped ? ' is-still' : '')}>
    <div className="hero-bearing-heading">
      <span><i aria-hidden="true" />{t('PRECISION IN MOTION', 'دقت در حرکت')}</span>
      <span dir="ltr">{String(families.findIndex(f => f.id === family) + 1).padStart(2,'0')} / 03</span>
    </div>
    <div className="hero-bearing-selector" role="group" aria-label={t('Bearing family','خانواده بیرینگ')}>
      {families.map(f => <button key={f.id} type="button" aria-pressed={family===f.id} onClick={()=>{setFamily(f.id);resetTilt();}}>{f.label}</button>)}
    </div>
    <div className="hero-bearing-stage" ref={stage}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse' || stopped) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--tilt-x', ((.5 - (e.clientY - rect.top) / rect.height) * 10) + 'deg');
        e.currentTarget.style.setProperty('--tilt-y', (((e.clientX - rect.left) / rect.width - .5) * 14) + 'deg');
      }} onPointerLeave={resetTilt}>
      <div className="hero-bearing-halo" aria-hidden="true" />
      <div className="hero-bearing-orbit" aria-hidden="true" />
      <div className="hero-bearing-tilt hero-bearing-model">
        <Suspense fallback={<div className="hero-model-loading">{t('Preparing bearing view…','آماده‌سازی نمای بیرینگ…')}</div>}>
          <HeroBearingScene family={family} paused={stopped} label={selected.detail} fallback={family !== 'plain' && p ? <BearingModel p={p} rpm={0} playback={1} paused compact/> : <div className="hero-model-loading">{selected.detail}<small>{t('3D view unavailable on this device','نمای سه‌بعدی در این دستگاه در دسترس نیست')}</small></div>}/>
        </Suspense>
      </div>
      <span className="hero-bearing-caption">{t('Illustrative model · motion slowed for clarity','مدل نمایشی · حرکت آهسته برای وضوح بیشتر')}</span>
    </div>
    <div className="hero-bearing-footer">
      <div aria-live="polite"><small>{selected.caption}</small><strong>{selected.detail}</strong></div>
      <div className="hero-bearing-actions">
        <button type="button" aria-label={t(stopped ? 'Play bearing animation' : 'Pause bearing animation', stopped ? 'شروع حرکت بیرینگ' : 'توقف حرکت بیرینگ')}
          title={t(stopped ? 'Play bearing animation' : 'Pause bearing animation', stopped ? 'شروع حرکت بیرینگ' : 'توقف حرکت بیرینگ')}
          onClick={() => { if (reduced) setReduced(false); setPaused(!stopped); resetTilt(); }}>
          {stopped ? <Play size={16}/> : <Pause size={16}/>}
        </button>
        <a href={content?.links?.heroVisual || '/engineering'} aria-label={t('Explore bearing engineering', 'کاوش مهندسی بیرینگ')}><ArrowUpRight size={20}/></a>
      </div>
    </div>
  </div>;
}
