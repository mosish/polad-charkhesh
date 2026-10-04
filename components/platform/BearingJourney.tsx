import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import type {BearingFamily} from './HeroBearingScene';
type Settings={family:BearingFamily;paused:boolean;automatic:boolean;reduced:boolean};
const Journey=createContext<null|{experiment:boolean;settings:Settings;configure:(value:Settings)=>void;returnProgress:number;setReturnProgress:(value:number)=>void}>(null);
export const useBearingJourney=()=>useContext(Journey);
export function BearingJourneyProvider({children}:{children:ReactNode}){
 const [settings,configure]=useState<Settings>(()=>{
  let family:BearingFamily='thrust';try{const saved=sessionStorage.getItem('pc-bearing-family');if(['thrust','ball','roller','accessories','engineered','track'].includes(saved||''))family=saved as BearingFamily;}catch{}
  return {family,paused:false,automatic:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 });
 const experiment=new URLSearchParams(location.search).get('motion')!=='classic';
 useEffect(()=>{try{sessionStorage.setItem('pc-bearing-family',settings.family);}catch{}},[settings.family]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>configure(previous=>({...previous,reduced:media.matches}));media.addEventListener('change',changed);return()=>media.removeEventListener('change',changed);},[]);
 const [returnProgress,setReturnProgress]=useState(0);
 return <Journey.Provider value={{experiment,settings,configure,returnProgress,setReturnProgress}}>{children}</Journey.Provider>;
}
