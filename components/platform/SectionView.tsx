import Copy from './Copy';
import { useId } from 'react';
export default function SectionView() {
  const id = useId();
  return (
    <svg
      viewBox="0 0 500 400"
      role="img"
      aria-label="Half-section through an idealized radial ball bearing: hatched inner and outer rings with curved raceways, an unsectioned ball and cage"
    >
      <defs>
        <pattern
          id={id + 'h'}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path d="M0 0V7" stroke="#acbbcc" strokeWidth="1" />
        </pattern>
      </defs>
      <g fill="none" stroke="#a7b7cb">
        <path d="M80 200H425" strokeDasharray="9 5 2 5" />
        <path d="M160 60V340M340 60V340" opacity=".3" />
        <path
          d="M160 73H340V127H280Q250 95 220 127H160Z"
          fill={`url(#${id}h)`}
          strokeWidth="2"
        />
        <path
          d="M160 154H220Q250 186 280 154H340V195H160Z"
          fill={`url(#${id}h)`}
          strokeWidth="2"
        />
        <circle
          cx="250"
          cy="140"
          r="29"
          fill="#a8b8cc"
          stroke="#e4eaf2"
          strokeWidth="2"
        />
        <path
          d="M199 128H212V153H199ZM288 128H301V153H288Z"
          stroke="#c9a56b"
          fill="#9a7c52"
        />
        <path d="M160 205H340V327H160Z" fill="#52667e" strokeWidth="2" />
        <path d="M173 205V327M327 205V327M160 313H340" opacity=".7" />
        <path d="M342 74H383M342 327H383M372 75V326M161 344V362M339 344V362M162 354H338" />
        <path d="M366 80L372 74L378 80M366 320L372 327L378 320M168 348L161 354L168 360M332 348L339 354L332 360" />
      </g>
      <g fill="#b1c0d1" fontSize="11" fontFamily="monospace">
        <text x="30" y="30">
          <Copy text="AXIAL HALF-SECTION / IDEALIZED BALL BEARING" />
        </text>
        <text x="385" y="205">
          <Copy text="D" />
        </text>
        <text x="248" y="374">
          <Copy text="B" />
        </text>
        <text x="24" y="90">
          <Copy text="OUTER RING" />
        </text>
        <path d="M101 87H157" stroke="#879bb6" />
        <text x="25" y="175">
          <Copy text="INNER RING" />
        </text>
        <path d="M101 170H157" stroke="#879bb6" />
        <text x="27" y="396">
          <Copy text="HATCH = CUT METAL / BALL & CAGE SHOWN UNCUT" />
        </text>
      </g>
    </svg>
  );
}
