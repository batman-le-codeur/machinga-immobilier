import { NextResponse } from 'next/server';
import { getSupabaseAdmin, createAuthClient } from '../../../lib/supabaseAdmin';
import { getCurrentOwner } from '../../../lib/owners';
import { OWNER_COOKIE } from '../../../lib/ownerAuth';

// Suppression du compte proprietaire par lui-meme (mot de passe exige).
// Supprimer l'utilisateur Supabase Auth supprime en cascade sa fiche
// proprietaire et toutes ses annonces.
export async function DELETE(request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { error: signInError } = await createAuthClient().auth.signInWithPassword({
    email: owner.email,
    password: String(body.password || '')
  });
  if (signInError) {
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().auth.admin.deleteUser(owner.id);
  if (error) {
    return NextResponse.json({ error: 'Impossible de supprimer le compte pour le moment.' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
