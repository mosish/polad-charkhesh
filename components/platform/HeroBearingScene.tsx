import {lazy, Suspense, useEffect, useState} from 'react';
import {preferredGpuRenderer} from '../../lib/browser-compat';
import type {SceneProps} from './BearingSceneRenderer';
export type {BearingFamily, SceneProps} from './BearingSceneRenderer';

const ModernScene=lazy(()=>import('./ModernBearingScene'));
const LegacyScene=lazy(()=>import('./LegacyBearingScene'));

/** Pick before downloading a GPU engine; older Safari never needs both stacks. */
export default function HeroBearingScene(props:SceneProps){
  const [engine,setEngine]=useState<'webgl1'|'webgl2'|null>(null);
  useEffect(()=>{
    // Let the headline and portable scene paint before creating a GPU context.
    let cancelled=false;
    const timer=window.setTimeout(()=>{if(!cancelled)setEngine(preferredGpuRenderer());},80);
    return()=>{cancelled=true;window.clearTimeout(timer);};
  },[]);
  if(!engine)return <>{props.fallback}</>;
  return <Suspense fallback={props.fallback}>{engine==='webgl2'
    ? <ModernScene {...props} onFailure={()=>setEngine('webgl1')}/>
    : <LegacyScene {...props}/>}</Suspense>;
}
