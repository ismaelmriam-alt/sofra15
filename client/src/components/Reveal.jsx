import { Fragment } from 'react';
import { motion } from 'framer-motion';
import useMotionPrefs from '../hooks/useMotionPrefs.js';

const DIRS = { up: { y: 40 }, left: { x: -60 }, right: { x: 60 }, none: {} };

// Scroll-triggered entrance. direction: up | left | right
export function Reveal({ children, direction = 'up', delay = 0, className = '', as = 'div', ...rest }) {
  const { reduced, mobile } = useMotionPrefs();
  const Comp = motion[as] || motion.div;
  const off = DIRS[direction] || DIRS.up;
  const lighter = mobile ? { x: 0, y: off.y ? 24 : 0 } : off;
  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, ...lighter }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Image revealed through a clip-path mask on scroll
export function MaskReveal({ children, className = '', direction = 'up', delay = 0 }) {
  const { reduced } = useMotionPrefs();
  const from = { up: 'inset(100% 0 0 0)', left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)' }[direction];
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { clipPath: from }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Heading that reveals word by word
export function WordReveal({ text, className = '', as = 'h2', delay = 0, onMount = false }) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as];
  const words = text.split(' ');
  const trigger = onMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-60px' } };
  return (
    <Comp
      className={className}
      initial={reduced ? 'show' : 'hide'}
      {...trigger}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className="word"
              variants={{ hide: { y: '110%' }, show: { y: '0%' } }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Comp>
  );
}
