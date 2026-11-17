import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { api } from '../api/client.js';

const STORAGE_KEY = 'sofra_cart_v1';
const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// A cart line is identified by dish + chosen options, so "Hummus + extra garlic" is its own line.
export const lineKey = (dishId, optionIds = []) => `${dishId}|${[...optionIds].sort().join(',')}`;
export const lineUnitPrice = (l) => l.basePrice + l.options.reduce((s, o) => s + o.price, 0);

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { dish, options = [], quantity = 1 } = action;
      const key = lineKey(dish._id, options.map((o) => o._id));
      const existing = state.find((l) => l.key === key);
      if (existing) return state.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l));
      return [
        ...state,
        {
          key,
          dishId: dish._id,
          name: dish.name,
          image: dish.image,
          basePrice: dish.price,
          options: options.map((o) => ({ id: o._id, label: o.label, price: o.price })),
          quantity,
        },
      ];
    }
    case 'setQty':
      return state.map((l) => (l.key === action.key ? { ...l, quantity: Math.max(1, Math.min(50, action.quantity)) } : l));
    case 'remove':
      return state.filter((l) => l.key !== action.key);
    case 'clear':
      return [];
    case 'sync': {
      // Refresh prices/availability from the database so the cart never shows stale data.
      const byId = new Map(action.dishes.map((d) => [d._id, d]));
      return state
        .filter((l) => byId.has(l.dishId))
        .map((l) => {
          const d = byId.get(l.dishId);
          return {
            ...l,
            name: d.name,
            image: d.image,
            basePrice: d.price,
            unavailable: !d.isAvailable,
            options: l.options
              .filter((o) => d.customizations.some((c) => c._id === o.id))
              .map((o) => ({ ...o, price: d.customizations.find((c) => c._id === o.id).price })),
          };
        });
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines]);

  const syncWithMenu = useCallback(async () => {
    try {
      const dishes = await api.getDishes();
      dispatch({ type: 'sync', dishes });
    } catch { /* offline: keep what we have */ }
  }, []);

  // On load, and whenever the drawer opens, reconcile with the current menu.
  useEffect(() => { if (lines.length) syncWithMenu(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (open && lines.length) syncWithMenu(); /* eslint-disable-next-line */ }, [open]);

  const value = useMemo(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + lineUnitPrice(l) * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      total: subtotal,
      hasUnavailable: lines.some((l) => l.unavailable),
      open,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add: (dish, options = [], quantity = 1) => dispatch({ type: 'add', dish, options, quantity }),
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
