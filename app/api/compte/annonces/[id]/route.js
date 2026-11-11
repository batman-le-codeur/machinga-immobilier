import { NextResponse } from 'next/server';
import { getSupabaseAdmin, toListingDTO } from '../../../../../lib/supabaseAdmin';
import { getCurrentOwner, parseOwnerListing, listingExpiryFromNow } from '../../../../../lib/owners';

// Champs dont la modification renvoie l'annonce en validation. Changer
// uniquement le statut (disponible / reserve / loue) ne la depublie pas.
const CONTENT_FIELDS = [
  'category',
  'titre',
  'prix',
  'periode',
  'ville',
  'quartier',
  'surface',
  'chambres',
  'salles_de_bain',
  'description',
  'photos'
];

function sameValue(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a || []) === JSON.stringify(b || []);
  if (a === null || a === undefined || a === '') return b === null || b === undefined || b === '';
  return String(a) === String(b);
}

async function findOwnListing(ownerId, id) {
  const { data } = await getSupabaseAdmin()
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('owner_id', ownerId)
    .maybeSingle();
  return data;
}

export async function PUT(request, { params }) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const current = await findOwnListing(owner.id, params.id);
  if (!current) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

  const { row, error: validationError } = parseOwnerListing(await request.json().catch(() => ({})));
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const contentChanged = CONTENT_FIELDS.some((f) => !sameValue(current[f], row[f]));
  const updates = { ...row, date_modification: new Date().toISOString() };
  if (contentChanged) {
    updates.moderation = 'en_attente';
    updates.motif_refus = null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toListingDTO(data));
}

// Actions rapides depuis "Mes annonces", sans repasser en validation :
// { statut: 'loue_vendu' | 'disponible' | 'reserve' } ou { renouveler: true }.
export async function PATCH(request, { params }) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const current = await findOwnListing(owner.id, params.id);
  if (!current) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates = {};
  if (['disponible', 'reserve', 'loue_vendu'].includes(body.statut)) updates.statut = body.statut;
  if (body.renouveler) {
    if (current.moderation !== 'publiee') {
      return NextResponse.json({ error: 'Seule une annonce publiée peut être renouvelée.' }, { status: 400 });
    }
    updates.expire_le = listingExpiryFromNow();
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toListingDTO(data));
}

export async function DELETE(request, { params }) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .delete()
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
