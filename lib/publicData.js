import { getSupabaseAdmin, toListingDTO } from './supabaseAdmin';
import { PERIODES } from './price';

// Annonces visibles du public : validees, et pour celles des proprietaires,
// pas encore expirees (les annonces MACHINGA n'expirent pas).
export function onlyVisible(query) {
  return query
    .eq('moderation', 'publiee')
    .or(`owner_id.is.null,expire_le.gt.${new Date().toISOString()}`);
}

// Seules les annonces validees sont visibles du public.
export async function getListings({ type, source, limit } = {}) {
  const supabase = getSupabaseAdmin();
  let query = onlyVisible(supabase.from('listings').select('*')).order('date_ajout', {
    ascending: false
  });

  if (type) query = query.eq('type', type);
  if (source) query = query.eq('source', source);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Erreur Supabase (listings) :', error.message);
    return [];
  }
  return data.map(toListingDTO);
}

// Nombre d'annonces visibles du public (chiffre affiche sur l'accueil).
export async function countVisibleListings() {
  const { count, error } = await onlyVisible(
    getSupabaseAdmin().from('listings').select('id', { count: 'exact', head: true })
  );
  if (error) {
    console.error('Erreur Supabase (comptage) :', error.message);
    return 0;
  }
  return count || 0;
}

export const PAGE_SIZE = 12;

function toPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Tris proposes (libelles dans components/ListingSearch.js).
const SORT_KEYS = ['pertinence', 'recentes', 'prix_asc', 'prix_desc'];

// Lit les filtres de recherche depuis les parametres d'URL (searchParams
// d'une page). Les memes noms sont utilises par components/ListingSearch.js.
export function parseSearchFilters(searchParams = {}) {
  const get = (key) => (Array.isArray(searchParams[key]) ? searchParams[key][0] : searchParams[key]);
  return {
    cat: get('cat') || '',
    source: ['machinga', 'particulier'].includes(get('source')) ? get('source') : '',
    tri: SORT_KEYS.includes(get('tri')) ? get('tri') : 'pertinence',
    // q : recherche libre ; "lieu" est l'ancien nom du parametre (liens deja partages).
    q: String(get('q') || get('lieu') || '').trim().slice(0, 80),
    prixMin: toPositiveNumber(get('prixMin')),
    prixMax: toPositiveNumber(get('prixMax')),
    chambres: toPositiveNumber(get('chambres')),
    periode: PERIODES.some((p) => p.value === get('periode')) ? get('periode') : '',
    page: Math.max(1, parseInt(get('page'), 10) || 1)
  };
}

