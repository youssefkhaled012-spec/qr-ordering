// src/app/[slug]/qr/page.tsx
import { admin } from '@/lib/supabaseAdmin';
import QRCode from 'qrcode';

type Props = { params: { slug: string } };

type Restaurant = { id: string; slug: string; name: string };
type Table = { code: string; label: string | null };

export const revalidate = 5;

export default async function QRPage({ params }: Props) {
  const { slug } = params;

  // Get restaurant
  const { data: restaurant } = await admin
    .from('restaurants')
    .select('id, slug, name')
    .eq('slug', slug)
    .single<Restaurant>();

  if (!restaurant) {
    return <div className="p-6">No restaurant for slug: {slug}</div>;
  }

  // Get tables (default to [] so it's never null)
  const { data: tables = [] } = await admin
    .from('tables')
    .select('code, label')
    .eq('restaurant_id', restaurant.id);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';

  const entries = await Promise.all(
    (tables as Table[]).map(async (t) => {
      const url = `${base}/${restaurant.slug}/t/${t.code}`;
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 8 });
      return { ...t, url, dataUrl };
    })
  );

  if (entries.length === 0) {
    return <div className="p-6">No tables found.</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{restaurant.name} — QR Codes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {entries.map((t) => (
          <div key={t.code} className="rounded border p-4 space-y-2">
            <img src={t.dataUrl} alt={`QR ${t.code}`} className="w-48 h-48" />
            <div className="text-sm text-gray-500 break-words">{t.url}</div>
            <div className="text-sm">Table {t.label || t.code}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
