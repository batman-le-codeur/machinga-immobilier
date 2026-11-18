import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo
const BUCKET = 'photos';

// Format reel d'apres les premiers octets du fichier : certains telephones
// envoient un type vide ou faux, on ne s'y fie donc pas.
function detectType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { type: 'image/png', ext: 'png' };
  const ascii = (from, to) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  return null;
}

function refuse(message, status, detail) {
  console.error(`Envoi de photo refuse : ${detail}`);
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || typeof file.arrayBuffer !== 'function') {
    return refuse('Aucune photo reçue. Réessayez.', 400, 'aucun fichier');
  }
  if (file.size > MAX_SIZE) {
    return refuse('Photo trop lourde (8 Mo maximum).', 400, `taille ${file.size}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectType(buffer);
  if (!detected) {
    return refuse(
      'Format de photo non pris en charge. Utilisez une photo JPEG ou PNG.',
      400,
      `format inconnu (type annonce "${file.type}", ${file.size} octets)`
    );
  }

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${detected.ext}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: detected.type,
    upsert: false
  });

  if (error) {
    console.error('Erreur Supabase (envoi photo) :', error.message);
    return NextResponse.json({ error: "L'envoi de la photo a échoué. Réessayez." }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
