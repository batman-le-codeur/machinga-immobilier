import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO, fromListingInput } from '../../../lib/supabaseAdmin';
import { SESSION_COOKIE, isValidSessionToken } from '../../../lib/auth';
import { onlyVisible } from '../../../lib/publicData';

// Public : uniquement les annonces validees. Admin : toutes les annonces,
// avec les coordonnees du proprietaire pour celles deposees par un particulier.
export async function GET(request) {
  const isAdmin = await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('listings')
    .select(isAdmin ? '*, owner:owners(nom, telephone, email)' : '*')
    .order('date_ajout', { ascending: false });

  if (!isAdmin) query = onlyVisible(query);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data.map(toListingDTO));
}

// Creation par l'admin : publiee directement, sans validation.
export async function POST(request) {
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const row = {
    ...fromListingInput(body),
    type: body.type || 'location',
    category: body.category || '',
    titre: body.titre || '',
    prix: Number(body.prix) || 0,
    localisation: body.localisation || '',
    photos: Array.isArray(body.photos) ? body.photos : [],
    statut: body.statut || 'disponible',
    moderation: 'publiee'
  };

  const { data, error } = await supabase.from('listings').insert(row).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toListingDTO(data), { status: 201 });
}
