import { AnimatePresence, motion } from 'framer-motion';
import { useMascot } from '../context/MascotContext.jsx';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

/*
 * SOFRA's waiter mascot — a single consistent character drawn as layered SVG
 * with gradient shading. It is NOT a GLB/GLTF model (none with a suitable
 * licence was available) — see README → "3D assets".
 */
function WaiterSVG({ pose }) {
  const raised = pose === 'cheer';
  const thumbs = pose === 'thumbs';
  const wave = pose === 'wave';
  return (
    <svg viewBox="0 0 120 150" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="mSkin" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#F9D2AE" /><stop offset="1" stopColor="#E0A276" /></radialGradient>
        <linearGradient id="mVest" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3C3430" /><stop offset="1" stopColor="#1B1613" /></linearGradient>
        <linearGradient id="mShirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E8E1D4" /></linearGradient>
        <radialGradient id="mHair" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#4A3426" /><stop offset="1" stopColor="#1F140D" /></radialGradient>
      </defs>
      <ellipse cx="60" cy="144" rx="30" ry="4.5" fill="#000" opacity=".18" />
      {/* legs */}
      <rect x="44" y="112" width="13" height="30" rx="5" fill="#1F1B18" />
      <rect x="63" y="112" width="13" height="30" rx="5" fill="#1F1B18" />
      <ellipse cx="50" cy="142" rx="10" ry="4" fill="#0F0C0A" /><ellipse cx="70" cy="142" rx="10" ry="4" fill="#0F0C0A" />
      {/* torso */}
      <path d="M32 64 Q60 52 88 64 L92 116 Q60 124 28 116 Z" fill="url(#mShirt)" />
      <path d="M40 62 L60 96 L80 62 L88 66 L90 116 Q60 122 30 116 L32 66 Z" fill="url(#mVest)" />
      <path d="M52 62 L60 78 L68 62 L60 58 Z" fill="#fff" />
      <rect x="86" y="98" width="0" height="0" />
      {/* bow tie */}
      <path d="M60 66 L48 59 V73 Z M60 66 L72 59 V73 Z" fill="#A83F36" />
      <circle cx="60" cy="66" r="3.6" fill="#7C2A23" />
      {/* buttons */}
      <circle cx="60" cy="90" r="1.8" fill="#A88B6A" /><circle cx="60" cy="101" r="1.8" fill="#A88B6A" />
      {/* left arm (viewer's left) */}
      {raised ? (
        <g><path d="M34 68 Q16 56 14 34" stroke="#F4F0E6" strokeWidth="11" strokeLinecap="round" fill="none" /><circle cx="14" cy="30" r="7.5" fill="url(#mSkin)" /></g>
      ) : (
        <g><path d="M34 70 Q22 88 30 108" stroke="#F4F0E6" strokeWidth="11" strokeLinecap="round" fill="none" /><circle cx="31" cy="110" r="7" fill="url(#mSkin)" /></g>
      )}
      {/* right arm */}
      {raised ? (
        <g><path d="M86 68 Q104 56 106 34" stroke="#F4F0E6" strokeWidth="11" strokeLinecap="round" fill="none" /><circle cx="106" cy="30" r="7.5" fill="url(#mSkin)" /></g>
      ) : thumbs ? (
        <g>
          <path d="M86 70 Q104 74 100 92" stroke="#F4F0E6" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="100" cy="96" r="8.5" fill="url(#mSkin)" />
          <rect x="96" y="80" width="7" height="15" rx="3.5" fill="url(#mSkin)" />
        </g>
      ) : (
        <motion.g style={{ originX: '86px', originY: '70px' }} animate={wave ? { rotate: [0, -16, 8, -16, 0] } : undefined} transition={{ duration: 1.6, repeat: wave ? 3 : 0 }}>
          <path d="M86 70 Q106 60 104 38" stroke="#F4F0E6" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="104" cy="34" r="8" fill="url(#mSkin)" />
          <g stroke="#E0A276" strokeWidth="3" strokeLinecap="round"><path d="M99 28 V24 M104 27 V22 M109 28 V24" /></g>
        </motion.g>
      )}
      {/* head */}
      <rect x="53" y="48" width="14" height="12" rx="4" fill="#E0A276" />
      <ellipse cx="60" cy="32" rx="25" ry="26" fill="url(#mSkin)" />
      <ellipse cx="35.5" cy="34" rx="4" ry="6" fill="#E3A87D" /><ellipse cx="84.5" cy="34" rx="4" ry="6" fill="#E3A87D" />
      {/* hair */}
      <path d="M35 28 Q34 6 60 6 Q86 6 85 28 Q78 14 60 14 Q42 14 35 28 Z" fill="url(#mHair)" />
      {/* brows */}
      <path d="M44 22 Q50 18 55 21 M65 21 Q70 18 76 22" stroke="#3A271B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* eyes */}
      {pose === 'thumbs' ? (
        <g stroke="#2B1B12" strokeWidth="2.6" strokeLinecap="round" fill="none"><path d="M44 30 Q49 25 54 30" /><path d="M66 30 Q71 25 76 30" /></g>
      ) : (
        <g><ellipse cx="49" cy="29" rx="3.6" ry="4.4" fill="#2B1B12" /><ellipse cx="71" cy="29" rx="3.6" ry="4.4" fill="#2B1B12" /><circle cx="50.3" cy="27.5" r="1.3" fill="#fff" /><circle cx="72.3" cy="27.5" r="1.3" fill="#fff" /></g>
      )}
      <ellipse cx="42" cy="40" rx="5" ry="3" fill="#E57B6B" opacity=".45" /><ellipse cx="78" cy="40" rx="5" ry="3" fill="#E57B6B" opacity=".45" />
      {/* mustache + smile */}
      <path d="M48 41 Q54 36 60 40 Q66 36 72 41 Q66 44 60 42 Q54 44 48 41 Z" fill="#2A1A10" />
      <path d="M51 46 Q60 55 69 46 Q60 50 51 46 Z" fill="#fff" stroke="#8F4A3A" strokeWidth="1.2" />
    </svg>
  );
}

export default function Mascot() {
  const { current, dismiss } = useMascot();
  const { reduced } = useMotionPrefs();
  const pose = current?.pose;

  return (
    <div className={`mascot-layer ${current?.kind === 'cartOpen' ? 'by-cart' : ''}`} aria-live="polite">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            className="mascot"
            initial={reduced ? { opacity: 0 } : { x: 160, opacity: 0, rotate: 6 }}
            animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1, rotate: 0 }}
            exit={reduced ? { opacity: 0 } : { x: 160, opacity: 0, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 120, damping: 17 }}
          >
            <motion.div
              className="mascot-bubble"
              dir="rtl"
              lang="ar"
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 18 }}
              onClick={dismiss}
              role="status"
            >
              {current.text}
            </motion.div>
            <motion.div className="mascot-figure" animate={reduced ? undefined : { y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
              <WaiterSVG pose={pose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
