import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {useBearingJourney} from './BearingJourney';
import {usePlatform} from './Context';
import {bearingReturnProgress} from '../../lib/bearing-scroll';
import RecoveryBoundary from './RecoveryBoundary';
import PortableBearing from './PortableBearing';
const Scene=lazy(()=>import('./HeroBearingScene'));
export default function BearingReturn(){
 const journey=useBearingJourney(),{t}=usePlatform();
 const section=useRef<HTMLElement>(null),[visible,setVisible]=useState(false),[loaded,setLoaded]=useState(false);
 const settings=journey?.settings,setProgress=journey?.setReturnProgress;
 useEffect(()=>{
  const node=section.current;if(!node||!settings||!setProgress)return;
  let frame=0;
  const measure=()=>{frame=0;if(document.hidden||settings.paused)return;const rect=node.getBoundingClientRect();setProgress(bearingReturnProgress(rect.top,rect.height,innerHeight));};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(entry.isIntersecting)setLoaded(true);schedule();}):null;observer?.observe(node);
  if(!observer){setVisible(true);setLoaded(true);}
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;resize?.observe(node);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();resize?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);};
 },[settings?.paused,setProgress]);
 if(!journey)return null;
 const progress=settings!.reduced||!settings!.automatic?1:journey.returnProgress;
 const fallback=<PortableBearing family={settings!.family} paused={settings!.paused||!visible||!settings!.automatic} reducedMotion={settings!.reduced} scrollProgress={settings!.reduced||!settings!.automatic?undefined:1-progress} label={t('Bearing reassembly · illustrative model','مونتاژ دوباره بیرینگ · مدل نمایشی')}/>;
 return <section ref={section} className="bearing-return" data-return-family={settings!.family} aria-label={t('Bearing assembly finale','پایان مسیر مونتاژ بیرینگ')}>
  <div><span className="section-label">{t('EVERY PART. ONE PURPOSE.','هر جزء، یک هدف.')}</span><h2>{t('Precision comes together.','دقت، یکپارچه می‌شود.')}</h2><p>{t('From individual components to one complete assembly.','از اجزای جداگانه تا یک مجموعه کامل.')}</p><small>{progress>.95?t('Assembly complete','مونتاژ کامل'):t('Scroll to bring the parts together','برای کنار هم آوردن اجزا اسکرول کنید')}</small></div>
  <div className="bearing-return-model">{loaded?<RecoveryBoundary fallback={fallback}><Suspense fallback={fallback}><Scene family={settings!.family} paused={settings!.paused||!visible||!settings!.automatic} reducedMotion={settings!.reduced} scrollProgress={settings!.reduced||!settings!.automatic?undefined:1-progress} label={t('Selected bearing reassembly · illustrative model','مونتاژ دوباره بیرینگ انتخاب‌شده · مدل نمایشی')} fallback={fallback}/></Suspense></RecoveryBoundary>:fallback}</div>
 </section>;
}
