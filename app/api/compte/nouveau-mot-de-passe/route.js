import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { OWNER_COOKIE, createOwnerToken, ownerCookieOptions } from '../../../../lib/ownerAuth';
import { normalizeEmail, PASSWORD_MIN_LENGTH } from '../../../../lib/owners';
import { verifyEmailCode } from '../../../../lib/emailCodes';

// Nouveau mot de passe a partir du code recu par email. Le proprietaire est
// ensuite connecte, et son adresse consideree comme verifiee.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` },
      { status: 400 }
    );
  }

  const result = await verifyEmailCode(email, 'reinitialisation', body.code);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: owner } = await supabase.from('owners').select('id').eq('email', email).maybeSingle();
  if (!owner) {
    return NextResponse.json({ error: 'Compte introuvable.' }, { status: 400 });
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(owner.id, { password });
  if (updateError) {
    return NextResponse.json({ error: 'Impossible de modifier le mot de passe.' }, { status: 500 });
  }
  await supabase.from('owners').update({ email_verifie: true }).eq('id', owner.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_COOKIE, await createOwnerToken(owner.id), ownerCookieOptions());
  return response;
}
