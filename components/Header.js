import { cookies } from 'next/headers';
import { SESSION_COOKIE, isValidSessionToken } from '../lib/auth';
import { OWNER_COOKIE, getOwnerIdFromToken } from '../lib/ownerAuth';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);
  const ownerAuthed = Boolean(await getOwnerIdFromToken(cookies().get(OWNER_COOKIE)?.value));

  return <HeaderClient authed={authed} ownerAuthed={ownerAuthed} />;
}
