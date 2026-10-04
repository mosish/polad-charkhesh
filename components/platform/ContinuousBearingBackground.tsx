import {lazy,Suspense,useEffect,useState} from 'react';
import {useBearingJourney} from './BearingJourney';
import {continuousBearingState} from '../../lib/bearing-scroll';
const Scene=lazy(()=>import('./HeroBearingScene'));
export default function ContinuousBearingBackground(){
 const journey=useBearingJourney(),[progress,setProgress]=useState(0);
 const settings=journey?.settings,enabled=journey?.experiment;
 useEffect(()=>{
  if(!enabled||settings?.paused||settings?.reduced||!settings?.automatic)return;
  let frame=0;
  const measure=()=>{frame=0;if(document.hidden)return;const travel=document.documentElement.scrollHeight-innerHeight;setProgress(travel>0?Math.max(0,Math.min(1,scrollY/travel)):0);};
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(measure);};
  const resize=new ResizeObserver(schedule);resize.observe(document.body);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);};
 },[enabled,settings?.paused,settings?.reduced,settings?.automatic]);
 if(!journey||!enabled||settings?.reduced||!settings?.automatic)return null;
 const state=continuousBearingState(progress);
 return <div className="continuous-bearing-background" aria-hidden="true" data-background-family={settings!.family} data-page-progress={progress.toFixed(3)} style={{opacity:state.opacity,transform:`translate(${state.drift}vw,${Math.sin(progress*Math.PI)*8}vh)`}}>
  {state.opacity>0&&<Suspense fallback={null}><Scene family={settings!.family} paused reducedMotion={false} ambient scrollProgress={state.assembly} label="" fallback={null}/></Suspense>}
 </div>;
}
