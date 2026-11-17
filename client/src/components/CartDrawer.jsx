import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart, lineUnitPrice } from '../context/CartContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import SmoothImage from './SmoothImage.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';
import { money } from '../utils/format.js';

export default function CartDrawer() {
  const { say } = useMascot();
  const { open, closeCart, lines, count, subtotal, total, setQty, remove, hasUnavailable } = useCart();
  const navigate = useNavigate();

  useEffect(() => { if (open) say('cartOpen'); /* eslint-disable-next-line */ }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, closeCart]);

  const checkout = () => { closeCart(); navigate('/checkout'); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="drawer-head">
              <div><h2>Your Order</h2><p>{count} {count === 1 ? 'item' : 'items'}</p></div>
              <button className="icon-btn" onClick={closeCart} aria-label="Close cart">✕</button>
            </header>

            <div className="drawer-body">
              {lines.length === 0 ? (
                <div className="drawer-empty">
                  <p className="serif">Your table is empty.</p>
                  <p>Add a few dishes to begin your meal.</p>
                  <button className="btn btn-primary" onClick={() => { closeCart(); navigate('/menu'); }}>Browse the menu</button>
                </div>
              ) : (
                <ul className="cart-lines">
                  <AnimatePresence initial={false}>
                    {lines.map((l, i) => (
                      <motion.li
                        key={l.key}
                        layout
                        className={`cart-line ${l.unavailable ? 'is-unavailable' : ''}`}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                        exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SmoothImage src={l.image} alt={l.name} name={l.name} className="cart-thumb" />
                        <div className="cart-line-info">
                          <h3>{l.name}</h3>
                          {l.options.length > 0 && <p className="muted small">{l.options.map((o) => o.label).join(', ')}</p>}
                          {l.unavailable ? <p className="warn small">Currently unavailable — please remove</p> : <p className="muted small">{money(lineUnitPrice(l))} each</p>}
                          <div className="qty">
                            <button onClick={() => setQty(l.key, l.quantity - 1)} disabled={l.quantity <= 1} aria-label={`Decrease ${l.name}`}>−</button>
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span key={l.quantity} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}>{l.quantity}</motion.span>
                            </AnimatePresence>
                            <button onClick={() => setQty(l.key, l.quantity + 1)} aria-label={`Increase ${l.name}`}>+</button>
                          </div>
                        </div>
                        <div className="cart-line-end">
                          <strong>{money(lineUnitPrice(l) * l.quantity)}</strong>
                          <button className="link-btn" onClick={() => remove(l.key)} aria-label={`Remove ${l.name}`}>Remove</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="drawer-foot">
                <div className="sum-row"><span>Subtotal</span><span><AnimatedNumber value={subtotal} /></span></div>
                <div className="sum-row total"><span>Total</span><span><AnimatedNumber value={total} /></span></div>
                {hasUnavailable && <p className="warn small">Remove unavailable items to continue.</p>}
                <button className="btn btn-primary block" onClick={checkout} disabled={hasUnavailable}>Proceed to checkout</button>
                <button className="btn btn-ghost block" onClick={closeCart}>Continue shopping</button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
