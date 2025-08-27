// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { tableCode, items } = (await req.json()) as {
      tableCode: string;
      items: { item_id: string; quantity: number; price_cents: number }[];
    };

    if (!tableCode || !items?.length) {
      return NextResponse.json({ error: 'Missing tableCode or items' }, { status: 400 });
    }

    const { data: restaurant, error: rErr } = await admin
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();
    if (rErr || !restaurant) return NextResponse.json({ error: 'No restaurant' }, { status: 400 });

    const { data: table, error: tErr } = await admin
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('code', tableCode)
      .single();
    if (tErr || !table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    const { data: order, error: oErr } = await admin
      .from('orders')
      .insert({ restaurant_id: restaurant.id, table_id: table.id, status: 'pending' })
      .select('*')
      .single();
    if (oErr || !order) return NextResponse.json({ error: 'Create order failed' }, { status: 500 });

    const rows = items.map(it => ({
      order_id: order.id,
      item_id: it.item_id,
      quantity: it.quantity,
      price_cents: it.price_cents,
    }));
    const { error: oiErr } = await admin.from('order_items').insert(rows);
    if (oiErr) return NextResponse.json({ error: 'Create order items failed' }, { status: 500 });

    return NextResponse.json({ ok: true, order_id: order.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