// Recherche multicritere paginee sur les annonces publiees d'un type donne.
export async function searchListings(type, filters) {
  const supabase = getSupabaseAdmin();
  const from = (filters.page - 1) * PAGE_SIZE;

  let query = onlyVisible(supabase.from('listings').select('*', { count: 'exact' })).eq('type', type);

  // Par defaut, les annonces certifiees MACHINGA passent en premier
  // ('machinga' < 'particulier'), puis les plus recentes.
  if (filters.tri === 'pertinence') query = query.order('source', { ascending: true });
  if (filters.tri === 'prix_asc') query = query.order('prix', { ascending: true });
  if (filters.tri === 'prix_desc') query = query.order('prix', { ascending: false });
  query = query.order('date_ajout', { ascending: false }).range(from, from + PAGE_SIZE - 1);

  if (filters.source) query = query.eq('source', filters.source);
  if (filters.cat) query = query.eq('category', filters.cat);
  if (filters.prixMin) query = query.gte('prix', filters.prixMin);
  if (filters.prixMax) query = query.lte('prix', filters.prixMax);
  if (filters.chambres) query = query.gte('chambres', filters.chambres);
  if (filters.periode) query = query.eq('periode', filters.periode);
  // Recherche libre : chaque mot doit apparaitre dans le titre, la ville, le
  // quartier, la localisation, la categorie ou la description. Les caracteres
  // speciaux de la syntaxe PostgREST sont retires.
  const words = filters.q
    .replace(/[%_,.()*\\"':]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .slice(0, 5);
  for (const w of words) {
    query = query.or(
      ['titre', 'ville', 'quartier', 'localisation', 'category', 'description'].map((f) => `${f}.ilike.%${w}%`).join(',')
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('Erreur Supabase (recherche) :', error.message);
    return { listings: [], total: 0, pageCount: 1 };
  }
  return {
    listings: data.map(toListingDTO),
    total: count || 0,
    pageCount: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))
  };
}

// Fiche publique d'une annonce : uniquement si elle est validee. Inclut le
// nom et le telephone de l'annonceur pour les annonces de particuliers.
export async function getListingById(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await onlyVisible(
    supabase.from('listings').select('*, owner:owners(nom, telephone)').eq('id', id)
  ).maybeSingle();

  if (error) {
    // Un identifiant mal forme (pas un UUID) est une simple annonce introuvable.
    if (error.code !== '22P02') {
      console.error('Erreur Supabase (listing) :', error.message);
    }
    return null;
  }
  return data ? toListingDTO(data) : null;
}

// Annonces similaires a mettre en avant sous une fiche : meme type et meme
// categorie, les plus proches d'abord (meme quartier, puis meme ville, puis
// loyer / prix le plus proche).
export async function getSimilarListings(listing, limit = 3) {
  const { data, error } = await onlyVisible(
    getSupabaseAdmin()
      .from('listings')
      .select('*')
      .eq('type', listing.type)
      .eq('category', listing.category)
      .neq('id', listing.id)
  )
    .order('date_ajout', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Erreur Supabase (similaires) :', error.message);
    return [];
  }

  const norm = (v) => String(v || '').trim().toLowerCase();
  const score = (row) => {
    let s = 0;
    if (listing.quartier && norm(row.quartier) === norm(listing.quartier)) s += 4;
    if (listing.ville && norm(row.ville) === norm(listing.ville)) s += 2;
    if (!listing.ville && norm(row.localisation) === norm(listing.localisation)) s += 2;
    const gap = Math.abs(Number(row.prix) - Number(listing.prix)) / Math.max(Number(listing.prix), 1);
    return s - Math.min(gap, 1);
  };

  return data
    .map((row) => ({ row, s: score(row) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ row }) => toListingDTO(row));
}

// Annonce quel que soit son etat (en attente, refusee, expiree), pour
// l'apercu de l'admin ou de son proprietaire. Jamais servie au public :
// la page verifie les droits avant de l'afficher.
export async function getListingForPreview(id) {
  const { data, error } = await getSupabaseAdmin()
    .from('listings')
    .select('*, owner:owners(nom, telephone)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return toListingDTO(data);
}

// Autres annonces en ligne du meme proprietaire (fiche d'une annonce de particulier).
export async function getOwnerOtherListings(ownerId, excludeId, limit = 3) {
  const { data, error } = await onlyVisible(
    getSupabaseAdmin().from('listings').select('*').eq('owner_id', ownerId).neq('id', excludeId)
  )
    .order('date_ajout', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data.map(toListingDTO);
}

// Profil public d'un annonceur particulier : uniquement s'il a au moins une
// annonce en ligne (son numero n'est jamais expose sans annonce publiee).
export async function getPublicOwnerProfile(ownerId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(ownerId || ''))) return null;
  const supabase = getSupabaseAdmin();
  const [{ data: owner }, { data: rows }] = await Promise.all([
    supabase.from('owners').select('id, nom, telephone, email_verifie, date_inscription').eq('id', ownerId).maybeSingle(),
    onlyVisible(supabase.from('listings').select('*').eq('owner_id', ownerId)).order('date_ajout', { ascending: false })
  ]);
  if (!owner || !rows || rows.length === 0) return null;
  return {
    owner: {
      id: owner.id,
      nom: owner.nom,
      telephone: owner.telephone,
      emailVerifie: Boolean(owner.email_verifie),
      dateInscription: owner.date_inscription
    },
    listings: rows.map(toListingDTO)
  };
}
