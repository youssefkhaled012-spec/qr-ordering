// src/app/[slug]/admin/page.tsx
// @ts-nocheck

import { admin } from '@/lib/supabaseAdmin';
import StatusButtons from '@/components/admin/StatusButtons';

export const revalidate = 5; // auto-refresh the page data every 5s

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'done';

type Restaurant = {
  id: string;
  name: string;
  slug: string;
};

type OrderItemRow = {
  quantity: number;
  price_cents: number;
  menu_items: { name: string } | null;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
  created_at: string;
  table: { code: string | null; label: string | null } | null;
  order_items: OrderItemRow[];
};

type Props = { params: { slug: string } };

export default async function AdminPage({ params }: Props) {
  const { slug } = params;

  // --- Restaurant by slug (typed + minimal fields)
  const { data: restaurant } = await admin
    .from('restaurants')
    .select('id, name, slug')
    .eq('slug', slug)
    .single<Restaurant>();

  if (!restaurant) {
    return <div className="p-6">No restaurant for slug: {slug}</div>;
  }

  // --- Latest orders with nested items + table (default to [] so it's never null)
  const { data: ordersRaw = [] } = await admin
    .from('orders')
    .select(`
      id, status, created_at,
      table:table_id ( code, label ),
      order_items (
        quantity, price_cents,
        menu_items ( name )
      )
    `)
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const orders = ((ordersRaw ?? []) as unknown) as OrderRow[];


  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{restaurant.name} — Orders</h1>

      {orders.length === 0 && <div>No orders yet.</div>}

      {orders.map((o) => (
        <div key={o.id} className="rounded border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Order {o.id.slice(0, 8)}</div>
            <div className="text-sm text-gray-500">
              Table {o.table?.label || o.table?.code || '—'} •{' '}
              {new Date(o.created_at).toLocaleTimeString()}
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm">
            {o.order_items?.map((it, idx) => (
              <li key={idx}>
                {it.menu_items?.name ?? 'Item'} × {it.quantity} —{' '}
                {(it.price_cents / 100).toFixed(2)} EGP
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <span className="text-sm">
              Status: <b>{o.status}</b>
            </span>
            <StatusButtons orderId={o.id} current={o.status} />
          </div>
        </div>
      ))}
    </main>
  );
}
