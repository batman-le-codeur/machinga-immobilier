import { NextResponse } from 'next/server';
import { SESSION_COOKIE, isValidSessionToken } from './lib/auth';
import { OWNER_COOKIE, getOwnerIdFromToken } from './lib/ownerAuth';

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);

  const { pathname } = request.nextUrl;
  const isWriteApi =
    pathname.startsWith('/api/listings') && request.method !== 'GET';
  const isUploadApi = pathname.startsWith('/api/upload');
  const isMessagesApi = pathname.startsWith('/api/messages');
  const isAnalyticsApi = pathname.startsWith('/api/analytics');
  const isOwnersApi = pathname.startsWith('/api/owners');
  const isDashboard = pathname.startsWith('/admin/dashboard');

  if ((isWriteApi || isMessagesApi || isAnalyticsApi || isOwnersApi) && !authed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // L'envoi de photos est ouvert aux proprietaires connectes, en plus de l'admin.
  if (isUploadApi && !authed) {
    const ownerId = await getOwnerIdFromToken(request.cookies.get(OWNER_COOKIE)?.value);
    if (!ownerId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  if (isDashboard && !authed) {
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/api/listings/:path*',
    '/api/upload/:path*',
    '/api/messages/:path*',
    '/api/analytics/:path*',
    '/api/owners/:path*'
  ]
};
