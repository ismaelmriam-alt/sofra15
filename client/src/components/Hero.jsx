import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { WordReveal } from './Reveal.jsx';
import MagneticButton from './MagneticButton.jsx';
import SmoothImage from './SmoothImage.jsx';
import Decor from './Decor.jsx';
import OliveBranch from './OliveBranch.jsx';
import useMotionPrefs from '../hooks/useMotionPrefs.js';
import { PHOTOS } from '../config/photos.js';

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
);

export default function Hero() {
  const ref = useRef(null);
  const { reduced, mobile } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', reduced || mobile ? '0%' : '10%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, reduced || mobile ? 1 : 1.08]);
  const hasPhoto = Boolean(PHOTOS.hero.src);

  return (
    <section className={`hero ${hasPhoto ? 'has-photo' : ''}`} id="home" ref={ref}>
      {hasPhoto && (
        <motion.div
          className="hero-bg"
          initial={reduced ? false : { opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="hero-bg-inner" style={{ y: bgY, scale: bgScale }}>
            <SmoothImage src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} eager name="SOFRA" />
          </motion.div>
        </motion.div>
      )}
      <div className="hero-fade" aria-hidden="true" />

      <OliveBranch className="olive-tl" size={200} rotate={-12} />
      <OliveBranch className="olive-tr" size={210} flip rotate={10} />

      <div className="hero-inner">
        <div className="hero-copy">
          <motion.p className="eyebrow" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.28em' }} transition={{ duration: 1.2, delay: 0.5 }}>
            Lebanese Kitchen · Est. with love
          </motion.p>
          <h1 className="hero-title" aria-label="A Lebanese Table. A Thousand Memories.">
            <WordReveal as="span" text="A Lebanese Table." onMount delay={0.7} className="hero-line" />
            <WordReveal as="span" text="A Thousand Memories." onMount delay={1.15} className="hero-line accent" />
          </h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.7 }}>
            Discover the flavors, traditions, and warmth of Lebanese hospitality.
          </motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.9 }}>
            <MagneticButton to="/menu">Explore Our Menu <Chevron /></MagneticButton>
            <a className="btn btn-ghost" href="#story" onClick={(e) => { e.preventDefault(); document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }); }}>Our Story <Chevron /></a>
          </motion.div>
        </div>
      </div>

      <div className="hero-objects">
        <Decor kind="lantern" size={88} depth={14} delay={0.6} style={{ position: 'relative' }} />
        <Decor kind="jarn" size={60} depth={10} delay={1} rotate style={{ position: 'relative' }} />
      </div>
    </section>
  );
}
