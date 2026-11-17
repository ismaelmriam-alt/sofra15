import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { CedarMark } from '../../components/Logo.jsx';
import { ToastProvider } from './AdminUI.jsx';
import AdminLogin from './AdminLogin.jsx';
import { api, clearAdminKey, getAdminKey } from '../../api/client.js';

const TABS = [
  ['/admin', 'Overview', true],
  ['/admin/dishes', 'Dishes'],
  ['/admin/categories', 'Categories'],
  ['/admin/orders', 'Orders'],
];

export default function AdminLayout() {
  // checking → verifying a saved key · out → show sign-in · in → show dashboard
  const [status, setStatus] = useState(getAdminKey() ? 'checking' : 'out');

  const logout = useCallback(() => { clearAdminKey(); setStatus('out'); }, []);

  useEffect(() => {
    if (status !== 'checking') return;
    api.adminVerify().then(() => setStatus('in')).catch(() => logout());
  }, [status, logout]);

  useEffect(() => {
    window.addEventListener('sofra-admin-unauthorized', logout);
    return () => window.removeEventListener('sofra-admin-unauthorized', logout);
  }, [logout]);

  if (status === 'checking') return <div className="a-login"><span className="spinner" /></div>;
  if (status === 'out') return <AdminLogin onSuccess={() => setStatus('in')} />;

  return (
    <ToastProvider>
      <div className="admin">
        <aside className="a-side">
          <div className="a-brand"><CedarMark size={28} color="#F8F4EB" /><div><strong>SOFRA</strong><small>Admin</small></div></div>
          <nav aria-label="Admin">
            {TABS.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
          </nav>
          <Link className="a-back" to="/">← View website</Link>
          <button className="a-logout" onClick={logout}>Sign out</button>
        </aside>
        <main className="a-main"><Outlet /></main>
      </div>
    </ToastProvider>
  );
}
