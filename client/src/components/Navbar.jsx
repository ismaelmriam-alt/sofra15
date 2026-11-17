import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo.jsx';
import { useCart } from '../context/CartContext.jsx';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Menu', to: '/menu' },
  { label: 'Our Story', to: '/#story', hash: 'story' },
  { label: 'Contact', to: '/#contact', hash: 'contact' },
];

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count, openCart } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menu]);

  // Hash links: scroll smoothly when already on the home page, otherwise navigate then scroll.
  const goHash = (e, hash) => {
    e.preventDefault();
    setMenu(false);
    const scroll = () => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    if (pathname === '/') scroll();
    else { navigate('/'); setTimeout(scroll, 450); }
  };

  const renderLink = (l, cls = '') =>
    l.hash ? (
      <a key={l.label} href={l.to} onClick={(e) => goHash(e, l.hash)} className={cls}>{l.label}</a>
    ) : (
      <NavLink key={l.label} to={l.to} end={l.to === '/'} className={({ isActive }) => `${cls} ${isActive ? 'active' : ''}`}>{l.label}</NavLink>
    );

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Main">{LINKS.map((l) => renderLink(l, 'nav-link'))}</nav>
          <div className="nav-actions">
            <button className="cart-btn" onClick={openCart} aria-label={`Open cart, ${count} items`}>
              <CartIcon />
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span key={count} className="cart-badge" initial={{ scale: 0.4, y: -6 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.4 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }}>
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button className={`burger ${menu ? 'open' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Toggle menu" aria-expanded={menu}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div className="mobile-menu" initial={{ clipPath: 'circle(0% at calc(100% - 56px) 36px)' }} animate={{ clipPath: 'circle(150% at calc(100% - 56px) 36px)' }} exit={{ clipPath: 'circle(0% at calc(100% - 56px) 36px)' }} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}>
            <nav aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div key={l.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                  {renderLink(l, 'mobile-link')}
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <Link to="/menu" className="btn btn-light">Order now</Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
