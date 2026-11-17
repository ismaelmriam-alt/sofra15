import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, lineUnitPrice } from '../context/CartContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import { api } from '../api/client.js';
import SmoothImage from '../components/SmoothImage.jsx';
import { money } from '../utils/format.js';

const PHONE_RE = /^[+\d][\d\s\-()]{5,}$/;

export default function Checkout() {
  const { lines, subtotal, total, clear, hasUnavailable } = useCart();
  const { say } = useMascot();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', orderType: 'Pickup', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Please enter your name';
    if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (form.orderType === 'Delivery' && !form.address.trim()) e.address = 'Delivery address is required';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: lines.map((l) => ({ dishId: l.dishId, quantity: l.quantity, optionIds: l.options.map((o) => o.id) })),
      });
      clear();
      say('order');
      navigate(`/order/${order.orderId}`, { state: { order }, replace: true });
    } catch (err) {
      setServerError(err.message);
      if (err.details && typeof err.details === 'object') setErrors((x) => ({ ...x, ...err.details }));
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="page container narrow center">
        <h1 className="serif">Your cart is empty</h1>
        <p className="muted">Add some dishes before checking out.</p>
        <Link to="/menu" className="btn btn-primary">Browse the menu</Link>
      </main>
    );
  }

  const field = (k, label, props = {}) => (
    <div className={`field ${errors[k] ? 'has-error' : ''}`}>
      <label htmlFor={k}>{label}</label>
      {props.textarea ? <textarea id={k} rows={3} value={form[k]} onChange={set(k)} {...props.input} /> : <input id={k} value={form[k]} onChange={set(k)} {...props.input} />}
      <AnimatePresence>{errors[k] && <motion.small className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{errors[k]}</motion.small>}</AnimatePresence>
    </div>
  );

  return (
    <main className="page container checkout">
      <motion.h1 className="serif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Checkout</motion.h1>
      <div className="checkout-grid">
        <motion.form className="panel" onSubmit={submit} noValidate initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2>Your details</h2>
          {field('customerName', 'Full name', { input: { autoComplete: 'name', placeholder: 'e.g. Maya Khoury' } })}
          {field('phone', 'Phone number', { input: { autoComplete: 'tel', inputMode: 'tel', placeholder: '+961 70 123 456' } })}
          <fieldset className="order-type">
            <legend>Order type</legend>
            {['Pickup', 'Delivery'].map((t) => (
              <label key={t} className={form.orderType === t ? 'on' : ''}>
                <input type="radio" name="orderType" value={t} checked={form.orderType === t} onChange={set('orderType')} />
                {t}
              </label>
            ))}
          </fieldset>
          <AnimatePresence initial={false}>
            {form.orderType === 'Delivery' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                {field('address', 'Delivery address', { textarea: true, input: { placeholder: 'Street, building, floor' } })}
              </motion.div>
            )}
          </AnimatePresence>
          {field('notes', 'Order notes (optional)', { textarea: true, input: { placeholder: 'Allergies, extra napkins…' } })}
          {hasUnavailable && <p className="warn">Some items in your cart are unavailable. Please remove them first.</p>}
          {serverError && <p className="warn" role="alert">{serverError}</p>}
          <button className="btn btn-primary block" disabled={submitting || hasUnavailable}>
            {submitting ? <><span className="spinner small" /> Placing order…</> : `Place order · ${money(total)}`}
          </button>
          <p className="muted small center">Demo ordering system — no payment is taken.</p>
        </motion.form>

        <motion.aside className="panel summary" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2>Order summary</h2>
          <ul>
            {lines.map((l) => (
              <li key={l.key}>
                <SmoothImage src={l.image} alt={l.name} name={l.name} className="cart-thumb" />
                <div><strong>{l.name}</strong>{l.options.length > 0 && <small>{l.options.map((o) => o.label).join(', ')}</small>}<small>{l.quantity} × {money(lineUnitPrice(l))}</small></div>
                <span>{money(lineUnitPrice(l) * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
        </motion.aside>
      </div>
    </main>
  );
}
