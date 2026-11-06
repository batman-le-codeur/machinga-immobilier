import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO } from '../../../../../lib/supabaseAdmin';
import { siteUrl, listingExpiryFromNow } from '../../../../../lib/owners';
import { sendMail, listingPublishedEmail, listingRejectedEmail } from '../../../../../lib/mailer';

// Validation d'une annonce de proprietaire par l'admin (route protegee par
// le middleware : POST sous /api/listings).
// Corps : { action: 'publier' } ou { action: 'refuser', motif: '...' }
export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const action = body.action;
  const motif = String(body.motif || '').trim().slice(0, 500);

  if (action !== 'publier' && action !== 'refuser') {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }
  if (action === 'refuser' && !motif) {
    return NextResponse.json({ error: 'Le motif du refus est obligatoire.' }, { status: 400 });
  }

  const updates =
    action === 'publier'
      ? { moderation: 'publiee', motif_refus: null, expire_le: listingExpiryFromNow() }
      : { moderation: 'refusee', motif_refus: motif };

  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .select('*, owner:owners(nom, telephone, email)')
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  if (data.owner?.email) {
    const base = siteUrl(request);
    const email =
      action === 'publier'
        ? listingPublishedEmail({ nom: data.owner.nom, titre: data.titre, link: `${base}/annonces/${data.id}` })
        : listingRejectedEmail({ nom: data.owner.nom, titre: data.titre, motif, link: `${base}/compte` });
    await sendMail({ to: data.owner.email, ...email });
  }

  return NextResponse.json(toListingDTO(data));
}
