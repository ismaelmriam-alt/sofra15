import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal, WordReveal } from './Reveal.jsx';
import SmoothImage from './SmoothImage.jsx';
import Decor from './Decor.jsx';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

const PICKS = ['Hummus', 'Kibbeh', 'Knefeh', 'Baklava'];

// "A Taste of Lebanon" strip. Only dishes that really have a photo get a tile —
// no empty cards. With no photos configured the strip is text-only.
export default function TasteOfLebanon({ dishes }) {
  const { reduced } = useMotionPrefs();
  const tiles = PICKS.map((n) => (dishes || []).find((d) => d.name === n)).filter((d) => d && d.image);

  return (
    <section className={`taste ${tiles.length ? '' : 'text-only'}`} id="taste">
      <div className="taste-inner">
        <div className="taste-copy">
          <Reveal className="taste-eyebrow"><i /><span>A Taste of Lebanon</span><i /></Reveal>
          <WordReveal text="Made with Tradition." />
          <Reveal as="p" delay={0.15}>A table filled with authentic flavors, made to be shared.</Reveal>
        </div>
        {tiles.length > 0 && (
          <ul className="taste-tiles">
            {tiles.map((d, i) => (
              <motion.li
                key={d._id}
                initial={reduced ? false : { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.65, 0, 0.35, 1] }}
              >
                <Link to="/menu" aria-label={`${d.name} — view the menu`}>
                  <SmoothImage src={d.image} alt={`${d.name}, a Lebanese dish`} name={d.name} />
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <Decor kind="jug" size={76} className="taste-decor" depth={12} delay={0.3} />
      <div className="mouse-hint" aria-hidden="true"><i /><b /><i /></div>
    </section>
  );
}
