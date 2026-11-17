import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import Mascot from './Mascot.jsx';
import MenuCover from './MenuCover.jsx';
import { useMascot } from '../context/MascotContext.jsx';

// The SOFRA book is the ONE entrance to the website: shown once per browser tab session.
const KEY = 'sofra_entered';
const alreadyEntered = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };

// Customer-facing shell: book entrance (once), navbar, page transitions, footer, cart drawer, mascot.
export default function Layout() {
  const { pathname } = useLocation();
  const { say } = useMascot();
  const [entered, setEntered] = useState(alreadyEntered);

  const enter = () => {
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setEntered(true);
    setTimeout(() => say('welcome'), 900);
  };

  return (
    <>
      <AnimatePresence>{!entered && <MenuCover key="book" onOpen={enter} />}</AnimatePresence>
      {entered && (<>
      <Navbar />
      {/* fade-in only: an exit animation here could leave the next page stuck invisible */}
      <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Outlet />
        <Footer />
      </motion.div>
      <CartDrawer />
      </>)}
      <Mascot />
    </>
  );
}
