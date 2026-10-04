import {createContext,useContext,useState,type ReactNode} from 'react';
import type {BearingFamily} from './HeroBearingScene';
type Settings={family:BearingFamily;paused:boolean;automatic:boolean;reduced:boolean};
const Journey=createContext<null|{settings:Settings;configure:(value:Settings)=>void;returnProgress:number;setReturnProgress:(value:number)=>void}>(null);
export const useBearingJourney=()=>useContext(Journey);
export function BearingJourneyProvider({children}:{children:ReactNode}){
 const [settings,configure]=useState<Settings>({family:'thrust',paused:false,automatic:true,reduced:false});
 const [returnProgress,setReturnProgress]=useState(0);
 return <Journey.Provider value={{settings,configure,returnProgress,setReturnProgress}}>{children}</Journey.Provider>;
}
