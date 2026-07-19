import { getSupabaseAdmin, toListingDTO } from './supabaseAdmin';

export async function getListings({ type, limit } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('listings').select('*').order('date_ajout', { ascending: false });

  if (type) query = query.eq('type', type);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Erreur Supabase (listings) :', error.message);
    return [];
  }
  return data.map(toListingDTO);
}

export async function getListingById(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Erreur Supabase (listing) :', error.message);
    }
    return null;
  }
  return toListingDTO(data);
}
