import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { toOwnerDTO } from '../../../lib/owners';

// Liste des proprietaires inscrits, avec le nombre de leurs annonces par
// statut (admin uniquement : route protegee par le middleware).
export async function GET() {
  const supabase = getSupabaseAdmin();
  const [{ data: owners, error }, { data: listings, error: listingsError }] = await Promise.all([
    supabase.from('owners').select('*').order('date_inscription', { ascending: false }),
    supabase.from('listings').select('owner_id, moderation').not('owner_id', 'is', null)
  ]);

  if (error || listingsError) {
    return NextResponse.json({ error: (error || listingsError).message }, { status: 500 });
  }

  const counts = {};
  for (const l of listings) {
    const c = (counts[l.owner_id] ||= { total: 0, publiee: 0, en_attente: 0, refusee: 0 });
    c.total += 1;
    c[l.moderation] = (c[l.moderation] || 0) + 1;
  }

  return NextResponse.json(
    owners.map((o) => ({
      ...toOwnerDTO(o),
      annonces: counts[o.id] || { total: 0, publiee: 0, en_attente: 0, refusee: 0 }
    }))
  );
}
