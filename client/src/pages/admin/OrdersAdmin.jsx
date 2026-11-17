import { Fragment, useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { money, formatDate } from '../../utils/format.js';
import { StateBlock, useToast } from './AdminUI.jsx';

const STATUSES = ['Pending', 'Preparing', 'Delivered'];

export default function OrdersAdmin() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(() => api.getOrders(), []);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const changeStatus = async (o, status) => {
    try {
      const updated = await api.updateOrderStatus(o._id, status);
      setData((list) => list.map((x) => (x._id === o._id ? updated : x)));
      toast(`${o.orderId} → ${status}`);
    } catch (e) { toast(e.message, 'err'); }
  };

  const shown = (data || []).filter((o) => !filter || o.status === filter);

  return (
    <>
      <header className="a-head row"><div><h1>Orders</h1><p className="muted">Newest first.</p></div>
        <div className="a-toolbar inline"><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select><button className="btn btn-ghost" onClick={reload}>Refresh</button></div></header>
      <StateBlock loading={loading && !data} error={error} onRetry={reload} empty={data && shown.length === 0} emptyText="No orders yet." />
      {shown.length > 0 && (
        <section className="a-card"><div className="a-table-wrap"><table className="a-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Type</th><th>Total</th><th>Placed</th><th>Status</th></tr></thead>
          <tbody>{shown.map((o) => (
            <Fragment key={o._id}>
              <tr>
                <td data-label="Order ID"><button className="link-btn" onClick={() => setOpen(open === o._id ? null : o._id)} aria-expanded={open === o._id}>{o.orderId}</button></td>
                <td data-label="Customer">{o.customerName}</td><td data-label="Phone">{o.phone}</td><td data-label="Type">{o.orderType}</td><td data-label="Total">{money(o.total)}</td><td data-label="Placed">{formatDate(o.createdAt)}</td>
                <td data-label="Status"><select className={`status-select ${o.status.toLowerCase()}`} value={o.status} onChange={(e) => changeStatus(o, e.target.value)} aria-label={`Status for ${o.orderId}`}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
              </tr>
              {open === o._id && (
                <tr key={`${o._id}-d`} className="a-detail"><td colSpan={7}>
                  <ul>{o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.name}{i.options.length ? ` (${i.options.join(', ')})` : ''} — {money(i.lineTotal)}</li>)}</ul>
                  {o.address && <p><strong>Address:</strong> {o.address}</p>}{o.notes && <p><strong>Notes:</strong> {o.notes}</p>}
                </td></tr>
              )}
            </Fragment>
          ))}</tbody>
        </table></div></section>
      )}
    </>
  );
}
