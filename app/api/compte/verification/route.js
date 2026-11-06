import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getCurrentOwner, toOwnerDTO } from '../../../../lib/owners';
import { verifyEmailCode } from '../../../../lib/emailCodes';

// Confirme l'adresse e-mail du proprietaire connecte avec le code recu.
export async function POST(request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  if (owner.emailVerifie) return NextResponse.json(owner);

  const body = await request.json().catch(() => ({}));
  const result = await verifyEmailCode(owner.email, 'verification', body.code);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from('owners')
    .update({ email_verifie: true })
    .eq('id', owner.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toOwnerDTO(data));
}
