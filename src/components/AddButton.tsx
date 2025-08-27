'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartContext';

type Props = { item: { id: string; name: string; price_cents: number } };

export default function AddButton({ item }: Props) {
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    cart.add(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        onClick={handleAdd}
      >
        Add
      </button>
      {justAdded && <span className="text-xs text-green-600">✓ added</span>}
    </div>
  );
}
