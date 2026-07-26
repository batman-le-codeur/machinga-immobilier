import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(request) {
  const body = await request.json();
  const {
    nom,
    email,
    telephone,
    typeTransaction,
    typeLogement,
    ville,
    quartier,
    message,
    consentement
  } = body;

  if (!nom || !email || !telephone || !typeTransaction || !typeLogement || !ville || !message) {
    return NextResponse.json({ error: 'Merci de remplir tous les champs obligatoires.' }, { status: 400 });
  }
  if (!consentement) {
    return NextResponse.json(
      { error: "Merci d'accepter l'utilisation de vos données pour continuer." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('messages').insert({
    nom,
    email,
    telephone,
    type_transaction: typeTransaction,
    type_logement: typeLogement,
    ville,
    quartier: quartier || null,
    consentement: Boolean(consentement),
    message
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
