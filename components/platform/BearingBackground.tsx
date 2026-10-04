import type { BearingFamily } from './HeroBearingScene';

/** Lightweight illustrative silhouettes continue the selected assembly behind the page. */
export default function BearingBackground({family,recession}:{family:BearingFamily;recession:number}) {
  const ring = <><ellipse cx="400" cy="300" rx="290" ry="130"/><ellipse cx="400" cy="300" rx="130" ry="58"/></>;
  const rows = family === 'roller' ? [-22,22] : [0];
  return <div className="bearing-background-echo" data-background-family={family} aria-hidden="true" style={{opacity:recession*.055,transform:`translateY(${(1-recession)*80}px)`}}>
    <svg viewBox="0 0 1000 1000" fill="none">
      <g stroke="currentColor" strokeWidth="14" transform="translate(170 50) rotate(-24 400 300)">
        {ring}
        {family === 'engineered' && <path d="M 105 325 L 65 460 L 735 460 L 695 325 M 100 460 L 100 420 M 700 460 L 700 420"/>}
        {family === 'track' && <ellipse cx="400" cy="325" rx="290" ry="130"/>}
        {family === 'accessories' && <ellipse cx="400" cy="370" rx="270" ry="120"/>}
      </g>
      <g stroke="currentColor" strokeWidth="9" transform="translate(-190 260) rotate(18 400 300)">
        {ring}
        {family === 'accessories' ? Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <path key={i} d={`M ${400+Math.cos(a)*265} ${300+Math.sin(a)*119} L ${400+Math.cos(a)*300} ${300+Math.sin(a)*135}`}/>;}) : rows.flatMap((offset,row)=>Array.from({length:family==='ball'||family==='engineered'?17:28},(_,i)=>{
          const count=family==='ball'||family==='engineered'?17:28,a=i*Math.PI*2/count,x=400+Math.cos(a)*210,y=300+Math.sin(a)*94+offset;
          return family==='ball'||family==='engineered' ? <ellipse key={`${row}-${i}`} cx={x} cy={y} rx="20" ry="15"/> : family==='thrust' ? <path key={`${row}-${i}`} d={`M ${400+Math.cos(a)*150} ${300+Math.sin(a)*67} L ${400+Math.cos(a)*270} ${300+Math.sin(a)*121}`}/> : <rect key={`${row}-${i}`} x={x-10} y={y-23} width="20" height="46" rx={family==='roller'?9:3} transform={`rotate(${Math.sin(a)*12} ${x} ${y})`}/>;
        }))}
      </g>
      <g stroke="currentColor" strokeWidth="14" transform="translate(130 590) rotate(-18 400 300)">
        {ring}
        {(family==='track'||family==='engineered'||family==='accessories')&&<path d="M 330 300 L 330 480 Q 400 520 470 480 L 470 300 M 330 480 Q 400 440 470 480"/>}
      </g>
    </svg>
  </div>;
}
