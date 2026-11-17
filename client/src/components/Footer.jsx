import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { TileBand } from './Ornaments.jsx';
import Decor from './Decor.jsx';

const Social = ({ d, label }) => (
  <a href="#!" onClick={(e) => e.preventDefault()} className="social" aria-label={`${label} (demo link)`}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  </a>
);

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <TileBand />
      <Decor kind="rakwe" size={52} className="footer-decor" depth={10} />
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo light />
          <p>A modern Lebanese table, built on generous hospitality and recipes passed from hand to hand. Come hungry, leave with a thousand memories.</p>
          <div className="socials">
            <Social label="Instagram" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5v.01" />
            <Social label="Facebook" d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" />
            <Social label="X" d="M4 4l16 16M20 4 4 20" />
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Our Menu</Link></li>
            <li><a href="/#story">Our Story</a></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>
        <div>
          <h4>Visit &amp; Contact</h4>
          <ul className="contact-list">
            <li>Demo address: 12 Cedar Street, Beirut</li>
            <li>Demo phone: +961 00 000 000</li>
            <li>hello@sofra.example</li>
            <li>Daily · 12:00 – 23:00</li>
          </ul>
          <p className="demo-note">Fictional demo details — SOFRA is not a real restaurant.</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} SOFRA · Demo project</div>
    </footer>
  );
}
