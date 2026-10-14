import {useEffect, useId, useLayoutEffect, useRef} from 'react';
import type {BearingProduct} from '../../domain/product';
import type {BearingFamily} from './HeroBearingScene';
import {advanceRotation, bearingGeometry} from '../../lib/bearing-motion';
import {bearingScrollState} from '../../lib/bearing-scroll';

type Props = {family: BearingFamily; label: string; product?: BearingProduct; paused?: boolean; reducedMotion?: boolean; exploded?: boolean; scrollProgress?: number; rpm?: number; playback?: number};
const ring = (outer: number, inner: number) => `M${outer} 0A${outer} ${outer} 0 1 0 ${-outer} 0A${outer} ${outer} 0 1 0 ${outer} 0M${inner} 0A${inner} ${inner} 0 1 1 ${-inner} 0A${inner} ${inner} 0 1 1 ${inner} 0`;

/** GPU-independent, illustrative projection. It also survives a failed Three.js import. */
export default function PortableBearing({family, label, product, paused=false, reducedMotion=false, exploded=false, scrollProgress, rpm=6, playback=1}: Props) {
  const id = 'portable' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const root = useRef<SVGSVGElement>(null), assembly = useRef<SVGGElement>(null);
  const controller = useRef<(()=>void)|null>(null);
  const controls = useRef({paused,reducedMotion,exploded,scrollProgress,rpm,playback});
  useLayoutEffect(()=>{controls.current={paused,reducedMotion,exploded,scrollProgress,rpm,playback};controller.current?.();},[paused,reducedMotion,exploded,scrollProgress,rpm,playback]);
  const geometry = product ? bearingGeometry(product) : null;
  const bore = geometry?.bore ?? (family==='track' ? 48 : 65);
  const pitch = geometry?.pitch ?? 108;
  const radius = geometry ? geometry.elementDiameter/2*(geometry.rows===2?.77:1) : family==='roller'?15:18;
  const rows = geometry?.rows ?? (family==='roller'?2:1);
  const count = geometry?.count ?? (family==='track'?22:18);
  const depth = Math.min(60, Math.max(8, geometry?.depth ?? (family==='roller'?42:24)));
  const roller = geometry?.roller ?? ['roller','thrust','track'].includes(family);
  const outerTrack = geometry ? 145-geometry.gap*.24 : 131;
  const innerTrack = geometry ? bore+geometry.gap*.24 : 84;
  const steel = `url(#${id}steel)`, edge = `url(#${id}edge)`, bronze = `url(#${id}bronze)`;
  useEffect(() => {
    const node=root.current; if(!node) return;
    const parts=Array.from(node.querySelectorAll<SVGGElement>('[data-portable-part]'));
    const shaft=node.querySelector<SVGGElement>('[data-portable-shaft]');
    const cage=node.querySelector<SVGGElement>('[data-portable-cage]');
    const elements=node.querySelector<SVGGElement>('[data-portable-elements]');
    const tread=node.querySelector<SVGGElement>('[data-portable-tread]');
    const rect=node.getBoundingClientRect();
    let inView=rect.bottom>0&&rect.top<innerHeight, frame=0, previous=0, angle=0, cageAngle=0;
    let expansion=controls.current.exploded?1:0;
    const draw=(now:number)=>{
      const active=inView&&!document.hidden;
      if(previous&&now-previous<1000/30-.5){if(active)frame=requestAnimationFrame(draw);return;}
      const seconds=previous?Math.min((now-previous)/1000,.1):0; previous=now;
      const current=controls.current;
      const scroll=current.scrollProgress===undefined?null:bearingScrollState(current.scrollProgress);
      const target=scroll?.expansion ?? (current.exploded?1:0);
      expansion=current.reducedMotion?target:expansion+(target-expansion)*(1-Math.exp(-7*Math.max(seconds,1/60)));
      if(Math.abs(target-expansion)<.001)expansion=target;
      const spinning=active&&!current.paused&&!current.reducedMotion&&current.rpm>0;
      if(spinning){
        angle=advanceRotation(angle,current.rpm,seconds,current.playback);
        cageAngle=advanceRotation(cageAngle,current.rpm*(geometry?.cageRatio??.4),seconds,current.playback);
      }
      parts.forEach((part,index)=>part.setAttribute('transform',`translate(${(index-1.5)*100*expansion} ${(index-1.5)*28*expansion})`));
      shaft?.setAttribute('transform',`rotate(${family==='track'?0:angle})`);
      tread?.setAttribute('transform',`rotate(${angle})`);
      cage?.setAttribute('transform',`rotate(${cageAngle})`);
      elements?.setAttribute('transform',`rotate(${cageAngle})`);
      const scale=(1-expansion*.34)*(1-(scroll?.recession??0)*.16);
      assembly.current?.setAttribute('transform',`translate(320 218) rotate(${-17-(scroll?.turn??0)*20}) scale(${scale} ${scale*.78})`);
      node.dataset.shaftAngle=angle.toFixed(3);node.dataset.expansion=expansion.toFixed(3);
      node.dataset.motionState=spinning?'playing':'paused';
      if(active&&(spinning||expansion!==target))frame=requestAnimationFrame(draw);
    };
    const sync=()=>{cancelAnimationFrame(frame);previous=0;draw(performance.now());};
    controller.current=sync;
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();}):null;
    observer?.observe(node);document.addEventListener('visibilitychange',sync);sync();
    return()=>{cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('visibilitychange',sync);controller.current=null;};
  },[family,product?.id,product?.d,product?.D,product?.B,geometry?.cageRatio]);
  const face=(outer:number,inner:number,thickness=depth,fill=steel)=><>
    {[...Array(8)].map((_,index)=><path key={index} d={ring(outer,inner)} transform={`translate(0 ${thickness*(1-index/8)})`} fill={edge} stroke="#93acc044" strokeWidth=".7"/>)}
    <path d={ring(outer,inner)} fill={fill} stroke="#d6e3ee" strokeWidth="1"/>
    <circle r={outer-2} fill="none" stroke="#ecf5ff" strokeOpacity=".65" strokeWidth=".8"/>
    <circle r={inner+2} fill="none" stroke="#273a4d" strokeWidth="2"/>
    {[.25,.5,.75].map(amount=><circle key={amount} r={inner+(outer-inner)*amount} fill="none" stroke="#344b6280" strokeWidth=".45"/>)}
  </>;
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An inline animated SVG needs a named image role; an HTML img cannot contain its parts.
  return <svg ref={root} className="portable-bearing" viewBox="0 0 640 440" role="img" aria-label={label} data-renderer="svg" data-family={family} data-product={product?.code}>
    <defs>
      <linearGradient id={id+'steel'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0f7ff"/><stop offset=".18" stopColor="#6d8397"/><stop offset=".35" stopColor="#d6e3ee"/><stop offset=".52" stopColor="#394f63"/><stop offset=".72" stopColor="#e5edf3"/><stop offset="1" stopColor="#71899d"/></linearGradient>
      <linearGradient id={id+'edge'}><stop stopColor="#152638"/><stop offset=".34" stopColor="#8ba5ba"/><stop offset=".65" stopColor="#23394c"/><stop offset="1" stopColor="#617c93"/></linearGradient>
      <linearGradient id={id+'bronze'}><stop stopColor="#594427"/><stop offset=".25" stopColor="#e7c383"/><stop offset=".65" stopColor="#8d6839"/><stop offset="1" stopColor="#d4b072"/></linearGradient>
      <radialGradient id={id+'ball'} cx="30%" cy="24%" r="76%"><stop stopColor="#fff"/><stop offset=".2" stopColor="#dce8f2"/><stop offset=".6" stopColor="#8199ae"/><stop offset="1" stopColor="#172b3c"/></radialGradient>
      <linearGradient id={id+'roller'}><stop stopColor="#263d52"/><stop offset=".24" stopColor="#9bb2c4"/><stop offset=".5" stopColor="#f2f7fc"/><stop offset=".78" stopColor="#a6bdcf"/><stop offset="1" stopColor="#344d63"/></linearGradient>
    </defs>
    <ellipse cx="320" cy="360" rx="167" ry="22" fill="#020914" opacity=".45"/>
    <g ref={assembly} transform="translate(320 218) rotate(-17) scale(1 .78)">
      <g data-portable-part="outer">
        {family==='engineered'&&<><path d="M-175 85H175V145H-175Z" fill={edge} stroke="#9cb5c8"/><path d="M-175 145H175V163H-175Z" fill="#14283a"/>{[-140,140].map(x=><ellipse key={x} cx={x} cy="111" rx="12" ry="8" fill="#071624" stroke="#adbed1" strokeWidth="3"/>)}</>}
        {family==='accessories'?<><path d="M-90-65L-125 70H125L90-65Z" fill={steel} stroke="#b9cddc"/><ellipse cy="-65" rx="90" ry="55" fill={edge} stroke="#b9cddc"/><ellipse cy="-65" rx="66" ry="41" fill="#102237"/><path d="M88-63L121 69" stroke="#1a2e42" strokeWidth="6"/></>:<g data-portable-tread={family==='track'?'true':undefined}>{face(145,outerTrack)}{family==='track'&&<path d="M134 0H143" stroke="#d7e6f3" strokeWidth="3"/>}</g>}
      </g>
      <g data-portable-part="elements"><g data-portable-elements="true">
        {family==='accessories'?face(134,89,22):Array.from({length:rows},(_,row)=><g key={row} transform={`translate(0 ${rows===2?(row-.5)*radius*1.6:0})`}>{Array.from({length:count},(_,index)=><g key={index} transform={`rotate(${index*360/count+row*180/count}) translate(${pitch} 0)`}>
          {roller?<><path d={product?.schematicType==='tapered'||family==='thrust'?`M${-radius*.65} ${-radius}L${radius*.8} ${-radius*.76}V${radius*.76}L${-radius*.65} ${radius}Z`:`M${-radius*.72} ${-radius}Q0 ${-radius*1.12} ${radius*.72} ${-radius}V${radius}Q0 ${radius*1.12} ${-radius*.72} ${radius}Z`} fill={`url(#${id}roller)`} stroke="#c1d0df" strokeWidth=".7"/><ellipse cy={-radius} rx={radius*.7} ry={radius*.18} fill="#ccdce8"/></>:<circle r={radius} fill={`url(#${id}ball)`} stroke="#8ba4bc" strokeWidth=".7"/>}
        </g>)}</g>)}
      </g></g>
      <g data-portable-part="cage"><g data-portable-cage="true">
        {family==='accessories'?face(130,90,4,bronze):<>
          {[pitch-radius*1.2,pitch+radius*1.2].map(r=><circle key={r} r={r} fill="none" stroke={bronze} strokeWidth="4"/>)}
          {Array.from({length:count},(_,index)=><g key={index} transform={`rotate(${(index+.5)*360/count}) translate(${pitch} 0)`}><rect x={-radius*1.4} y="-2.5" width={radius*2.8} height="5" rx="2" fill={bronze}/><circle r="2" fill="#edd0a1"/></g>)}
        </>}
      </g></g>
      <g data-portable-part="inner">
        {family==='thrust'?face(145,65,16):family==='track'?<>{face(80,0,50)}<path d="M-37 45V143Q0 162 37 143V45" fill={steel} stroke="#b9ccdc"/>{Array.from({length:6},(_,i)=><path key={i} d={`M-36 ${105+i*6}Q0 ${120+i*6} 36 ${105+i*6}`} fill="none" stroke="#38546d"/>)}</>:face(innerTrack,bore,depth)}
        <g data-portable-shaft="true"><path d={`M${bore+3} 0H${innerTrack-3}`} stroke="#f4c778" strokeWidth="3"/>{[0,90,180,270].map(a=><path key={a} d={`M${bore+3} 0H${innerTrack-3}`} transform={`rotate(${a})`} stroke="#253c51" strokeWidth="1"/>)}</g>
      </g>
    </g>
  </svg>;
}
