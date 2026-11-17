import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Cedar from './Cedar.jsx';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

const Corner = ({ className }) => (
  <svg className={`cover-corner ${className}`} viewBox="0 0 60 60" aria-hidden="true">
    <g fill="none" stroke="url(#coverGold)" strokeWidth="1.4"><path d="M4 56 V4 H56" /><path d="M12 56 V12 H56" opacity=".6" /><rect x="14" y="14" width="14" height="14" /><rect x="14" y="14" width="14" height="14" transform="rotate(45 21 21)" /></g>
  </svg>
);

/**
 * SOFRA book entrance, shown once when a visitor first arrives. "OPEN" swings the hard cover
 * open on its spine (CSS 3D via Framer Motion), then the overlay dissolves into the Home page.
 */
export default function MenuCover({ onOpen }) {
  const { reduced, mobile } = useMotionPrefs();
  const [opening, setOpening] = useState(false);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, reduced ? 450 : 2500);
  };

  const spread = opening && !reduced && !mobile;
  return (
    <motion.div className="cover-stage" role="dialog" aria-modal="true" aria-label="SOFRA entrance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
      <svg width="0" height="0" aria-hidden="true"><defs><linearGradient id="coverGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6E3A0" /><stop offset=".5" stopColor="#C9A24A" /><stop offset="1" stopColor="#8F6C25" /></linearGradient></defs></svg>
      <div className="cover-scene">
        <motion.div
          className="book"
          initial={reduced ? false : { opacity: 0, y: 50, rotateY: -22 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, rotateY: opening ? 0 : -8, rotateX: opening ? 0 : 3, x: spread ? '50%' : 0 }}
          transition={{ duration: opening ? 1.8 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="book-shadow" />
          <div className="book-pages">
            <span className="page-ar" lang="ar" dir="rtl">سُفْرَة</span>
            <span className="page-note">Welcome to our table</span>
          </div>

          <motion.div
            className="book-cover"
            animate={opening ? (reduced ? { opacity: 0 } : { rotateY: -172 }) : { rotateY: 0, opacity: 1 }}
            transition={{ duration: reduced ? 0.4 : 1.8, ease: [0.65, 0, 0.25, 1] }}
          >
            <div className="cover-face front">
              <Corner className="tl" /><Corner className="tr" /><Corner className="bl" /><Corner className="br" />
              <div className="cover-cedar"><Cedar /></div>
              <div className="cover-title">
                <h2 className="gold arabic" lang="ar" dir="rtl">سُفْرَة</h2>
                <p className="gold latin">SOFRA</p>
                <span className="cover-rule" aria-hidden="true"><i /><b /><i /></span>
                <p className="gold sub">A Lebanese Dining Experience</p>
              </div>
              <button className="cover-open" onClick={open} disabled={opening} autoFocus>Open</button>
            </div>
            <div className="cover-face back" aria-hidden="true"><div className="back-frame" /></div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
