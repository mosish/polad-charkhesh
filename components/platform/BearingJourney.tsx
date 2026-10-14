import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import type {BearingFamily} from './HeroBearingScene';
import {chooseHeroFamily} from '../../lib/hero-presentation';
import {subscribeMediaQuery} from '../../lib/browser-compat';
type Settings={family:BearingFamily;paused:boolean;automatic:boolean;reduced:boolean};
const Journey=createContext<null|{settings:Settings;configure:(value:Settings)=>void;returnProgress:number;setReturnProgress:(value:number)=>void}>(null);
export const useBearingJourney=()=>useContext(Journey);
export function BearingJourneyProvider({children}:{children:ReactNode}){
 const [settings,configure]=useState<Settings>(()=>{
  let previous:string|null=null;try{previous=sessionStorage.getItem('pc-bearing-family');}catch{}
  const family=chooseHeroFamily(previous);
  return {family,paused:false,automatic:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 });
 useEffect(()=>{try{sessionStorage.setItem('pc-bearing-family',settings.family);}catch{}},[settings.family]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>configure(previous=>({...previous,reduced:media.matches}));return subscribeMediaQuery(media,changed);},[]);
 const [returnProgress,setReturnProgress]=useState(0);
 return <Journey.Provider value={{settings,configure,returnProgress,setReturnProgress}}>{children}</Journey.Provider>;
}
