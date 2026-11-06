import { NextResponse } from 'next/server';
import { getCurrentOwner } from '../../../../../lib/owners';
import { createEmailCode } from '../../../../../lib/emailCodes';
import { sendMail, verificationCodeEmail } from '../../../../../lib/mailer';

// Renvoie un code de verification au proprietaire connecte (1 par minute).
export async function POST() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  if (owner.emailVerifie) return NextResponse.json({ ok: true });

  const result = await createEmailCode(owner.email, 'verification');
  if (result.error) {
    return NextResponse.json(
      { error: `Patientez ${result.retryIn} s avant de demander un nouveau code.` },
      { status: 429 }
    );
  }

  await sendMail({ to: owner.email, ...verificationCodeEmail({ nom: owner.nom, code: result.code }) });
  return NextResponse.json({ ok: true });
}
