// Web Crypto API (compatible Edge Runtime, utilisé par le middleware.js)
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
export const SESSION_COOKIE = 'machinga_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 heures

export async function sign(value, secret = SECRET) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken() {
  const payload = String(Date.now() + MAX_AGE_SECONDS * 1000); // expiration en ms
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isValidSessionToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  const expected = await sign(payload);
  if (expected !== signature) return false;
  const expiresAt = parseInt(payload, 10);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
  return true;
}

export function checkCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@machinga-immobilier.ga';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
  return (
    String(email || '').trim().toLowerCase() === expectedEmail.toLowerCase() &&
    password === expectedPassword
  );
}
