import { NextResponse } from 'next/server';
import { recordPageView } from '../../../lib/analytics';

export async function POST(request) {
  try {
    const body = await request.json();
    await recordPageView(body);
  } catch {
    // Le suivi de navigation ne doit jamais faire échouer la navigation du visiteur
  }
  return NextResponse.json({ ok: true });
}
