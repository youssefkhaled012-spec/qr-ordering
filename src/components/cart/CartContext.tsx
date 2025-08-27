'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type CartItem = { id: string; name: string; price_cents: number; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (item: { id: string; name: string; price_cents: number }) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  totalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const api: CartCtx = useMemo(() => ({
    items,
    add: (it) => setItems(prev => {
      const found = prev.find(p => p.id === it.id);
      if (found) return prev.map(p => p.id === it.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...it, qty: 1 }];
    }),
    inc: (id) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p)),
    dec: (id) => setItems(prev => prev.flatMap(p => p.id === id ? (p.qty > 1 ? [{ ...p, qty: p.qty - 1 }] : []) : [p])),
    clear: () => setItems([]),
    totalCents: items.reduce((s, it) => s + it.price_cents * it.qty, 0),
  }), [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart must be used inside <CartProvider>');
  return v;
}
