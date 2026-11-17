import { motion } from 'framer-motion';
import SmoothImage from './SmoothImage.jsx';
import { Reveal } from './Reveal.jsx';
import { useAddToCart } from './DishCard.jsx';
import { money } from '../utils/format.js';

// One shared photo for the whole category (Manakish, Shisha) with every variety listed
// beneath it, each with its own Arabic name and price.
export default function SharedGroup({ category, items }) {
  const addToCart = useAddToCart();
  return (
    <Reveal className="shared-group">
      <div className="shared-photo">
        <SmoothImage src={category.image} alt={`${category.name} at SOFRA`} name={category.name} />
      </div>
      <div className="shared-list">
        {category.nameAr && <span className="dish-ar big" lang="ar" dir="rtl">{category.nameAr}</span>}
        <ul>
          {items.map((d) => (
            <li key={d._id} className={d.isAvailable ? '' : 'sold-out'}>
              <div className="shared-name">
                <strong>{d.name}</strong>
                {d.nameAr && <span className="dish-ar" lang="ar" dir="rtl">{d.nameAr}</span>}
                {d.description && <small>{d.description}</small>}
              </div>
              <span className="price">{money(d.price)}</span>
              <motion.button className="btn btn-small" disabled={!d.isAvailable} whileTap={{ scale: 0.92 }} onClick={() => addToCart({ ...d, image: category.image })} aria-label={`Add ${d.name} to cart`}>
                {d.isAvailable ? 'Add' : 'Unavailable'}
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
