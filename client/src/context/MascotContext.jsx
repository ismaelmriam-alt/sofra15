import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// The ONLY five approved messages.
const MESSAGES = {
  welcome: { text: 'أهلاً وسهلاً فيكن، نورتوا SOFRA! ❤️', pose: 'wave', duration: 5200 },
  select: { text: 'يا عيني عالذوق! 😍', pose: 'thumbs', duration: 3600 },
  add: { text: 'زيد زيد، السفرة بعد ناقصة! 😂', pose: 'cheer', duration: 4200 },
  cartOpen: { text: 'يا عيني، ورّجينا شو اخترت!', pose: 'thumbs', duration: 4000 },
  order: { text: 'صحتين على قلبك، ونورتوا SOFRA! ❤️', pose: 'cheer', duration: 6000 },
};

const MascotContext = createContext(null);
export const useMascot = () => useContext(MascotContext);

export function MascotProvider({ children }) {
  const [current, setCurrent] = useState(null); // { kind, text, pose, id }
  const timer = useRef();

  const say = useCallback((kind) => {
    const m = MESSAGES[kind];
    if (!m) return;
    clearTimeout(timer.current);
    setCurrent({ kind, ...m, id: Date.now() });
    timer.current = setTimeout(() => setCurrent(null), m.duration);
  }, []);

  // The 'welcome' message is triggered by the book entrance (Layout) after the customer opens it.

  const value = useMemo(() => ({ current, say, dismiss: () => setCurrent(null) }), [current, say]);
  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}
