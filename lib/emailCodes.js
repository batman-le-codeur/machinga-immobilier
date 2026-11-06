// Codes a 6 chiffres envoyes par e-mail (verification de l'adresse,
// mot de passe oublie). Serveur uniquement (module crypto de Node).
import crypto from 'crypto';
import { getSupabaseAdmin } from './supabaseAdmin';

export const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_DELAY_SECONDS = 60;

function hashCode(email, purpose, code) {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(`${purpose}:${email}:${code}`).digest('hex');
}

// Cree un nouveau code (et invalide le precedent). Renvoie { code } ou
// { error: 'trop_tot', retryIn } si un code a ete envoye il y a moins d'une minute.
export async function createEmailCode(email, purpose) {
  const supabase = getSupabaseAdmin();

  const { data: last } = await supabase
    .from('email_codes')
    .select('created_at')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    const elapsed = (Date.now() - new Date(last.created_at).getTime()) / 1000;
    if (elapsed < RESEND_DELAY_SECONDS) {
      return { error: 'trop_tot', retryIn: Math.ceil(RESEND_DELAY_SECONDS - elapsed) };
    }
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await supabase.from('email_codes').delete().eq('email', email).eq('purpose', purpose);
  const { error } = await supabase.from('email_codes').insert({
    email,
    purpose,
    code_hash: hashCode(email, purpose, code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString()
  });
  if (error) throw new Error(error.message);

  return { code };
}

// Verifie un code saisi. Renvoie { ok: true } (le code est alors consomme)
// ou { error } avec un message pret a afficher.
export async function verifyEmailCode(email, purpose, code) {
  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('email_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const expired = !row || new Date(row.expires_at).getTime() < Date.now() || row.attempts >= MAX_ATTEMPTS;
  if (expired) {
    return { error: 'Ce code a expiré ou n’est plus valable. Demandez un nouveau code.' };
  }

  const expected = Buffer.from(row.code_hash, 'hex');
  const given = Buffer.from(hashCode(email, purpose, String(code || '').trim()), 'hex');
  if (!crypto.timingSafeEqual(expected, given)) {
    const attempts = row.attempts + 1;
    await supabase.from('email_codes').update({ attempts }).eq('id', row.id);
    const left = MAX_ATTEMPTS - attempts;
    return {
      error:
        left > 0
          ? `Code incorrect. Il vous reste ${left} essai${left > 1 ? 's' : ''}.`
          : 'Code incorrect. Trop d’essais : demandez un nouveau code.'
    };
  }

  await supabase.from('email_codes').delete().eq('email', email).eq('purpose', purpose);
  return { ok: true };
}
