import { bearingScrollState } from '../../lib/bearing-scroll';
import { useBearingScroll } from './useBearingScroll';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import BearingModel from './BearingModel';
import { usePlatform } from './Context';
import type { BearingFamily } from './HeroBearingScene';
import BearingBackground from './BearingBackground';
import {useBearingJourney} from './BearingJourney';
import { publicHref } from '../../lib/public-links';
const HeroBearingScene = lazy(() => import('./HeroBearingScene'));

export default function HeroBearing() {
  const { products, content, t } = usePlatform();
  const journey=useBearingJourney(),configure=journey?.configure;
  const [family, setFamily] = useState<BearingFamily>(journey?.settings.family || 'thrust');
  const [exploded,setExploded] = useState(false);
  const [scrollMode, setScrollMode] = useState(true);
  const families: {id: BearingFamily; label: string; detail: string; caption: string}[] = [
    {id:'thrust',label:t('Thrust bearings','رولبرینگ کف‌گرد'),detail:t('Tapered roller thrust bearing','رولبرینگ مخروطی کف‌گرد'),caption:t('T921-inspired proportions · illustrative construction','با الهام از T921 · مدل نمایشی')},
    {id:'ball',label:t('Ball bearings','بلبرینگ‌ها'),detail:t('Angular-contact ball bearing','بلبرینگ تماس زاویه‌ای'),caption:t('Precision balls for spindle applications','ساچمه‌های دقیق برای کاربردهای اسپیندل')},
    {id:'roller',label:t('Roller bearings','رولبرینگ‌ها'),detail:t('Double-row spherical roller bearing','رولبرینگ بشکه‌ای دو ردیفه'),caption:t('Two rows of barrel-shaped rollers','دو ردیف غلتک بشکه‌ای')},
    {id:'accessories',label:t('Bearings accessories','متعلقات بیرینگ'),detail:t('Adapter sleeve, locknut and washer','بوش تبدیلی، مهره قفلی و واشر'),caption:t('Mounting components shown as an illustrative assembly','اجزای نصب به‌صورت مجموعه نمایشی')},
    {id:'engineered',label:t('Engineered products','محصولات مهندسی‌شده'),detail:t('Housed bearing unit','واحد بیرینگ محفظه‌دار'),caption:t('Bearing insert within a mounted housing','بیرینگ داخلی درون محفظه نصب‌شونده')},
    {id:'track',label:t('Track rollers','رولرهای مسیر'),detail:t('Stud-type track roller','رولر مسیر پایه‌دار'),caption:t('Cam follower with a fixed stud and rotating outer ring','رولر پیرو با پایه ثابت و رینگ بیرونی چرخان')},
  ];
  const bearingParts=[t('Outer ring','رینگ خارجی'),t('Rolling elements','اجزای غلتشی'),t('Cage','قفسه'),t('Inner ring','رینگ داخلی')];
  const partLabels=family==='thrust'?[t('Housing washer','واشر محفظه'),t('Tapered rollers','غلتک‌های مخروطی'),t('Cage','قفسه'),t('Shaft washer','واشر شفت')]:family==='accessories'?[t('Adapter sleeve','بوش تبدیلی'),t('Locknut','مهره قفلی'),t('Lock washer','واشر قفلی'),t('Shaft seat','نشیمن شفت')]:family==='engineered'?[t('Housing','محفظه'),t('Bearing insert','بیرینگ داخلی'),t('Mounting bolts','پیچ‌های نصب'),t('Shaft seat','نشیمن شفت')]:family==='track'?[t('Outer roller','رولر بیرونی'),t('Needle rollers','غلتک‌های سوزنی'),t('End washer','واشر انتهایی'),t('Stud','پایه')]:bearingParts;
  const selected = families.find(f => f.id === family)!;
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const stage = useRef<HTMLDivElement>(null);
  const p = products.find(p => p.schematicType === (family === 'roller' ? 'spherical' : family === 'track' ? 'needle' : 'angular-contact')) || products.find(p => p.schematicType === 'deep-groove');
  useEffect(()=>configure?.({family,paused,automatic:scrollMode,reduced}),[configure,family,paused,scrollMode,reduced]);
  const stopped = paused || reduced || !visible || !tabVisible;
  const scrollProgress = useBearingScroll(stage, scrollMode && !paused && !reduced);
  const scrollState = bearingScrollState(scrollProgress);
  const showParts = scrollMode && !reduced ? scrollState.phase === 'components' : exploded;
  const phaseLabel = scrollState.phase === 'assembled' ? t('Assembled', 'مونتاژشده') : scrollState.phase === 'components' ? t('Components revealed', 'نمای اجزای بیرینگ') : t('Opening the assembly', 'باز شدن مجموعه');
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
  return <><div className={'hero-visual hero-bearing-showcase' + (stopped ? ' is-still' : '')} data-scroll-mode={scrollMode && !reduced ? 'auto' : 'manual'}>
    <div className="hero-bearing-heading">
      <span><i aria-hidden="true" />{t('PRECISION IN MOTION', 'دقت در حرکت')}</span>
      <span dir="ltr">{String(families.findIndex(f => f.id === family) + 1).padStart(2,'0')} / {String(families.length).padStart(2,'0')}</span>
    </div>
    <div className="hero-bearing-selector" role="group" aria-label={t('Bearing family','خانواده بیرینگ')}>
      {families.map(f => <button key={f.id} type="button" aria-pressed={family===f.id} onClick={()=>{setFamily(f.id);resetTilt();}}>{f.label}</button>)}
    </div>
    <div className="bearing-view-switch" role="group" aria-label={t('Bearing assembly view','نمای مونتاژ بیرینگ')}>
      <button type="button" aria-pressed={(reduced || !scrollMode) && !exploded} onClick={()=>{setScrollMode(false);setExploded(false);}}>{t('Assembled','مونتاژشده')}</button>
      <button type="button" aria-pressed={(reduced || !scrollMode) && exploded} onClick={()=>{setScrollMode(false);setExploded(true);}}>{t('Exploded view','نمای انفجاری')}</button>
      {!reduced && <button type="button" aria-pressed={scrollMode} onClick={()=>setScrollMode(true)}>{t('Follow scroll', 'همراه اسکرول')}</button>}
    </div>
    {!reduced && scrollMode && <div className="bearing-scroll-status"><span>{t('Scroll to explore', 'با اسکرول کاوش کنید')} <span aria-hidden="true">↓</span></span><strong>{phaseLabel}</strong><div className="bearing-scroll-track" aria-hidden="true"><i style={{ transform: `scaleX(${scrollProgress})` }} /></div></div>}
    <div className="hero-bearing-stage" ref={stage}
      tabIndex={0}
      role="img"
      aria-label={t('Bearing view. Use arrow keys to adjust the angle.', 'نمای بیرینگ. برای تنظیم زاویه از کلیدهای جهتی استفاده کنید.')}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse' || stopped) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--tilt-x', ((.5 - (e.clientY - rect.top) / rect.height) * 10) + 'deg');
        e.currentTarget.style.setProperty('--tilt-y', (((e.clientX - rect.left) / rect.width - .5) * 14) + 'deg');
      }}
      onPointerLeave={resetTilt}
      onKeyDown={(e) => {
        if (stopped) return;
        const step = 4;
        const currentX = Number.parseFloat(getComputedStyle(e.currentTarget).getPropertyValue('--tilt-x')) || 0;
        const currentY = Number.parseFloat(getComputedStyle(e.currentTarget).getPropertyValue('--tilt-y')) || 0;
        switch (e.key) {
          case 'ArrowUp':
            e.currentTarget.style.setProperty('--tilt-x', `${Math.min(currentX + step, 12)}deg`);
            break;
          case 'ArrowDown':
            e.currentTarget.style.setProperty('--tilt-x', `${Math.max(currentX - step, -12)}deg`);
            break;
          case 'ArrowLeft':
            e.currentTarget.style.setProperty('--tilt-y', `${Math.max(currentY - step, -14)}deg`);
            break;
          case 'ArrowRight':
            e.currentTarget.style.setProperty('--tilt-y', `${Math.min(currentY + step, 14)}deg`);
            break;
          default:
            return;
        }
        e.preventDefault();
      }}>
      <div className="hero-bearing-halo" aria-hidden="true" />
      <div className="hero-bearing-orbit" aria-hidden="true" />
      <div className="hero-bearing-tilt hero-bearing-model">
        <Suspense fallback={<div className="hero-model-loading">{t('Preparing bearing view…','آماده‌سازی نمای بیرینگ…')}</div>}>
          <HeroBearingScene family={family} paused={stopped} exploded={exploded} scrollProgress={scrollMode && !reduced ? scrollProgress : undefined} reducedMotion={reduced} partLabels={partLabels} label={selected.detail+' · '+(scrollMode && !reduced ? phaseLabel : exploded ? t('Exploded view','نمای انفجاری') : t('Assembled','مونتاژشده'))} fallback={!exploded && (family==='ball'||family==='roller') && p ? <BearingModel p={p} rpm={0} playback={1} paused compact/> : <div className="hero-model-loading">{selected.detail}<small>{t('3D view unavailable on this device','نمای سه‌بعدی در این دستگاه در دسترس نیست')}</small></div>}/>
        </Suspense>
      </div>
      <span className="hero-bearing-caption">{t('Illustrative model · motion slowed for clarity','مدل نمایشی · حرکت آهسته برای وضوح بیشتر')}</span>
    </div>
    {(exploded||(scrollMode&&!reduced))&&<div style={{visibility:showParts?'visible':'hidden'}} aria-hidden={!showParts} className="bearing-parts-key" aria-label={t('Bearing parts','اجزای بیرینگ')}>{partLabels.map((name,i)=><span key={name}><b>{i+1}</b>{name}</span>)}</div>}
    <div className="hero-bearing-footer">
      <div aria-live="polite"><small>{selected.caption}</small><strong>{selected.detail}</strong></div>
      <div className="hero-bearing-actions">
        <button type="button" aria-label={t(stopped ? 'Play bearing animation' : 'Pause bearing animation', stopped ? 'شروع حرکت بیرینگ' : 'توقف حرکت بیرینگ')}
          title={t(stopped ? 'Play bearing animation' : 'Pause bearing animation', stopped ? 'شروع حرکت بیرینگ' : 'توقف حرکت بیرینگ')}
          onClick={() => { if (reduced) setReduced(false); setPaused(!stopped); resetTilt(); }}>
          {stopped ? <Play size={16}/> : <Pause size={16}/>}
        </button>
        <a href={publicHref(content?.links?.heroVisual || '/engineering')} aria-label={t('Explore bearing engineering', 'کاوش مهندسی بیرینگ')}><ArrowUpRight size={20}/></a>
      </div>
    </div>
  </div>
    {scrollMode && !reduced && !journey?.experiment && <BearingBackground family={family} recession={scrollState.recession*(1-(journey?.returnProgress||0))}/>}

  </>;
}
