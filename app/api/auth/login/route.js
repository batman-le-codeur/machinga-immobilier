import { NextResponse } from 'next/server';
import { checkCredentials, createSessionToken, SESSION_COOKIE } from '../../../../lib/auth';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!checkCredentials(email, password)) {
    return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect' }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return response;
}
