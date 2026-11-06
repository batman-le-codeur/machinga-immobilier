import { NextResponse } from 'next/server';
import { getSupabaseAdmin, createAuthClient } from '../../../../lib/supabaseAdmin';
import { OWNER_COOKIE, createOwnerToken, ownerCookieOptions } from '../../../../lib/ownerAuth';
import { normalizeEmail, toOwnerDTO } from '../../../../lib/owners';

const INVALID = 'Adresse e-mail ou mot de passe incorrect.';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  // Seuls les utilisateurs ayant une fiche proprietaire peuvent se connecter ici.
  const { data: owner } = await getSupabaseAdmin()
    .from('owners')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!owner) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const response = NextResponse.json(toOwnerDTO(owner));
  response.cookies.set(OWNER_COOKIE, await createOwnerToken(owner.id), ownerCookieOptions());
  return response;
}
