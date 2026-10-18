import { bearingScrollState } from '../../lib/bearing-scroll';
import { useBearingScroll } from './useBearingScroll';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import PortableBearing from './PortableBearing';
import { usePlatform } from './Context';
import type { BearingFamily } from './HeroBearingScene';
import {useBearingJourney} from './BearingJourney';
import { chooseHeroFamily } from '../../lib/hero-presentation';
import {subscribeMediaQuery} from '../../lib/browser-compat';
import RecoveryBoundary from './RecoveryBoundary';
const HeroBearingScene = lazy(() => import('./HeroBearingScene'));

export default function HeroBearing() {
  const { t } = usePlatform();
  const journey=useBearingJourney(),configure=journey?.configure;
  const [family] = useState<BearingFamily>(() => journey?.settings.family || chooseHeroFamily(null));
  const [playback, setPlayback] = useState(1);
  const [exploded,setExploded] = useState(false);
  const scrollMode = !exploded;
  const families: {id: BearingFamily; label: string; detail: string; caption: string}[] = [
    {id:'ball',label:t('Ball bearings','بلبرینگ‌ها'),detail:t('Angular-contact ball bearing','بلبرینگ تماس زاویه‌ای'),caption:t('Precision balls for spindle applications','ساچمه‌های دقیق برای کاربردهای اسپیندل')},
    {id:'roller',label:t('Roller bearings','رولبرینگ‌ها'),detail:t('Double-row spherical roller bearing','رولبرینگ بشکه‌ای دو ردیفه'),caption:t('Two rows of barrel-shaped rollers','دو ردیف غلتک بشکه‌ای')},
    {id:'thrust',label:t('Thrust bearings','رولبرینگ کف‌گرد'),detail:t('Tapered roller thrust bearing','رولبرینگ مخروطی کف‌گرد'),caption:t('T921-inspired proportions · illustrative construction','با الهام از T921 · مدل نمایشی')},
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
  const [sceneReady, setSceneReady] = useState(() => typeof IntersectionObserver !== 'function');
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(()=>configure?.({family,paused,automatic:scrollMode,reduced}),[configure,family,paused,scrollMode,reduced]);
  const stopped = paused || reduced || !visible || !tabVisible;
  const scrollProgress = useBearingScroll(stage, scrollMode && !paused && !reduced);
  const scrollState = bearingScrollState(scrollProgress);
  const followView = scrollMode && !reduced;
  const showParts = followView ? scrollState.phase === 'components' : exploded;
  const phaseLabel = !followView ? (exploded ? t('Exploded view','نمای انفجاری') : t('Assembled','مونتاژشده')) : scrollState.phase === 'assembled' ? t('Assembled', 'مونتاژشده') : scrollState.phase === 'components' ? t('Components revealed', 'نمای اجزای بیرینگ') : t('Opening the assembly', 'باز شدن مجموعه');
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches);
    const visibility = () => setTabVisible(!document.hidden);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setSceneReady(true);
    }, { rootMargin: '160px', threshold: 0 }) : null;
    if (stage.current) observer?.observe(stage.current);
    const unsubscribe = subscribeMediaQuery(media, motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer?.disconnect(); unsubscribe(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const resetTilt = () => {
    stage.current?.style.setProperty('--tilt-x', '0deg');
    stage.current?.style.setProperty('--tilt-y', '0deg');
  };
  const sceneFallback = <PortableBearing family={family} label={selected.detail+' · '+t('Illustrative model','مدل نمایشی')} paused={stopped} reducedMotion={reduced} exploded={exploded} playback={playback} scrollProgress={followView?scrollProgress:undefined}/>;
  return <div className={'hero-visual hero-bearing-showcase hero-bearing-banner' + (stopped ? ' is-still' : '')} data-scroll-mode={followView ? 'auto' : 'manual'}>
    <div className="hero-bearing-heading">
      <span><i aria-hidden="true" />{t('PRECISION IN MOTION', 'دقت در حرکت')}</span>
    </div>
    <fieldset className="bearing-view-switch"  aria-label={t('Bearing assembly view','نمای مونتاژ بیرینگ')}>
      <button type="button" aria-pressed={!exploded} onClick={()=>setExploded(false)}>{t('Assembled','مونتاژشده')}</button>
      <button type="button" aria-pressed={exploded} onClick={()=>setExploded(true)}>{t('Exploded view','نمای انفجاری')}</button>
    </fieldset>
    {!reduced && scrollMode && <div className="bearing-scroll-status"><span>{t('Scroll to explore', 'با اسکرول کاوش کنید')} <span aria-hidden="true">↓</span></span><strong>{phaseLabel}</strong><div className="bearing-scroll-track" aria-hidden="true"><i style={{ transform: `scaleX(${scrollProgress})` }} /></div></div>}
    <div className="hero-bearing-stage" ref={stage}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse' || stopped) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--tilt-x', ((.5 - (e.clientY - rect.top) / rect.height) * 10) + 'deg');
        e.currentTarget.style.setProperty('--tilt-y', (((e.clientX - rect.left) / rect.width - .5) * 14) + 'deg');
      }}
      onPointerLeave={resetTilt}>
      <button type="button" className="bearing-angle-control" disabled={stopped} onClick={resetTilt}
        aria-label={t('Adjust bearing angle with arrow keys; press Enter to reset.', 'تنظیم زاویه بیرینگ با کلیدهای جهت؛ برای بازنشانی Enter را بزنید.')}
      onKeyDown={(e) => {
        const target = stage.current;
        if (stopped || !target) return;
        const step = 4;
        const currentX = Number.parseFloat(getComputedStyle(target).getPropertyValue('--tilt-x')) || 0;
        const currentY = Number.parseFloat(getComputedStyle(target).getPropertyValue('--tilt-y')) || 0;
        switch (e.key) {
          case 'ArrowUp':
            target.style.setProperty('--tilt-x', `${Math.min(currentX + step, 12)}deg`);
            break;
          case 'ArrowDown':
            target.style.setProperty('--tilt-x', `${Math.max(currentX - step, -12)}deg`);
            break;
          case 'ArrowLeft':
            target.style.setProperty('--tilt-y', `${Math.max(currentY - step, -14)}deg`);
            break;
          case 'ArrowRight':
            target.style.setProperty('--tilt-y', `${Math.min(currentY + step, 14)}deg`);
            break;
          default:
            return;
        }
        e.preventDefault();
      }} />
      <div className="hero-bearing-halo" aria-hidden="true" />
      <div className="hero-bearing-orbit" aria-hidden="true" />
      <div className="hero-bearing-tilt hero-bearing-model">
        {sceneReady ? <RecoveryBoundary fallback={<div className="hero-model-fallback">{sceneFallback}</div>}><Suspense fallback={sceneFallback}>
          <HeroBearingScene cinematic family={family} paused={stopped} playback={playback} exploded={exploded} scrollProgress={followView ? scrollProgress : undefined} reducedMotion={reduced} partLabels={partLabels} label={selected.detail+' · '+(followView ? phaseLabel : exploded ? t('Exploded view','نمای انفجاری') : t('Assembled','مونتاژشده'))} fallback={sceneFallback}/>
        </Suspense></RecoveryBoundary> : sceneFallback}
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
        <select aria-label={t('Animation speed', 'سرعت انیمیشن')} value={playback} onChange={event => setPlayback(Number(event.target.value))}>
          <option value={.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option>
        </select>
      </div>
    </div>
  </div>;
}
