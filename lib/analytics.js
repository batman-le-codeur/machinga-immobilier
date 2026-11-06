import { getSupabaseAdmin } from './supabaseAdmin';

export async function recordPageView({ path, referrer, visitorId }) {
  const supabase = getSupabaseAdmin();
  await supabase.from('page_views').insert({
    path: String(path || '/').slice(0, 300),
    referrer: referrer ? String(referrer).slice(0, 300) : null,
    visitor_id: visitorId ? String(visitorId).slice(0, 100) : null
  });
}

export async function recordListingEvent({ listingId, type, visitorId }) {
  if (!/^[0-9a-f-]{36}$/i.test(String(listingId || ''))) return;
  await getSupabaseAdmin().from('listing_events').insert({
    listing_id: listingId,
    type,
    visitor_id: visitorId ? String(visitorId).slice(0, 100) : null
  });
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

// Jour de la semaine (0 = lundi) et heure, a l'heure de Libreville.
const LOCAL_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Libreville',
  weekday: 'short',
  hour: '2-digit',
  hourCycle: 'h23'
});
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function localSlot(date) {
  const parts = Object.fromEntries(LOCAL_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return [WEEKDAYS.indexOf(parts.weekday), Number(parts.hour)];
}

// Supabase renvoie au plus 1000 lignes par requete : on pagine pour ne rien
// perdre sur les longues periodes.
async function fetchAll(buildQuery) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await buildQuery().range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

// Visites sur `days` jours, et sur les `days` jours precedents (comparaison).
export async function getAnalytics(days = 30) {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  const start = new Date(now - days * 86400000);
  const previousStart = new Date(now - 2 * days * 86400000);

  const views = await fetchAll(() =>
    supabase
      .from('page_views')
      .select('path, visitor_id, created_at')
      .gte('created_at', previousStart.toISOString())
      .order('created_at', { ascending: true })
  );

  const byDay = new Map();
  const visitorsByDay = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(new Date(now - i * 86400000));
    byDay.set(key, 0);
    visitorsByDay.set(key, new Set());
  }

  const byPath = new Map();
  const visitors = new Set();
  const listingVisitors = new Set();
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  const previousVisitors = new Set();
  let total = 0;
  let previousTotal = 0;

  for (const v of views) {
    const at = new Date(v.created_at);
    if (at < start) {
      previousTotal += 1;
      if (v.visitor_id) previousVisitors.add(v.visitor_id);
      continue;
    }
    total += 1;
    const key = dayKey(at);
    if (byDay.has(key)) byDay.set(key, byDay.get(key) + 1);
    if (v.visitor_id && visitorsByDay.has(key)) visitorsByDay.get(key).add(v.visitor_id);
    const clean = v.path.split('?')[0];
    byPath.set(clean, (byPath.get(clean) || 0) + 1);
    if (v.visitor_id) visitors.add(v.visitor_id);
    if (v.visitor_id && clean.startsWith('/annonces/')) listingVisitors.add(v.visitor_id);
    const [weekday, hour] = localSlot(at);
    if (weekday >= 0) heatmap[weekday][hour] += 1;
  }

  return {
    start,
    previousStart,
    totalViews: total,
    previousTotalViews: previousTotal,
    uniqueVisitors: visitors.size,
    previousUniqueVisitors: previousVisitors.size,
    viewsByDay: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
    visitorsByDay: Array.from(visitorsByDay.values()).map((set) => set.size),
    listingVisitors: listingVisitors.size,
    heatmap,
    pageCounts: Array.from(byPath.entries()).map(([path, count]) => ({ path, count }))
  };
}

export async function getListingEvents(since) {
  return fetchAll(() =>
    getSupabaseAdmin()
      .from('listing_events')
      .select('listing_id, type, visitor_id, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
  );
}
