import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO, fromListingInput } from '../../../../lib/supabaseAdmin';

export async function PUT(request, { params }) {
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const updates = Object.fromEntries(
    Object.entries(fromListingInput(body)).filter(([, v]) => v !== undefined)
  );

  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json(toListingDTO(data));
}

export async function DELETE(request, { params }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('listings').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
