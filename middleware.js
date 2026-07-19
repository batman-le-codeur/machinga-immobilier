import { NextResponse } from 'next/server';
import { SESSION_COOKIE, isValidSessionToken } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);

  const { pathname } = request.nextUrl;
  const isWriteApi =
    pathname.startsWith('/api/listings') && request.method !== 'GET';
  const isUploadApi = pathname.startsWith('/api/upload');
  const isMessagesApi = pathname.startsWith('/api/messages');
  const isAnalyticsApi = pathname.startsWith('/api/analytics');
  const isDashboard = pathname.startsWith('/admin/dashboard');

  if ((isWriteApi || isUploadApi || isMessagesApi || isAnalyticsApi) && !authed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
    '/api/analytics/:path*'
  ]
};
