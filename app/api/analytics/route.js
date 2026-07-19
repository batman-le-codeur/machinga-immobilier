import { NextResponse } from 'next/server';
import { getAnalytics } from '../../../lib/analytics';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

function pathWithoutQuery(path) {
  return path.split('?')[0];
}

export async function GET() {
  try {
    const analytics = await getAnalytics();
    const supabase = getSupabaseAdmin();
    const [{ data: listings }, { data: messages }] = await Promise.all([
      supabase.from('listings').select('id, titre, type, category'),
      supabase.from('messages').select('date_envoi')
    ]);

    const byCleanPath = new Map();
    for (const { path, count } of analytics.pageCounts) {
      const clean = pathWithoutQuery(path);
      byCleanPath.set(clean, (byCleanPath.get(clean) || 0) + count);
    }

    const listingViews = (listings || [])
      .map((l) => ({ label: l.titre, value: byCleanPath.get(`/annonces/${l.id}`) || 0 }))
      .filter((l) => l.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const topPages = Array.from(byCleanPath.entries())
      .filter(([path]) => !path.startsWith('/annonces/'))
      .map(([path, count]) => ({ label: path, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return NextResponse.json({
      totalViews: analytics.totalViews,
      uniqueVisitors: analytics.uniqueVisitors,
      viewsByDay: analytics.viewsByDay,
      topPages,
      listingViews,
      listings: listings || [],
      messages: messages || []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
