import { motion } from 'framer-motion';
import SmoothImage from './SmoothImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import { money } from '../utils/format.js';

// Shared "add to cart" behaviour (also triggers the mascot).
export function useAddToCart() {
  const { add } = useCart();
  const { say } = useMascot();
  return (dish, options = [], qty = 1) => {
    if (!dish.isAvailable) return false;
    add(dish, options, qty);
    say('add');
    return true;
  };
}

export default function DishCard({ dish, onOpen, index = 0, variant = 'card' }) {
  const addToCart = useAddToCart();
  const soldOut = !dish.isAvailable;

  return (
    <motion.article
      layout
      className={`dish-card ${variant} ${soldOut ? 'sold-out' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="dish-media" onClick={() => onOpen(dish)} aria-label={`View details for ${dish.name}`}>
        <SmoothImage src={dish.image} alt={`${dish.name}, a Lebanese dish`} name={dish.name} />
        {soldOut && <span className="tag tag-out">Unavailable</span>}
        {!soldOut && dish.isFeatured && <span className="tag tag-feat">Signature</span>}
      </button>
      <div className="dish-body">
        <div className="dish-title-row">
          <h3 onClick={() => onOpen(dish)}>{dish.name}</h3>
          <span className="price">{money(dish.price)}</span>
        </div>
        {dish.nameAr && <span className="dish-ar" lang="ar" dir="rtl">{dish.nameAr}</span>}
        <p className="dish-desc">{dish.description}</p>
        <div className="dish-actions">
          <button className="link-btn" onClick={() => onOpen(dish)}>Details</button>
          <motion.button className="btn btn-small" disabled={soldOut} whileTap={{ scale: 0.92 }} onClick={() => addToCart(dish)}>
            {soldOut ? 'Unavailable' : 'Add to cart'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
