import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Lighter animations on small screens, none when the user prefers reduced motion.
export default function useMotionPrefs() {
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return { reduced: !!reduced, mobile, light: !!reduced || mobile };
}
