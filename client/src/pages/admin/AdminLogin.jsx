import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, setAdminKey } from '../../api/client.js';
import { CedarMark } from '../../components/Logo.jsx';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return setError('Enter the admin password');
    setBusy(true); setError('');
    try {
      await api.adminLogin(password);
      setAdminKey(password);
      onSuccess();
    } catch (err) {
      setError(err.status === 401 ? 'Incorrect password' : err.message);
    } finally { setBusy(false); }
  };

  return (
    <main className="a-login">
      <form className="a-login-card" onSubmit={submit} noValidate>
        <div className="a-login-brand"><CedarMark size={34} color="#285B40" /><div><strong>SOFRA</strong><small>Restaurant admin</small></div></div>
        <p className="muted">Only the restaurant administrator can manage the menu and orders.</p>
        <label htmlFor="admin-pw">Admin password</label>
        <input id="admin-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoFocus />
        {error && <small className="field-error" role="alert">{error}</small>}
        <button className="btn btn-primary block" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
        <Link to="/" className="a-login-back">← Back to the website</Link>
      </form>
    </main>
  );
}
