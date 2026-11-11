// Helpers serveur pour l'espace proprietaire (routes API et pages serveur).
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from './supabaseAdmin';
import { normalizePeriode, normalizePeriodeNombre } from './price';
import { OWNER_COOKIE, getOwnerIdFromToken } from './ownerAuth';

// Les proprietaires ne publient que des locations (les ventes restent
// reservees a MACHINGA).
export const OWNER_CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];

// Duree de mise en ligne d'une annonce de proprietaire avant qu'elle soit
// masquee (renouvelable en un clic depuis "Mes annonces").
export const LISTING_LIFETIME_DAYS = 60;

export function listingExpiryFromNow() {
  return new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

// Nombre maximum d'annonces qu'un proprietaire peut deposer par 24 h.
export const DAILY_LISTING_LIMIT = Number(process.env.OWNER_DAILY_LISTING_LIMIT) || 5;

export function toOwnerDTO(row) {
  return {
    id: row.id,
    nom: row.nom,
    telephone: row.telephone,
    email: row.email,
    emailVerifie: Boolean(row.email_verifie),
    dateInscription: row.date_inscription
  };
}

// Proprietaire connecte (d'apres le cookie de session), ou null.
export async function getCurrentOwner() {
  const ownerId = await getOwnerIdFromToken(cookies().get(OWNER_COOKIE)?.value);
  if (!ownerId) return null;

  const { data, error } = await getSupabaseAdmin()
    .from('owners')
    .select('*')
    .eq('id', ownerId)
    .maybeSingle();

  if (error || !data) return null;
  return toOwnerDTO(data);
}

// --- Validation des saisies ---

export function cleanText(value, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

export function normalizeEmail(value) {
  return cleanText(value, 254).toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Numero gabonais ou international : chiffres, espaces, +, -, points ;
// au moins 8 chiffres.
export function normalizePhone(value) {
  return cleanText(value, 30).replace(/\s+/g, ' ');
}

export function isValidPhone(phone) {
  return /^[+\d][\d\s.-]*$/.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

export const PASSWORD_MIN_LENGTH = 8;

// URL publique du site, pour les liens envoyes par email. En local on prend
// l'origine de la requete ; en production le domaine configure.
export function siteUrl(request) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return request.nextUrl.origin;
}

const STATUTS = ['disponible', 'reserve', 'loue_vendu'];

function toIntOrNull(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Valide et normalise une annonce saisie par un proprietaire. Le type est
// toujours "location". Renvoie { row } ou { error }.
export function parseOwnerListing(body) {
  const titre = cleanText(body.titre, 120);
  const category = cleanText(body.category, 60);
  const ville = cleanText(body.ville, 60);
  const quartier = cleanText(body.quartier, 80);
  const prix = Number(body.prix);
  const statut = STATUTS.includes(body.statut) ? body.statut : 'disponible';
  // Seules les photos envoyees via /api/upload (stockage du site) sont acceptees.
  const photoPrefix = `${String(process.env.SUPABASE_URL || '').replace(/\/$/, '')}/storage/v1/object/public/photos/`;
  const photos = Array.isArray(body.photos)
    ? body.photos.filter((p) => typeof p === 'string' && p.startsWith(photoPrefix)).slice(0, 15)
    : [];

  if (!titre) return { error: 'Le titre est obligatoire.' };
  if (!OWNER_CATEGORIES.includes(category)) return { error: 'Catégorie invalide.' };
  if (!Number.isFinite(prix) || prix <= 0) return { error: 'Le loyer est obligatoire.' };
  if (!ville) return { error: 'La ville est obligatoire.' };
  if (!quartier) return { error: 'Le quartier est obligatoire.' };

  const surface = Number(body.surface);

  return {
    row: {
      type: 'location',
      category,
      titre,
      prix: Math.round(prix),
      periode: normalizePeriode(body.periode),
      periode_nombre: normalizePeriodeNombre(body.periodeNombre),
      ville,
      quartier,
      localisation: `${quartier}, ${ville}`,
      surface: Number.isFinite(surface) && surface > 0 ? surface : null,
      chambres: toIntOrNull(body.chambres),
      salles_de_bain: toIntOrNull(body.sallesDeBain),
      description: cleanText(body.description, 3000),
      photos,
      statut
    }
  };
}
