import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import useMotionPrefs from '../hooks/useMotionPrefs.js';
import { OBJECT_PHOTOS } from '../config/photos.js';

/*
 * Small decorative Lebanese objects.
 * Drawn SVG objects by default. If a real transparent photo is placed in
 * assets/images/site/ (rakwe/jarn/lantern/jug.png) and `npm run photos:scan` is
 * run, the photo is used instead. Not GLB/GLTF models — see README.
 */

const Copper = ({ id }) => (
  <defs>
    <linearGradient id={`cu${id}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F2B98A" />
      <stop offset=".45" stopColor="#C57A44" />
      <stop offset="1" stopColor="#7A4423" />
    </linearGradient>
    <linearGradient id={`st${id}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#E4D6BC" />
      <stop offset="1" stopColor="#9B8460" />
    </linearGradient>
    <linearGradient id={`cl${id}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#D99062" />
      <stop offset="1" stopColor="#8E4A2B" />
    </linearGradient>
    <radialGradient id={`gl${id}`}><stop offset="0" stopColor="#FFE9A6" /><stop offset="1" stopColor="#FFE9A6" stopOpacity="0" /></radialGradient>
  </defs>
);

const OBJECTS = {
  // Jarn el kibbeh: stone mortar with pestle
  jarn: (id) => (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <Copper id={id} />
      <ellipse cx="40" cy="72" rx="26" ry="5" fill="#000" opacity=".18" />
      <path d="M14 30 Q14 68 40 68 Q66 68 66 30 Z" fill={`url(#st${id})`} />
      <ellipse cx="40" cy="30" rx="26" ry="8" fill="#6F5B3C" />
      <ellipse cx="40" cy="31" rx="21" ry="5.5" fill="#4B3B25" />
      <path d="M18 40 Q22 62 38 66" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="46" y="4" width="9" height="40" rx="4.5" fill={`url(#st${id})`} transform="rotate(24 50 24)" />
    </svg>
  ),
  lantern: (id) => (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <Copper id={id} />
      <circle cx="40" cy="44" r="24" fill={`url(#gl${id})`} />
      <path d="M40 4 V12" stroke="#7A4423" strokeWidth="2.5" />
      <circle cx="40" cy="5" r="3" fill="none" stroke="#7A4423" strokeWidth="2" />
      <path d="M28 18 Q40 8 52 18 Z" fill={`url(#cu${id})`} />
      <path d="M26 20 H54 L50 62 H30 Z" fill="#FFD98A" fillOpacity=".5" stroke={`url(#cu${id})`} strokeWidth="3" />
      <path d="M40 20 V62 M33 20 L35 62 M47 20 L45 62" stroke={`url(#cu${id})`} strokeWidth="1.5" />
      <rect x="27" y="62" width="26" height="6" rx="2" fill={`url(#cu${id})`} />
      <ellipse cx="40" cy="44" rx="4" ry="8" fill="#FFF3C4" />
    </svg>
  ),
  jug: (id) => (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <Copper id={id} />
      <ellipse cx="38" cy="75" rx="20" ry="4" fill="#000" opacity=".18" />
      <path d="M30 10 H46 L44 22 Q60 30 58 52 Q56 72 38 72 Q20 72 18 52 Q16 30 32 22 Z" fill={`url(#cl${id})`} />
      <path d="M58 30 Q76 30 72 50 Q70 58 58 56" fill="none" stroke={`url(#cl${id})`} strokeWidth="5" strokeLinecap="round" />
      <path d="M22 42 H54 M21 50 H55" stroke="#F4DDB8" strokeWidth="2" opacity=".8" />
      <path d="M26 56 L30 52 L34 56 L38 52 L42 56 L46 52 L50 56" stroke="#F4DDB8" strokeWidth="1.6" fill="none" />
      <path d="M26 30 Q22 44 24 60" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="10" rx="8" ry="2.5" fill="#6C3920" />
    </svg>
  ),
  // Rakwe: copper coffee pot with two tiny cups
  rakwe: (id) => (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <Copper id={id} />
      <ellipse cx="34" cy="73" rx="22" ry="4" fill="#000" opacity=".18" />
      <path d="M22 36 H46 L52 66 H16 Z" fill={`url(#cu${id})`} />
      <path d="M20 26 H48 L46 36 H22 Z" fill={`url(#cu${id})`} />
      <path d="M48 28 L62 18 L60 24 L50 33 Z" fill={`url(#cu${id})`} />
      <path d="M22 30 Q8 34 12 54" fill="none" stroke="#5E3118" strokeWidth="4" strokeLinecap="round" />
      <path d="M26 40 L24 62" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
      <rect x="54" y="62" width="9" height="8" rx="2" fill={`url(#st${id})`} />
      <rect x="65" y="64" width="9" height="6" rx="2" fill={`url(#st${id})`} />
    </svg>
  ),
  cedar: (id) => (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <defs>
        <linearGradient id={`cd${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4E8F68" /><stop offset="1" stopColor="#1E4731" /></linearGradient>
      </defs>
      <ellipse cx="40" cy="74" rx="16" ry="3.5" fill="#000" opacity=".15" />
      <rect x="37" y="56" width="6" height="18" fill="#654832" />
      <path d="M40 4 Q56 12 66 24 Q52 24 62 36 Q48 36 64 50 Q40 46 40 58 Q40 46 16 50 Q32 36 18 36 Q28 24 14 24 Q24 12 40 4 Z" fill={`url(#cd${id})`} />
      <path d="M40 8 V54" stroke="#fff" strokeOpacity=".2" strokeWidth="1.5" />
    </svg>
  ),
};

/**
 * Floating decorative object.
 * size: 40–75px as specified in the brief. depth: parallax strength.
 */
export default function Decor({ kind, size = 56, style, depth = 30, rotate = false, delay = 0, className = '' }) {
  const ref = useRef(null);
  const { reduced, mobile } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  const id = `${kind}${Math.round(size)}${delay}`.replace('.', '');
  const px = mobile ? Math.round(size * 0.75) : size;

  return (
    <motion.div
      ref={ref}
      className={`decor ${className}`}
      aria-hidden="true"
      style={{ width: px, height: px, y: reduced || mobile ? 0 : y, ...style }}
      initial={reduced ? false : { opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{ width: '100%', height: '100%' }}
        animate={reduced ? undefined : { y: [0, -5, 0], rotate: rotate ? [0, 6, -6, 0] : [-1.5, 1.5, -1.5] }}
        transition={{ duration: rotate ? 14 : 5 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {OBJECT_PHOTOS[kind] ? (
          <img src={OBJECT_PHOTOS[kind]} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          OBJECTS[kind](id)
        )}
      </motion.div>
    </motion.div>
  );
}
