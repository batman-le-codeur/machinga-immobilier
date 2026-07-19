import { createClient } from '@supabase/supabase-js';

// IMPORTANT : ce fichier n'est importé que dans des routes API / composants
// serveur. La clé "service role" ne doit JAMAIS être exposée au navigateur
// (pas de préfixe NEXT_PUBLIC_). Elle contourne le RLS, donc toutes les
// écritures passent uniquement par des routes API protégées par le
// middleware admin.

let client;

export function getSupabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local'
      );
    }

    client = createClient(url, key, {
      auth: { persistSession: false },
      // Next.js patches the global fetch() and, despite `dynamic = 'force-dynamic'`
      // on the pages, can still persist a stale cached response for requests made
      // deep inside a library like supabase-js. Force every Supabase request to
      // bypass that cache so new/edited listings show up immediately.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' })
      }
    });
  }
  return client;
}

// Convertit une ligne Supabase (snake_case) vers le format utilisé par le
// frontend (camelCase), et inversement.
export function toListingDTO(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    titre: row.titre,
    prix: row.prix,
    localisation: row.localisation,
    surface: row.surface,
    chambres: row.chambres,
    sallesDeBain: row.salles_de_bain,
    description: row.description,
    photos: row.photos || [],
    statut: row.statut,
    dateAjout: row.date_ajout
  };
}

export function fromListingInput(body) {
  return {
    type: body.type,
    category: body.category,
    titre: body.titre,
    prix: body.prix !== undefined ? Number(body.prix) : undefined,
    localisation: body.localisation,
    surface: body.surface !== undefined ? Number(body.surface) || null : undefined,
    chambres: body.chambres !== undefined ? Number(body.chambres) || null : undefined,
    salles_de_bain:
      body.sallesDeBain !== undefined ? Number(body.sallesDeBain) || null : undefined,
    description: body.description,
    photos: body.photos,
    statut: body.statut
  };
}
