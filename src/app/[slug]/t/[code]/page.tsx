// src/app/[slug]/t/[code]/page.tsx
// @ts-nocheck

import AddButton from '@/components/AddButton';
import CartDrawer from '@/components/cart/CartDrawer';
import { supabase } from '@/lib/supabase';

type Props = { params: { slug: string; code: string } };

export default async function Page({ params }: Props) {
  const { slug, code } = params;

  // 1) Restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (!restaurant) {
    return <div className="p-6">No restaurant found.</div>;
  }

  // 2) Table
  const { data: table } = await supabase
    .from('tables')
    .select('id, label, code')
    .eq('restaurant_id', restaurant.id)
    .eq('code', code)
    .single();

  if (!table) {
    return <div className="p-6">Table not found.</div>;
  }

  // 3) Categories (✅ default to [] so never null)
  const { data: categories = [] } = await supabase
    .from('menu_categories')
    .select('id, name, sort')
    .eq('restaurant_id', restaurant.id)
    .order('sort', { ascending: true });

  // 4) Items (✅ safe if there are no categories)
  const catIds = (categories as any[]).map((c) => c.id);
  const { data: items = [] } =
    catIds.length > 0
      ? await supabase
          .from('menu_items')
          .select('id, name, price_cents, category_id, sort')
          .in('category_id', catIds)
          .order('sort', { ascending: true })
      : { data: [] as any[] };

  // 5) Group items by category
  const byCat = new Map<string, any[]>();
  for (const it of items as any[]) {
    const key = it.category_id as string;
    const arr = byCat.get(key) ?? [];
    arr.push(it);
    byCat.set(key, arr);
  }

  // 6) Render
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{restaurant.name}</h1>
      <div className="text-sm text-gray-500">Table: {table.label || `code ${table.code}`}</div>

      {(categories as any[]).map((cat) => {
        const catItems = byCat.get(cat.id) ?? [];
        return (
          <section key={cat.id} className="space-y-2">
            <h2 className="text-lg font-medium">{cat.name}</h2>

            {catItems.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{(it.price_cents / 100).toFixed(2)} EGP</div>
                </div>
                <AddButton item={{ id: it.id, name: it.name, price_cents: it.price_cents }} />
              </div>
            ))}

            {catItems.length === 0 && <div className="text-sm text-gray-500">No items.</div>}
          </section>
        );
      })}

      <CartDrawer tableCode={code} />
    </main>
  );
}
