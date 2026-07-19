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

  // Notification email via Web3Forms (facultatif : si la clé n'est pas
  // configurée, le message reste tout de même enregistré en base).
  const web3formsKey = process.env.WEB3FORMS_KEY;
  if (web3formsKey) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: `Nouveau message - ${nom}`,
          from_name: 'Site MACHINGA IMMOBILIER',
          nom,
          email,
          telephone,
          type_transaction: typeTransaction,
          type_logement: typeLogement,
          ville,
          quartier,
          message
        })
      });
    } catch (err) {
      // On n'échoue pas la requête si seul l'email de notification échoue :
      // le message est déjà enregistré et visible dans le dashboard admin.
    }
  }

  return NextResponse.json({ ok: true });
}
