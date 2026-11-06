import { NextResponse } from 'next/server';
import { getSupabaseAdmin, createAuthClient } from '../../../../lib/supabaseAdmin';
import { OWNER_COOKIE, createOwnerToken, ownerCookieOptions } from '../../../../lib/ownerAuth';
import {
  cleanText,
  normalizeEmail,
  isValidEmail,
  normalizePhone,
  isValidPhone,
  PASSWORD_MIN_LENGTH,
  toOwnerDTO
} from '../../../../lib/owners';
import { createEmailCode } from '../../../../lib/emailCodes';
import { sendMail, verificationCodeEmail } from '../../../../lib/mailer';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const nom = cleanText(body.nom, 100);
  const email = normalizeEmail(body.email);
  const telephone = normalizePhone(body.telephone);
  const password = String(body.password || '');

  if (!nom) return NextResponse.json({ error: 'Le nom est obligatoire.' }, { status: 400 });
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }
  if (!isValidPhone(telephone)) {
    return NextResponse.json(
      { error: 'Numéro de téléphone invalide (au moins 8 chiffres).' },
      { status: 400 }
    );
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Cote Supabase Auth le compte est cree confirme : la verification de
  // l'adresse est faite par le site lui-meme, avec un code envoye par email
  // (owners.email_verifie), obligatoire avant de pouvoir publier.
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom, telephone, role: 'proprietaire' }
  });

  let userId = created?.user?.id;

  if (authError) {
    const exists = /already|registered|exists/i.test(authError.message);
    if (!exists) {
      // Typiquement un delai depasse : Supabase peut quand meme avoir cree le
      // compte en arriere-plan. Une nouvelle tentative le recuperera (ci-dessous).
      console.error('Inscription : erreur Supabase Auth :', authError.status, authError.message);
      return NextResponse.json(
        { error: 'Le service est momentanément surchargé. Réessayez dans quelques instants.' },
        { status: 503 }
      );
    }

    // L'adresse existe deja cote Supabase Auth. Si elle n'a pas de fiche
    // proprietaire (inscription interrompue) et que le mot de passe saisi est
    // le bon, on termine l'inscription au lieu de bloquer la personne.
    const { data: existingOwner } = await supabase
      .from('owners')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    const { data: signIn } = existingOwner
      ? { data: null }
      : await createAuthClient().auth.signInWithPassword({ email, password });

    if (!signIn?.user) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cette adresse e-mail.' }, { status: 409 });
    }
    userId = signIn.user.id;
  }

  const { data: owner, error: ownerError } = await supabase
    .from('owners')
    .insert({ id: userId, nom, telephone, email })
    .select()
    .single();

  if (ownerError) {
    console.error('Inscription : erreur fiche proprietaire :', ownerError.message);
    // On ne laisse pas un utilisateur Auth orphelin sans fiche proprietaire.
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Impossible de créer le compte pour le moment.' }, { status: 500 });
  }

  const { code } = await createEmailCode(email, 'verification');
  await sendMail({ to: email, ...verificationCodeEmail({ nom, code }) });

  const response = NextResponse.json(toOwnerDTO(owner), { status: 201 });
  response.cookies.set(OWNER_COOKIE, await createOwnerToken(userId), ownerCookieOptions());
  return response;
}
