import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import type {BearingFamily} from './HeroBearingScene';
type Settings={family:BearingFamily;paused:boolean;automatic:boolean;reduced:boolean};
const Journey=createContext<null|{experiment:boolean;setExperiment:(value:boolean)=>void;settings:Settings;configure:(value:Settings)=>void;returnProgress:number;setReturnProgress:(value:number)=>void}>(null);
export const useBearingJourney=()=>useContext(Journey);
export function BearingJourneyProvider({children}:{children:ReactNode}){
 const [settings,configure]=useState<Settings>(()=>{
  let family:BearingFamily='thrust';try{const saved=sessionStorage.getItem('pc-bearing-family');if(['thrust','ball','roller','accessories','engineered','track'].includes(saved||''))family=saved as BearingFamily;}catch{}
  return {family,paused:false,automatic:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 });
 const [experiment,setExperiment]=useState(()=>{const query=new URLSearchParams(location.search).get('motion');if(query==='classic')return false;if(query==='background')return true;try{return sessionStorage.getItem('pc-background-preview')!=='off';}catch{return true;}});
 useEffect(()=>{try{sessionStorage.setItem('pc-bearing-family',settings.family);sessionStorage.setItem('pc-background-preview',experiment?'on':'off');}catch{}},[settings.family,experiment]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>configure(previous=>({...previous,reduced:media.matches}));media.addEventListener('change',changed);return()=>media.removeEventListener('change',changed);},[]);
 const [returnProgress,setReturnProgress]=useState(0);
 return <Journey.Provider value={{experiment,setExperiment,settings,configure,returnProgress,setReturnProgress}}>{children}</Journey.Provider>;
}
