import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import {
  getCurrentOwner,
  cleanText,
  normalizePhone,
  isValidPhone,
  toOwnerDTO
} from '../../../../lib/owners';

export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  return NextResponse.json(owner);
}

export async function PUT(request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const nom = cleanText(body.nom, 100);
  const telephone = normalizePhone(body.telephone);

  if (!nom) return NextResponse.json({ error: 'Le nom est obligatoire.' }, { status: 400 });
  if (!isValidPhone(telephone)) {
    return NextResponse.json(
      { error: 'Numéro de téléphone invalide (au moins 8 chiffres).' },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from('owners')
    .update({ nom, telephone })
    .eq('id', owner.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toOwnerDTO(data));
}
