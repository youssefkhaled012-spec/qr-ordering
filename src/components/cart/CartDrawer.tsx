// @ts-nocheck

'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartContext';

export default function CartDrawer({ tableCode }: { tableCode: string }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const total = (cart.totalCents / 100).toFixed(2) + ' EGP';
  const qtyTotal = cart.items.reduce((s, i) => s + i.qty, 0);

  async function placeOrder() {
    setPlacing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableCode,
          items: cart.items.map(i => ({
            item_id: i.id,
            quantity: i.qty,
            price_cents: i.price_cents
          }))
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMsg(`Order placed! ID: ${data.order_id}`);
      cart.clear();
    } catch (e: any) {
      setMsg(e.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-6 right-6 rounded-full border px-4 py-2 text-sm shadow bg-white"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Close Cart' : `Cart (${qtyTotal})`}
      </button>

      {open && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4">
          <div className="mx-auto max-w-xl rounded-xl border bg-white p-4">
            <h3 className="text-lg font-medium mb-3">Your Cart</h3>
            {cart.items.length === 0 ? (
              <div className="text-sm text-gray-500">Empty</div>
            ) : (
              <div className="space-y-2">
                {cart.items.map(it => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">
                        {(it.price_cents/100).toFixed(2)} EGP × {it.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded border px-2" onClick={() => cart.dec(it.id)}>-</button>
                      <span>{it.qty}</span>
                      <button className="rounded border px-2" onClick={() => cart.inc(it.id)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-medium">{total}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border px-3 py-2 text-sm"
                    disabled={placing || cart.items.length === 0}
                    onClick={placeOrder}
                  >
                    {placing ? 'Placing…' : 'Place Order'}
                  </button>
                  <button className="rounded-md border px-3 py-2 text-sm" onClick={cart.clear}>
                    Clear
                  </button>
                </div>
                {msg && <div className="text-xs text-gray-600 mt-1">{msg}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
