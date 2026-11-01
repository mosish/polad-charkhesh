import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import type {BearingFamily} from './HeroBearingScene';
import {chooseHeroLineup, type HeroLineup} from '../../lib/hero-presentation';
import {subscribeMediaQuery} from '../../lib/browser-compat';
type Settings={family:BearingFamily;paused:boolean;automatic:boolean;reduced:boolean};
const Journey=createContext<null|{lineup:HeroLineup;settings:Settings;configure:(value:Settings)=>void;returnProgress:number;setReturnProgress:(value:number)=>void}>(null);
export const useBearingJourney=()=>useContext(Journey);
export function BearingJourneyProvider({children}:{children:ReactNode}){
 const [lineup]=useState(()=>{
  let previous:unknown=null;try{previous=JSON.parse(sessionStorage.getItem('pc-bearing-lineup') || 'null');}catch{}
  return chooseHeroLineup(previous);
 });
 useEffect(()=>{try{sessionStorage.setItem('pc-bearing-lineup',JSON.stringify(lineup));}catch{}},[lineup]);
 const [settings,configure]=useState<Settings>(()=>{
  const family=lineup[1];
  return {family,paused:false,automatic:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 });
 useEffect(()=>{try{sessionStorage.setItem('pc-bearing-family',settings.family);}catch{}},[settings.family]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>configure(previous=>({...previous,reduced:media.matches}));return subscribeMediaQuery(media,changed);},[]);
 const [returnProgress,setReturnProgress]=useState(0);
 return <Journey.Provider value={{lineup,settings,configure,returnProgress,setReturnProgress}}>{children}</Journey.Provider>;
}
