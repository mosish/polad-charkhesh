import Copy from './Copy';
import { useId } from 'react';
import type { BearingProduct } from '../../domain/product';
export function Schematic({ p }: { p: BearingProduct }) {
  const id = useId();
  return (
    <div className="schematic" dir="ltr">
      <svg
        viewBox="0 0 420 245"
        role="img"
        aria-label={`Dimensional schematic: bore ${p.d}, outside diameter ${p.D}, width ${p.B} mm`}
      >
        <defs>
          <marker
            id={id}
            markerWidth="5"
            markerHeight="5"
            refX="2.5"
            refY="2.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0L5 2.5L0 5" fill="#798fac" />
          </marker>
        </defs>
        <g fill="none" stroke="#9cabc1">
          <circle cx="123" cy="110" r="75" />
          <circle cx="123" cy="110" r="62" />
          <circle cx="123" cy="110" r="34" />
          <circle cx="123" cy="110" r="25" />
          <path d="M30 110H213M123 17V202" strokeDasharray="6 5" opacity=".6" />
          <rect x="286" y="35" width="52" height="150" />
          <path d="M286 85H338M286 135H338M263 110H356" strokeDasharray="5 4" />
          <path d="M48 191V216M198 191V216M48 207H198M98 112V235M148 112V235M98 228H148M286 188V216M338 188V216M286 207H338" />
          <path
            d="M50 207H196M100 228H146M288 207H336"
            markerStart={`url(#${id})`}
            markerEnd={`url(#${id})`}
          />
        </g>
        <g fill="#cad4e3" fontSize="12" fontFamily="monospace">
          <text x="103" y="202">
            <Copy text="D" />
            {p.D}
          </text>
          <text x="104" y="244">
            <Copy text="d" />
            {p.d}
          </text>
          <text x="291" y="229">
            <Copy text="B" />
            {p.B}
          </text>
          <text x="276" y="20">
            <Copy text="SIDE VIEW" />
          </text>
        </g>
      </svg>
      <small>
        <Copy text="DIMENSIONAL ENVELOPE · mm · NOT TO SCALE" />
      </small>
    </div>
  );
}
