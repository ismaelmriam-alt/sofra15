import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { money, formatDate } from '../utils/format.js';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    api.lookupOrder(orderId).then(setOrder).catch((e) => setError(e.message));
  }, [order, orderId]);

  if (error) return <main className="page container narrow center"><h1 className="serif">Order not found</h1><p className="warn">{error}</p><Link className="btn btn-primary" to="/menu">Back to menu</Link></main>;
  if (!order) return <main className="page container narrow center"><span className="spinner" /></main>;

  return (
    <main className="page container narrow confirm">
      <div className="confirm-head">
        <motion.svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
          <motion.circle cx="48" cy="48" r="42" fill="none" stroke="#285B40" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
          <motion.path d="M28 49 L42 63 L69 34" fill="none" stroke="#285B40" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.8 }} />
        </motion.svg>
        <motion.h1 className="serif" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>Thank you, {order.customerName.split(' ')[0]}!</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="muted">Your order has been received.</motion.p>
        <motion.div className="order-id" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 }}>
          <small>Order ID</small><strong>{order.orderId}</strong>
        </motion.div>
      </div>

      <motion.section className="panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.7 }}>
        <dl className="meta">
          <div><dt>Type</dt><dd>{order.orderType}</dd></div>
          <div><dt>Status</dt><dd>{order.status}</dd></div>
          <div><dt>Placed</dt><dd>{formatDate(order.createdAt)}</dd></div>
          <div><dt>Phone</dt><dd>{order.phone}</dd></div>
          {order.address && <div className="wide"><dt>Address</dt><dd>{order.address}</dd></div>}
          {order.notes && <div className="wide"><dt>Notes</dt><dd>{order.notes}</dd></div>}
        </dl>
        <ul className="confirm-items">
          {order.items.map((i, idx) => (
            <motion.li key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.7 + idx * 0.08 }}>
              <span>{i.quantity} × {i.name}{i.options.length > 0 && <small> ({i.options.join(', ')})</small>}</span><span>{money(i.lineTotal)}</span>
            </motion.li>
          ))}
        </ul>
        <div className="sum-row total"><span>Total</span><span>{money(order.total)}</span></div>
      </motion.section>
      <div className="center"><Link to="/menu" className="btn btn-primary">Order something else</Link> <Link to="/" className="btn btn-ghost">Back home</Link></div>
    </main>
  );
}
