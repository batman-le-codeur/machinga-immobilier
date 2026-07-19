import { getSupabaseAdmin } from './supabaseAdmin';

const DAYS = 30;

export async function recordPageView({ path, referrer, visitorId }) {
  const supabase = getSupabaseAdmin();
  await supabase.from('page_views').insert({
    path: String(path || '/').slice(0, 300),
    referrer: referrer ? String(referrer).slice(0, 300) : null,
    visitor_id: visitorId ? String(visitorId).slice(0, 100) : null
  });
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function getAnalytics() {
  const supabase = getSupabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const { data: views, error } = await supabase
    .from('page_views')
    .select('path, visitor_id, created_at')
    .gte('created_at', since.toISOString());

  if (error) throw error;

  const byDay = new Map();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    byDay.set(dayKey(d), 0);
  }
  const byPath = new Map();
  const visitors = new Set();

  for (const v of views) {
    const key = dayKey(new Date(v.created_at));
    if (byDay.has(key)) byDay.set(key, byDay.get(key) + 1);
    byPath.set(v.path, (byPath.get(v.path) || 0) + 1);
    if (v.visitor_id) visitors.add(v.visitor_id);
  }

  const viewsByDay = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
  const pageCounts = Array.from(byPath.entries()).map(([path, count]) => ({ path, count }));

  return {
    totalViews: views.length,
    uniqueVisitors: visitors.size,
    viewsByDay,
    pageCounts
  };
}
