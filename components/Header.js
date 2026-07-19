import { cookies } from 'next/headers';
import { SESSION_COOKIE, isValidSessionToken } from '../lib/auth';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);

  return <HeaderClient authed={authed} />;
}
