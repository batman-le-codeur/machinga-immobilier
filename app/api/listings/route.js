import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO, fromListingInput } from '../../../lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('date_ajout', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data.map(toListingDTO));
}

export async function POST(request) {
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const row = {
    ...fromListingInput(body),
    type: body.type || 'location',
    category: body.category || '',
    titre: body.titre || '',
    prix: Number(body.prix) || 0,
    localisation: body.localisation || '',
    photos: Array.isArray(body.photos) ? body.photos : [],
    statut: body.statut || 'disponible'
  };

  const { data, error } = await supabase.from('listings').insert(row).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toListingDTO(data), { status: 201 });
}
