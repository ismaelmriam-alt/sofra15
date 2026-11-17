import { useMemo } from 'react';
import { COVER } from '../config/photos.js';

// Engraved gold Cedar of Lebanon (Cedrus libani): thick trunk and broad, flat, tiered
// branch layers with needle tufts. Drawn procedurally (seeded, so it is identical on every
// load) in the foil-stamped style of real hardcover menus. It is an engraving, NOT a photograph:
// drop a transparent cedar photo at assets/images/site/cedar.png and run `npm run photos:scan` to use it instead.
function mulberry(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function build() {
  const r = mulberry(1948);
  const TIERS = [
    { y: 212, hw: 98 }, { y: 188, hw: 124 }, { y: 162, hw: 128 }, { y: 136, hw: 112 },
    { y: 112, hw: 92 }, { y: 88, hw: 68 }, { y: 66, hw: 44 }, { y: 46, hw: 22 },
  ];
  const branches = [], pads = [];
  TIERS.forEach((t, ti) => {
    [-1, 1].forEach((side) => {
      const x1 = 150 + side * t.hw * (0.92 + r() * 0.12);
      const y1 = t.y - 10 - r() * 8 + ti * 0.5;
      const cx = 150 + side * t.hw * 0.5, cy = t.y + 8 + r() * 6;
      branches.push(`M150 ${t.y + 12} Q${cx} ${cy} ${x1} ${y1}`);
      const n = 6 + Math.round(t.hw / 28);
      for (let i = 0; i < n; i++) {
        const u = 0.22 + (i / (n - 1)) * 0.8;
        const bx = (1 - u) ** 2 * 150 + 2 * (1 - u) * u * cx + u * u * x1;
        const by = (1 - u) ** 2 * (t.y + 12) + 2 * (1 - u) * u * cy + u * u * y1;
        const w = 20 + r() * 12 + (1 - Math.abs(u - 0.6)) * 10;
        let d = '';
        const count = 18;
        for (let k = 0; k < count; k++) {
          const a = (-Math.PI * (0.05 + 0.9 * (k / (count - 1)))) + (r() - 0.5) * 0.25;
          const len = 5 + r() * 9;
          const ox = (r() - 0.5) * w * 1.5, oy = (r() - 0.5) * 5;
          d += `M${(bx + ox).toFixed(1)} ${(by + oy).toFixed(1)}l${(Math.cos(a) * len).toFixed(1)} ${(Math.sin(a) * len * 0.55 + 1.5).toFixed(1)}`;
        }
        pads.push({ cx: bx, cy: by + 2, rx: w, ry: 5 + r() * 3, d, o: 0.35 + r() * 0.25 });
      }
    });
  });
  const bark = Array.from({ length: 14 }, (_, i) => {
    const y = 120 + i * 9; const x = 143 + r() * 14;
    return `M${x.toFixed(1)} ${y}q${(r() * 3 - 1.5).toFixed(1)} 6 ${(r() * 2 - 1).toFixed(1)} 11`;
  }).join('');
  return { branches, pads, bark };
}

export default function Cedar({ className = '' }) {
  const g = useMemo(build, []);
  if (COVER.cedar) return <img className={className} src={COVER.cedar} alt="A Lebanese cedar tree" style={{ objectFit: 'contain' }} />;
  return (
    <svg className={className} viewBox="0 0 300 270" role="img" aria-label="Engraved Lebanese cedar tree" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="cedGold" gradientUnits="userSpaceOnUse" x1="40" y1="20" x2="260" y2="260">
          <stop offset="0" stopColor="#F8E7AE" /><stop offset=".35" stopColor="#D6AE55" /><stop offset=".62" stopColor="#A67C2B" /><stop offset="1" stopColor="#E7CB7A" />
        </linearGradient>
        <linearGradient id="cedTrunk" x1="0" x2="1"><stop offset="0" stopColor="#8A6A22" /><stop offset=".5" stopColor="#E3C672" /><stop offset="1" stopColor="#8A6A22" /></linearGradient>
        <radialGradient id="cedPad"><stop offset="0" stopColor="#E9D089" stopOpacity=".95" /><stop offset="1" stopColor="#B38A33" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy="252" rx="64" ry="5" fill="url(#cedGold)" opacity=".35" />
      <path d="M136 252 Q142 226 144 196 L146 112 L154 112 L156 196 Q158 226 164 252 Q150 247 136 252Z" fill="url(#cedTrunk)" />
      <path d={g.bark} fill="none" stroke="#6B4D14" strokeWidth=".9" opacity=".7" strokeLinecap="round" />
      <g fill="none" stroke="url(#cedGold)" strokeWidth="2.2" strokeLinecap="round">{g.branches.map((d, i) => <path key={i} d={d} />)}</g>
      {g.pads.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="url(#cedPad)" opacity={p.o} />
          <path d={p.d} stroke="url(#cedGold)" strokeWidth=".85" strokeLinecap="round" fill="none" />
        </g>
      ))}
    </svg>
  );
}
