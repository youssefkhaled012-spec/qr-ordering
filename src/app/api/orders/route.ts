import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { tableCode, items } = await req.json() as {
      tableCode: string;
      items: { item_id: string; quantity: number; price_cents: number }[];
    };

    if (!tableCode || !items?.length) {
      return NextResponse.json({ error: 'Missing tableCode or items' }, { status: 400 });
    }

    // 1) First restaurant (MVP)
    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();
    if (rErr || !restaurant) {
      return NextResponse.json({ error: 'No restaurant configured' }, { status: 400 });
    }

    // 2) Find table by code
    const { data: table, error: tErr } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('code', tableCode)
      .single();
    if (tErr || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // 3) Create order
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurant.id,
        table_id: table.id,
        status: 'pending',
      })
      .select('*')
      .single();
    if (oErr || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 4) Insert order items
    const rows = items.map(it => ({
      order_id: order.id,
      item_id: it.item_id,
      quantity: it.quantity,
      price_cents: it.price_cents,
    }));
    const { error: oiErr } = await supabase.from('order_items').insert(rows);
    if (oiErr) {
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, order_id: order.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
