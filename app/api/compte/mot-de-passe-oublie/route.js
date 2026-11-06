import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { normalizeEmail, isValidEmail } from '../../../../lib/owners';
import { createEmailCode } from '../../../../lib/emailCodes';
import { sendMail, resetCodeEmail } from '../../../../lib/mailer';

// Envoie un code de reinitialisation. Repond toujours "ok" (sauf email mal
// forme ou demande trop rapprochee), que le compte existe ou non, pour ne pas
// reveler quelles adresses sont inscrites.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  const { data: owner } = await getSupabaseAdmin()
    .from('owners')
    .select('nom')
    .eq('email', email)
    .maybeSingle();

  if (owner) {
    const result = await createEmailCode(email, 'reinitialisation');
    if (result.error) {
      return NextResponse.json(
        { error: `Patientez ${result.retryIn} s avant de demander un nouveau code.` },
        { status: 429 }
      );
    }
    await sendMail({ to: email, ...resetCodeEmail({ nom: owner.nom, code: result.code }) });
  }

  return NextResponse.json({ ok: true });
}
