import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

// Smoothly tweens a money amount when it changes (used in cart totals)
export default function AnimatedNumber({ value, prefix = '$', decimals = 2 }) {
  const ref = useRef(null);
  const prev = useRef(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) { node.textContent = `${prefix}${value.toFixed(decimals)}`; prev.current = value; return; }
    const controls = animate(prev.current, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => { node.textContent = `${prefix}${v.toFixed(decimals)}`; },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, prefix, decimals, reduced]);

  return <span ref={ref}>{`${prefix}${value.toFixed(decimals)}`}</span>;
}
