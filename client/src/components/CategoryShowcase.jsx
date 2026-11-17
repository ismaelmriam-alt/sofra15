import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal, WordReveal } from './Reveal.jsx';
import SmoothImage from './SmoothImage.jsx';
import { HeadingOrnament } from './Ornaments.jsx';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

// Interactive accordion of category panels (stacked cards on small screens).
export default function CategoryShowcase({ categories, loading, error }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { mobile } = useMotionPrefs();
  const list = categories || [];

  return (
    <section className="categories" id="categories">
      <div className="container">
        <header className="section-head">
          <HeadingOrnament />
          <p className="eyebrow">The menu</p>
          <WordReveal text="Choose your course" />
        </header>
        {loading && <p className="muted center">Loading categories…</p>}
        {error && <p className="warn center">Couldn't load categories: {error.message}</p>}

        <Reveal className="cat-panels">
          {list.map((c, i) => {
            const isActive = mobile || active === i;
            return (
              <motion.button
                key={c._id}
                layout
                className={`cat-panel ${isActive ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => navigate(`/menu?category=${c.slug}`)}
                style={{ flex: mobile ? 'none' : isActive ? 4 : 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                aria-label={`${c.name} — ${c.tagline}`}
              >
                <SmoothImage src={c.image} alt={`${c.name} on the SOFRA menu`} name={c.name} className="cat-img" />
                <span className="cat-shade" />
                <span className="cat-num">0{i + 1}</span>
                <span className="cat-text">
                  <strong className="serif">{c.name}</strong>
                  <motion.span initial={false} animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 14, height: isActive ? 'auto' : 0 }} className="cat-reveal">
                    <em>{c.tagline}</em>
                    <span>{c.description}</span>
                    <span className="cat-go">{c.dishCount} dishes · View →</span>
                  </motion.span>
                </span>
              </motion.button>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
