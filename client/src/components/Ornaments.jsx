import { motion } from 'framer-motion';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

// 8-point star tile (traditional Lebanese/Islamic geometric motif)
const Star = ({ x, color }) => (
  <g transform={`translate(${x} 14)`} fill="none" stroke={color} strokeWidth="1.4">
    <rect x="-8" y="-8" width="16" height="16" />
    <rect x="-8" y="-8" width="16" height="16" transform="rotate(45)" />
    <circle r="2.2" fill={color} stroke="none" />
  </g>
);

// Decorative divider placed between sections. The pattern is "drawn in" on scroll.
export function GeometricDivider({ color = '#A88B6A', flip = false }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.div
      className="geo-divider"
      aria-hidden="true"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
      initial={reduced ? false : { clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
      whileInView={{ clipPath: 'inset(0 0% 0 0%)', opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
    >
      <svg viewBox="0 0 960 28" preserveAspectRatio="xMidYMid slice" width="100%" height="28">
        <line x1="0" y1="14" x2="960" y2="14" stroke={color} strokeWidth="1" opacity=".6" />
        {Array.from({ length: 13 }, (_, i) => <Star key={i} x={40 + i * 73.3} color={color} />)}
      </svg>
    </motion.div>
  );
}

// Small ornament placed above headings
export function HeadingOrnament({ color = '#A83F36' }) {
  return (
    <svg className="heading-orn" width="120" height="16" viewBox="0 0 120 16" aria-hidden="true">
      <line x1="0" y1="8" x2="44" y2="8" stroke={color} opacity=".5" />
      <line x1="76" y1="8" x2="120" y2="8" stroke={color} opacity=".5" />
      <g transform="translate(60 8)" fill="none" stroke={color} strokeWidth="1.3">
        <rect x="-5.5" y="-5.5" width="11" height="11" />
        <rect x="-5.5" y="-5.5" width="11" height="11" transform="rotate(45)" />
      </g>
    </svg>
  );
}

// Carved-stone arch outline used to frame images
export function ArchFrame({ color = '#A88B6A' }) {
  return (
    <svg className="arch-frame" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <path d="M6 394 V150 A144 144 0 0 1 294 150 V394 Z" fill="none" stroke={color} strokeWidth="2" />
      <path d="M20 380 V152 A130 130 0 0 1 280 152 V380 Z" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 5" />
    </svg>
  );
}

// Subtle ceramic-tile band for the footer
export function TileBand() {
  const tiles = Array.from({ length: 28 }, (_, i) => i);
  return (
    <svg className="tile-band" viewBox="0 0 1120 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {tiles.map((i) => (
        <g key={i} transform={`translate(${20 + i * 40} 20)`}>
          <rect x="-16" y="-16" width="32" height="32" fill="none" stroke="#F8F4EB" strokeOpacity=".2" />
          <path d="M0 -12 L4 -4 L12 0 L4 4 L0 12 L-4 4 L-12 0 L-4 -4 Z" fill={i % 2 ? '#A83F36' : '#A88B6A'} fillOpacity=".55" />
        </g>
      ))}
    </svg>
  );
}
