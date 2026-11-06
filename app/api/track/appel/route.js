import { NextResponse } from 'next/server';
import { recordListingEvent } from '../../../../lib/analytics';

// Clic sur "Appeler l'annonceur" (statistiques admin uniquement).
export async function POST(request) {
  try {
    const body = await request.json();
    await recordListingEvent({ listingId: body.listingId, type: 'appel', visitorId: body.visitorId });
  } catch {
    // Le suivi ne doit jamais empecher l'appel du visiteur
  }
  return NextResponse.json({ ok: true });
}
