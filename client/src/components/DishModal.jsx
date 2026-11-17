import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SmoothImage from './SmoothImage.jsx';
import { useAddToCart } from './DishCard.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import { money } from '../utils/format.js';

export default function DishModal({ dish, onClose }) {
  return (
    <AnimatePresence>
      {dish && <ModalContent key={dish._id} dish={dish} onClose={onClose} />}
    </AnimatePresence>
  );
}

function ModalContent({ dish, onClose }) {
  const addToCart = useAddToCart();
  const { say } = useMascot();
  // Selecting a dish (opening its details) triggers the mascot
  useEffect(() => { if (dish) say('select'); /* eslint-disable-next-line */ }, [dish?._id]);
  const [selected, setSelected] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const chosen = useMemo(() => dish.customizations.filter((c) => selected.includes(c._id)), [dish, selected]);
  const unit = dish.price + chosen.reduce((s, c) => s + c.price, 0);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const add = () => { if (addToCart(dish, chosen, qty)) onClose(); };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="dish-modal"
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close">✕</button>
        <motion.div className="modal-media" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 0.8, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}>
          <SmoothImage src={dish.image} alt={`${dish.name}, a Lebanese dish`} name={dish.name} eager />
        </motion.div>
        <div className="modal-body">
          <p className="eyebrow">{dish.category?.name}</p>
          <h2>{dish.name}</h2>
          {dish.nameAr && <span className="dish-ar big" lang="ar" dir="rtl">{dish.nameAr}</span>}
          <p className="modal-desc">{dish.description}</p>

          {dish.ingredients.length > 0 && (
            <div className="modal-section">
              <h4>Ingredients</h4>
              <ul className="chips">{dish.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          )}

          {dish.customizations.length > 0 && dish.isAvailable && (
            <div className="modal-section">
              <h4>Make it yours</h4>
              <ul className="options">
                {dish.customizations.map((c) => (
                  <li key={c._id}>
                    <label>
                      <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} />
                      <span>{c.label}</span>
                      <em>{c.price > 0 ? `+${money(c.price)}` : 'Free'}</em>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-foot">
            {dish.isAvailable ? (
              <>
                <div className="qty big">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <motion.button className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={add}>
                  Add to cart · {money(unit * qty)}
                </motion.button>
              </>
            ) : (
              <p className="warn">This dish is currently unavailable.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
