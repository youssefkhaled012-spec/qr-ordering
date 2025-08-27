import AddButton from '@/components/AddButton';
import CartDrawer from '@/components/cart/CartDrawer';
import { supabase } from '@/lib/supabase';

type Props = { params: { slug: string; code: string } };

async function getData(slug: string, code: string) {
  // 1) Restaurant by slug
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!restaurant) {
    return { restaurant: null as any, table: null as any, categories: [] as any[], items: [] as any[] };
  }

  // 2) Table by code
  const { data: table } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('code', code)
    .single();

  // 3) Categories
  const { data: categories = [] } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurant.id);

  // 4) Items
  const catIds = categories.map((c: any) => c.id);
  const { data: items = [] } = catIds.length
    ? await supabase
        .from('menu_items')
        .select('*, category_id')
        .in('category_id', catIds)
        .eq('is_active', true)
    : { data: [] as any[] };

  return { restaurant, table, categories, items };
}

export default async function Page({ params }: Props) {
  const { slug, code } = params;
  const { restaurant, table, categories, items } = await getData(slug, code);

  if (!restaurant) return <div className="p-6">No restaurant found for slug: {slug}</div>;
  if (!table) return <div className="p-6">Table not found for code: {code}</div>;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{restaurant.name}</h1>
        <p className="text-sm text-gray-500">Table: {table.label} (code {code})</p>
      </header>

      {categories.map((cat: any) => {
        const catItems = items.filter((it: any) => it.category_id === cat.id);
        if (!catItems.length) return null;

        return (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-lg font-medium">{cat.name}</h2>
            <div className="grid grid-cols-1 gap-2">
              {catItems.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-600">{(it.price_cents / 100).toFixed(2)} EGP</div>
                  </div>
                  <AddButton item={{ id: it.id, name: it.name, price_cents: it.price_cents }} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <CartDrawer tableCode={code} />
    </main>
  );
}
