// src/app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabaseAdmin';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'done';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 Next 15 expects params as a Promise
) {
  try {
    const { id } = await context.params; // 👈 await the params
    const { status } = (await request.json()) as { status: OrderStatus };

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const { error } = await admin.from('orders').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
