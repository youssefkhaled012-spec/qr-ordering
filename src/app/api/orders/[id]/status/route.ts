import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json() as { status: 'pending' | 'preparing' | 'ready' | 'done' };
    if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
