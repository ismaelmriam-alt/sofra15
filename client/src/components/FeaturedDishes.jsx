import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal, WordReveal } from './Reveal.jsx';
import SmoothImage from './SmoothImage.jsx';
import { HeadingOrnament } from './Ornaments.jsx';
import Decor from './Decor.jsx';
import DishModal from './DishModal.jsx';
import { useAddToCart } from './DishCard.jsx';
import { money } from '../utils/format.js';
import { motion } from 'framer-motion';

// Editorial layout: slot sizes differ so the dishes never look like a uniform card grid.
const SLOTS = ['f-hero', 'f-tall', 'f-wide', 'f-small', 'f-tall'];

export default function FeaturedDishes({ dishes, loading, error }) {
  const [open, setOpen] = useState(null);
  const addToCart = useAddToCart();
  const list = (dishes || []).filter((d) => d.isFeatured).slice(0, 5);

  return (
    <section className="featured" id="featured">
      <Decor kind="jarn" size={62} className="feat-decor" depth={30} delay={0.3} rotate />
      <div className="container">
        <header className="section-head left">
          <HeadingOrnament />
          <p className="eyebrow">Signature plates</p>
          <WordReveal text="Dishes our guests return for" />
        </header>

        {loading && <p className="muted">Setting the table…</p>}
        {error && <p className="warn">Couldn't load dishes: {error.message}</p>}
        {!loading && !error && list.length === 0 && <p className="muted">No featured dishes yet — mark dishes as featured in the admin dashboard.</p>}

        <div className="featured-grid">
          {list.map((d, i) => (
            <Reveal key={d._id} direction={i % 2 ? 'right' : 'left'} delay={(i % 3) * 0.08} className={`feature ${SLOTS[i]}`}>
              <div className="feature-media">
                <button onClick={() => setOpen(d)} aria-label={`View ${d.name}`}>
                  <SmoothImage src={d.image} alt={`${d.name}, a Lebanese dish`} name={d.name} />
                </button>
              </div>
              <div className="feature-info">
                <span className="feature-num">0{i + 1}</span>
                <h3>{d.name}</h3>
                {d.nameAr && <span className="dish-ar" lang="ar" dir="rtl">{d.nameAr}</span>}
                <p>{d.description}</p>
                <div className="feature-foot">
                  <strong>{money(d.price)}</strong>
                  <motion.button className="btn btn-small" whileTap={{ scale: 0.92 }} onClick={() => addToCart(d)} disabled={!d.isAvailable}>
                    {d.isAvailable ? 'Add to cart' : 'Unavailable'}
                  </motion.button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="center-cta"><Link to="/menu" className="btn btn-ghost">See the full menu →</Link></Reveal>
      </div>
      <DishModal dish={open} onClose={() => setOpen(null)} />
    </section>
  );
}
