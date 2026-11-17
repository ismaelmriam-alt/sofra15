import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

const MotionLink = motion(Link);

// Button/link that gently follows the pointer (desktop only) and presses down on click.
export default function MagneticButton({ to, children, className = 'btn btn-primary', strength = 0.28, ...rest }) {
  const ref = useRef(null);
  const { light } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    if (light || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  const props = { ref, className, style: { x: sx, y: sy }, onMouseMove: onMove, onMouseLeave: reset, whileTap: { scale: 0.95 }, ...rest };

  return to ? <MotionLink to={to} {...props}>{children}</MotionLink> : <motion.button type="button" {...props}>{children}</motion.button>;
}
