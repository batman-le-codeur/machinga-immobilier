import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO } from '../../../../lib/supabaseAdmin';
import { getCurrentOwner, parseOwnerListing, DAILY_LISTING_LIMIT, siteUrl } from '../../../../lib/owners';
import { sendMail, listingPendingAdminEmail } from '../../../../lib/mailer';

// Annonces du proprietaire connecte (tous statuts de moderation).
export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .select('*')
    .eq('owner_id', owner.id)
    .order('date_ajout', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toListingDTO));
}

// Depot d'une nouvelle annonce : toujours mise en attente de validation.
export async function POST(request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  if (!owner.emailVerifie) {
    return NextResponse.json(
      { error: 'Confirmez d’abord votre adresse e-mail avec le code reçu.' },
      { status: 403 }
    );
  }

  const { row, error: validationError } = parseOwnerListing(await request.json().catch(() => ({})));
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', owner.id)
    .gte('date_ajout', since);

  if ((count || 0) >= DAILY_LISTING_LIMIT) {
    return NextResponse.json(
      {
        error: `Vous avez atteint la limite de ${DAILY_LISTING_LIMIT} annonces par 24 heures. Réessayez plus tard.`
      },
      { status: 429 }
    );
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({ ...row, owner_id: owner.id, moderation: 'en_attente' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const adminEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      ...listingPendingAdminEmail({
        titre: data.titre,
        ownerNom: owner.nom,
        ownerTelephone: owner.telephone,
        link: `${siteUrl(request)}/admin/dashboard`
      })
    });
  }

  return NextResponse.json(toListingDTO(data), { status: 201 });
}
