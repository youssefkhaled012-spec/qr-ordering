import { admin } from '@/lib/supabaseAdmin';
import QRCode from 'qrcode';

type Props = { params: { slug: string } };

export default async function QRPage({ params }: Props) {
  const { slug } = params;

  const { data: restaurant } = await admin
    .from('restaurants')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (!restaurant) return <div className="p-6">No restaurant for slug: {slug}</div>;

  const { data: tables = [] } = await admin
    .from('tables')
    .select('code, label')
    .eq('restaurant_id', restaurant.id)
    .order('code', { ascending: true });

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
  const entries = await Promise.all(
    tables.map(async (t: any) => {
      const url = `${base}/${restaurant.slug}/t/${t.code}`;
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 8 });
      return { ...t, url, dataUrl };
    })
  );

  return (
    <main className="max-w-4xl mx-auto p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
      {entries.map((e) => (
        <div key={e.code} className="border rounded-lg p-4 text-center bg-white">
          <img src={e.dataUrl} alt={`QR ${e.code}`} className="mx-auto" />
          <div className="mt-2 font-medium">{restaurant.name} — {e.label || e.code}</div>
          <div className="text-xs text-gray-600 break-all">{e.url}</div>
        </div>
      ))}
    </main>
  );
}
