import { supabase } from '@/lib/supabase';
import StatusButtons from '@/components/admin/StatusButtons';

type Props = { params: { slug: string } };

export default async function AdminPage({ params }: Props) {
  const { slug } = params;

  // Find the restaurant by slug
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!restaurant) return <div className="p-6">No restaurant for slug: {slug}</div>;

  // Fetch latest orders with nested items + table
  const { data: orders = [] } = await supabase
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

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{restaurant.name} — Orders</h1>
      {orders.length === 0 && <div>No orders yet.</div>}

      {orders.map((o: any) => (
        <div key={o.id} className="rounded border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Order {o.id.slice(0, 8)}</div>
            <div className="text-sm text-gray-500">
              Table {o.table?.label || o.table?.code} • {new Date(o.created_at).toLocaleTimeString()}
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm">
            {o.order_items?.map((it: any, idx: number) => (
              <li key={idx}>
                {it.menu_items?.name} × {it.quantity} — {(it.price_cents / 100).toFixed(2)} EGP
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <span className="text-sm">Status: <b>{o.status}</b></span>
            <StatusButtons orderId={o.id} current={o.status} />
          </div>
        </div>
      ))}
    </main>
  );
}
