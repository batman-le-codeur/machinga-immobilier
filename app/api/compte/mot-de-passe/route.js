import { NextResponse } from 'next/server';
import { getSupabaseAdmin, createAuthClient } from '../../../../lib/supabaseAdmin';
import { getCurrentOwner, PASSWORD_MIN_LENGTH } from '../../../../lib/owners';

// Changement du mot de passe depuis "Mon compte" : le mot de passe actuel est
// verifie avant d'enregistrer le nouveau.
export async function PUT(request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const actuel = String(body.actuel || '');
  const nouveau = String(body.nouveau || '');

  if (nouveau.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` },
      { status: 400 }
    );
  }

  const { error: signInError } = await createAuthClient().auth.signInWithPassword({
    email: owner.email,
    password: actuel
  });
  if (signInError) {
    return NextResponse.json({ error: 'Le mot de passe actuel est incorrect.' }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(owner.id, { password: nouveau });
  if (error) {
    return NextResponse.json({ error: 'Impossible de modifier le mot de passe.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
