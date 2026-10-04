import { useEffect, useId, useRef } from 'react';
import type { BearingProduct } from '../../domain/product';
import { advanceRotation, bearingGeometry } from '../../lib/bearing-motion';
import { usePlatform } from './Context';

function annulus(outer: number, inner: number) {
  return `M${outer} 0A${outer} ${outer} 0 1 0 ${-outer} 0A${outer} ${outer} 0 1 0 ${outer} 0M${inner} 0A${inner} ${inner} 0 1 1 ${-inner} 0A${inner} ${inner} 0 1 1 ${inner} 0`;
}

export default function BearingModel({ p, rpm, paused, playback, compact = false }: {compact?: boolean; p: BearingProduct; rpm: number; paused: boolean; playback: number}) {
  const { t } = usePlatform();
  const id = 'bearing' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const cage = useRef<SVGGElement>(null), inner = useRef<SVGGElement>(null);
  const model = useRef<SVGSVGElement>(null);
  const angles = useRef({shaft: 0, cage: 0, spin: 0});
  const g = bearingGeometry(p);
  useEffect(() => {
    if (paused || !g.supported || rpm <= 0) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const spins = model.current?.querySelectorAll('[data-spin]');
    let handle = 0, previous: number | undefined, inView = false;
    const tick = (now: number) => {
      const seconds = previous === undefined ? 0 : (now - previous) / 1000;
      previous = now;
      angles.current.shaft = advanceRotation(angles.current.shaft, rpm, seconds, playback);
      angles.current.cage = advanceRotation(angles.current.cage, rpm * g.cageRatio, seconds, playback);
      angles.current.spin = advanceRotation(angles.current.spin, rpm * g.spinRatio, seconds, playback);
      inner.current?.setAttribute('transform', `rotate(${angles.current.shaft})`);
      cage.current?.setAttribute('transform', `rotate(${angles.current.cage})`);
      spins?.forEach(element => element.setAttribute('transform', `rotate(${-angles.current.spin})`));
      handle = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(handle); previous = undefined;
      if (inView && !document.hidden && !preference.matches) handle = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    if (model.current) observer.observe(model.current);
    document.addEventListener('visibilitychange', sync); preference.addEventListener('change', sync);
    return () => { cancelAnimationFrame(handle); observer.disconnect(); document.removeEventListener('visibilitychange', sync); preference.removeEventListener('change', sync); };
  }, [rpm, paused, playback, p.id, g.cageRatio, g.spinRatio, g.supported]);
  const {outer: R, bore: r, gap, pitch, depth} = g;
  const outerTrack = R - gap * .24, innerTrack = r + gap * .24;
  const ball = g.elementDiameter / 2 * (g.rows === 2 ? .77 : 1);
  const steel = `url(#${id}steel)`, dark = `url(#${id}edge)`;
  return <svg ref={model} className="bearing-render" viewBox={compact ? '55 45 410 340' : '0 0 520 440'} role="img" aria-label={`${p.code}: ${p.schematicType} bearing cutaway, ${p.d} × ${p.D} × ${p.B} mm`}>
    <defs>
      <linearGradient id={id+'steel'} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f4f7fc"/><stop offset=".17" stopColor="#8798af"/><stop offset=".32" stopColor="#e9eff6"/><stop offset=".49" stopColor="#576a83"/><stop offset=".63" stopColor="#f1f5fa"/><stop offset=".8" stopColor="#9cacc0"/><stop offset="1" stopColor="#d7e1ee"/>
      </linearGradient>
      <linearGradient id={id+'edge'}><stop stopColor="#111c2a"/><stop offset=".3" stopColor="#698099"/><stop offset=".5" stopColor="#26384d"/><stop offset=".82" stopColor="#8da0b6"/><stop offset="1" stopColor="#192839"/></linearGradient>
      <radialGradient id={id+'ball'} cx="32%" cy="23%" r="78%"><stop stopColor="#fff"/><stop offset=".2" stopColor="#ecf2fa"/><stop offset=".48" stopColor="#a6b7cc"/><stop offset=".78" stopColor="#394d66"/><stop offset="1" stopColor="#112035"/></radialGradient>
      <linearGradient id={id+'roller'}><stop stopColor="#24374e"/><stop offset=".28" stopColor="#c2cfdf"/><stop offset=".48" stopColor="#f6f9fc"/><stop offset=".7" stopColor="#91a3b8"/><stop offset="1" stopColor="#2c4159"/></linearGradient>
      <linearGradient id={id+'brass'}><stop stopColor="#664d2e"/><stop offset=".45" stopColor="#e5cb8a"/><stop offset=".7" stopColor="#a88a50"/><stop offset="1" stopColor="#72542e"/></linearGradient>
      <radialGradient id={id+'shadow'}><stop stopColor="#030b14" stopOpacity=".8"/><stop offset="1" stopColor="#030b14" stopOpacity="0"/></radialGradient>
    </defs>
    {!compact && <text x="26" y="30" className="model-eyebrow">{t('PRODUCT GEOMETRY / OPEN CUTAWAY', 'هندسه محصول / نمای باز')}</text>}
    <ellipse cx="275" cy="365" rx="190" ry="48" fill={`url(#${id}shadow)`}/>
    <g transform={`translate(254 ${210 - Math.min(depth,120)/4}) rotate(-18) scale(1 .76)`}>
      {Array.from({length: 24}, (_, i) => <g key={i} transform={`translate(0 ${depth*(1-i/24)})`}>
        <path d={annulus(R,outerTrack)} fill={dark} stroke="#72849b" strokeOpacity=".15" strokeWidth=".5"/>
        <path d={annulus(innerTrack,r)} fill={dark}/>
      </g>)}
      <path d={annulus(R,outerTrack)} fill={steel} stroke="#d2deeb" strokeWidth="1"/>
      <circle r={R-3} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".7"/>
      <circle r={outerTrack+3} fill="none" stroke="#102136" strokeWidth="4"/>
      <circle r={outerTrack+5} fill="none" stroke="#f4f7fc" strokeOpacity=".5"/>
      <path d={annulus(innerTrack,r)} fill={steel} stroke="#dce5ee" strokeWidth="1"/>
      <circle r={innerTrack-3} fill="none" stroke="#142339" strokeWidth="3"/>
      <circle r={r+2} fill="none" stroke="#f6f8fc" strokeWidth="1.4"/>
      <g ref={cage} data-motion="cage">
        {Array.from({length:g.rows},(_,row)=><g key={row} transform={`translate(0 ${g.rows===2 ? (row-.5)*ball*1.4:0})`}>
          <circle r={pitch} fill="none" stroke={`url(#${id}brass)`} strokeWidth={ball*1.65}/>
          {Array.from({length:g.count},(_,i)=>{
            const angle=i*360/g.count + row*180/g.count;
            return <g key={i} transform={`rotate(${angle}) translate(${pitch} 0)`}>
              <circle r={ball+2} fill="#16263c" stroke="#d2b578" strokeWidth="1.5"/>
              {g.roller ? <>
                <path d={p.schematicType==='tapered' ? `M${-ball*.65} ${-ball}L${ball*.85} ${-ball*.75}V${ball*.75}L${-ball*.65} ${ball}Z` : `M${-ball*.72} ${-ball}Q0 ${-ball*1.12} ${ball*.72} ${-ball}V${ball}Q0 ${ball*1.12} ${-ball*.72} ${ball}Z`} fill={`url(#${id}roller)`} stroke="#c1ccda" strokeWidth=".6"/>
                <ellipse cx={0} cy={-ball} rx={ball*.7} ry={ball*.18} fill="#d4deeb"/>
              </> : <circle r={ball} fill={`url(#${id}ball)`}/>}
              <g data-spin="true"><path d={`M${-ball*.5} ${-ball*.5}Q${ball*.4} ${-ball*.8} ${ball*.55} ${ball*.35}`} fill="none" stroke="#102039" strokeWidth="1" opacity=".4"/></g>
            </g>;
          })}
          {Array.from({length:g.count},(_,i)=><g key={i} transform={`rotate(${(i+.5)*360/g.count}) translate(${pitch} 0)`}><circle r="2.3" fill="#f1d99c"/><circle r=".9" fill="#574226"/></g>)}
        </g>)}
      </g>
      <g ref={inner} data-motion="shaft">
        <path d={`M0 ${-r-2}v${-(innerTrack-r-4)}`} stroke="#f1c777" strokeWidth="3"/>
        {[0,90,180,270].map(a=><g key={a} transform={`rotate(${a})`}><path d={`M${r+5} 0h${Math.max(2,innerTrack-r-10)}`} stroke="#344760" strokeWidth="1"/></g>)}
      </g>
      <text x="0" y={-R+gap*.12+3} textAnchor="middle" fill="#25354b" fontSize="7" letterSpacing="1">{p.code}</text>
      <text x="0" y={R-gap*.1} textAnchor="middle" fill="#344860" fontSize="6" letterSpacing="2">POLAD CHARKHESH</text>
    </g>
    {!compact && <text x="26" y="410" className="model-eyebrow">{p.d} × {p.D} × {p.B} mm · {p.schematicType}</text>}
  </svg>;
}
