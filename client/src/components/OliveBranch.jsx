import { motion } from 'framer-motion';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

// Procedurally drawn olive sprig used as a soft corner accent (leaves along a curved stem).
const P0 = [10, 175], P1 = [105, 150], P2 = [205, 35];
const bez = (t) => [0, 1].map((i) => (1 - t) ** 2 * P0[i] + 2 * (1 - t) * t * P1[i] + t ** 2 * P2[i]);
const tan = (t) => { const d = [0, 1].map((i) => 2 * (1 - t) * (P1[i] - P0[i]) + 2 * t * (P2[i] - P1[i])); return (Math.atan2(d[1], d[0]) * 180) / Math.PI; };

const LEAVES = Array.from({ length: 12 }, (_, i) => {
  const t = 0.12 + (i / 11) * 0.88;
  const [x, y] = bez(t);
  const a = tan(t);
  const side = i % 2 ? 1 : -1;
  return { x, y, rot: a + side * (48 - t * 14), len: 22 - t * 7, key: i };
});

export default function OliveBranch({ className = '', size = 220, flip = false, rotate = 0 }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.svg
      className={`olive ${className}`}
      width={size}
      height={size * 0.9}
      viewBox="0 0 220 200"
      aria-hidden="true"
      style={{ transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${rotate}deg)` }}
      animate={reduced ? undefined : { rotate: [rotate - 1.2, rotate + 1.2, rotate - 1.2] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="oliveLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA761" /><stop offset="1" stopColor="#5E6F35" /></linearGradient>
      </defs>
      <path d={`M${P0} Q${P1} ${P2}`} fill="none" stroke="#6B5A3A" strokeWidth="2.4" strokeLinecap="round" />
      {LEAVES.map((l) => (
        <g key={l.key} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
          <ellipse cx={l.len} cy="0" rx={l.len} ry="5.6" fill="url(#oliveLeaf)" opacity=".9" />
          <path d={`M0 0 L${l.len * 2 - 3} 0`} stroke="#fff" strokeOpacity=".28" strokeWidth=".7" />
        </g>
      ))}
    </motion.svg>
  );
}
