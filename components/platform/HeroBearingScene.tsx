import {lazy, Suspense, useState} from 'react';
import {preferredGpuRenderer} from '../../lib/browser-compat';
import type {SceneProps} from './BearingSceneRenderer';
export type {BearingFamily, SceneProps} from './BearingSceneRenderer';

const ModernScene=lazy(()=>import('./ModernBearingScene'));
const LegacyScene=lazy(()=>import('./LegacyBearingScene'));

/** Pick before downloading a GPU engine; older Safari never needs both stacks. */
export default function HeroBearingScene(props:SceneProps){
  const [engine,setEngine]=useState(preferredGpuRenderer);
  return <Suspense fallback={props.fallback}>{engine==='webgl2'
    ? <ModernScene {...props} onFailure={()=>setEngine('webgl1')}/>
    : <LegacyScene {...props}/>}</Suspense>;
}
