// Session des comptes proprietaires : cookie signe (HMAC) contenant l'id de
// l'utilisateur Supabase Auth. Web Crypto uniquement, utilisable dans le
// middleware (Edge Runtime). La cle est derivee de SESSION_SECRET mais
// distincte de celle de l'admin : un jeton proprietaire ne peut jamais etre
// accepte comme session admin, et inversement.
import { sign } from './auth';

const SECRET = `${process.env.SESSION_SECRET || 'dev-secret-change-me'}:owner`;
export const OWNER_COOKIE = 'machinga_owner_session';
export const OWNER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 jours

export async function createOwnerToken(userId) {
  const expiresAt = Date.now() + OWNER_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${await sign(payload, SECRET)}`;
}

// Renvoie l'id du proprietaire si le jeton est valide et non expire, sinon null.
export async function getOwnerIdFromToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expiresAt, signature] = parts;
  const expected = await sign(`${userId}.${expiresAt}`, SECRET);
  if (expected !== signature) return null;
  const exp = parseInt(expiresAt, 10);
  if (Number.isNaN(exp) || Date.now() > exp) return null;
  return userId;
}

export function ownerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: OWNER_MAX_AGE_SECONDS
  };
}
