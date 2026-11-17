import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { money, formatDate } from '../../utils/format.js';
import { StateBlock } from './AdminUI.jsx';

export default function Overview() {
  const { data, loading, error, reload } = useFetch(() => api.getStats(), []);
  return (
    <>
      <header className="a-head"><h1>Overview</h1><p className="muted">Live numbers from the database.</p></header>
      <StateBlock loading={loading} error={error} onRetry={reload} />
      {data && (
        <>
          <div className="a-stats">
            <Link to="/admin/dishes" className="a-stat"><small>Total dishes</small><strong>{data.totalDishes}</strong></Link>
            <Link to="/admin/categories" className="a-stat"><small>Categories</small><strong>{data.totalCategories}</strong></Link>
            <Link to="/admin/orders" className="a-stat"><small>Total orders</small><strong>{data.totalOrders}</strong></Link>
            <Link to="/admin/orders" className="a-stat"><small>Pending orders</small><strong>{data.pendingOrders}</strong></Link>
          </div>
          <section className="a-card">
            <h2>Recent orders</h2>
            {data.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : (
              <div className="a-table-wrap">
                <table className="a-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td data-label="Order"><strong>{o.orderId}</strong></td><td data-label="Customer">{o.customerName}</td><td data-label="Type">{o.orderType}</td>
                        <td data-label="Total">{money(o.total)}</td><td data-label="Status"><span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span></td><td data-label="Placed">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
