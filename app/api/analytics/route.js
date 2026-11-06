import { NextResponse } from 'next/server';
import { getAnalytics, getListingEvents } from '../../../lib/analytics';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const PERIODS = [7, 30, 90];
const LOCATION_CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];

const inPeriod = (iso, from, to = new Date()) => {
  const t = new Date(iso);
  return t >= from && t < to;
};

// Statistiques du tableau de bord admin (route protegee par le middleware).
// ?jours=7|30|90 ; chaque indicateur est compare a la periode precedente.
export async function GET(request) {
  const requested = Number(request.nextUrl.searchParams.get('jours'));
  const days = PERIODS.includes(requested) ? requested : 30;

  try {
    const analytics = await getAnalytics(days);
    const { start, previousStart } = analytics;
    const supabase = getSupabaseAdmin();

    const [{ data: listings, error: lErr }, { data: owners, error: oErr }, { count: messages }, events] =
      await Promise.all([
        supabase
          .from('listings')
          .select('id, titre, type, category, source, moderation, statut, expire_le, date_ajout'),
        supabase.from('owners').select('id, date_inscription'),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .gte('date_envoi', start.toISOString()),
        getListingEvents(previousStart)
      ]);
    if (lErr || oErr) throw lErr || oErr;

    // --- Audience et contacts -------------------------------------------
    const listingViews = new Map();
    for (const { path, count } of analytics.pageCounts) {
      if (path.startsWith('/annonces/')) listingViews.set(path.slice('/annonces/'.length), count);
    }
    const calls = new Map();
    const callers = new Set();
    const callsByDay = new Map(analytics.viewsByDay.map((d) => [d.date, 0]));
    let callsTotal = 0;
    let previousCalls = 0;
    for (const e of events) {
      if (e.type !== 'appel') continue;
      if (new Date(e.created_at) < start) {
        previousCalls += 1;
      } else {
        callsTotal += 1;
        calls.set(e.listing_id, (calls.get(e.listing_id) || 0) + 1);
        callers.add(e.visitor_id || `anonyme-${callsTotal}`);
        const key = e.created_at.slice(0, 10);
        if (callsByDay.has(key)) callsByDay.set(key, callsByDay.get(key) + 1);
      }
    }

    const topListings = listings
      .map((l) => ({
        id: l.id,
        titre: l.titre,
        source: l.source,
        type: l.type,
        vues: listingViews.get(l.id) || 0,
        appels: calls.get(l.id) || 0
      }))
      .filter((l) => l.vues > 0 || l.appels > 0)
      .sort((a, b) => b.vues - a.vues || b.appels - a.appels)
      .slice(0, 10);

    const topPages = analytics.pageCounts
      .filter(({ path }) => !path.startsWith('/annonces/'))
      .map(({ path, count }) => ({ label: path, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // --- Marketplace : proprietaires et annonces de particuliers ---------
    const ownerListings = listings.filter((l) => l.source === 'particulier');
    const deposited = ownerListings.filter((l) => inPeriod(l.date_ajout, start));
    const previousDeposited = ownerListings.filter((l) => inPeriod(l.date_ajout, previousStart, start));
    const byModeration = { publiee: 0, en_attente: 0, refusee: 0 };
    for (const l of deposited) byModeration[l.moderation] += 1;
    const decided = byModeration.publiee + byModeration.refusee;

    // --- Annonces ajoutees dans le temps (par jour, ou par semaine sur 90 j)
    const bucketDays = days > 30 ? 7 : 1;
    const bucketCount = Math.ceil(days / bucketDays);
    const fmt = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'Africa/Libreville' });
    const added = Array.from({ length: bucketCount }, (_, i) => {
      const from = new Date(start.getTime() + i * bucketDays * 86400000);
      const to = new Date(Math.min(from.getTime() + bucketDays * 86400000, Date.now() + 1));
      const inBucket = listings.filter((l) => inPeriod(l.date_ajout, from, to));
      return {
        label: bucketDays === 1 ? fmt(from) : `Semaine du ${fmt(from)}`,
        short: fmt(from),
        machinga: inBucket.filter((l) => l.source === 'machinga').length,
        particulier: inBucket.filter((l) => l.source === 'particulier').length
      };
    });

    // --- Annonces visibles en ligne aujourd'hui --------------------------
    const nowIso = new Date().toISOString();
    const online = listings.filter(
      (l) => l.moderation === 'publiee' && (l.source === 'machinga' || (l.expire_le && l.expire_le > nowIso))
    );
    const onlineLocations = online.filter((l) => l.type === 'location');

    return NextResponse.json({
      jours: days,
      audience: {
        visiteurs: analytics.uniqueVisitors,
        visiteursPrecedent: analytics.previousUniqueVisitors,
        visites: analytics.totalViews,
        visitesPrecedent: analytics.previousTotalViews,
        vuesFiches: Array.from(listingViews.values()).reduce((a, b) => a + b, 0),
        appels: callsTotal,
        appelsPrecedent: previousCalls,
        messages: messages || 0,
        visitesParJour: analytics.viewsByDay,
        visiteursParJour: analytics.visitorsByDay,
        appelsParJour: Array.from(callsByDay.values()),
        affluence: analytics.heatmap,
        entonnoir: {
          visiteurs: analytics.uniqueVisitors,
          visiteursFiches: analytics.listingVisitors,
          appelants: callers.size
        }
      },
      annoncesAjoutees: { parPeriode: bucketDays === 1 ? 'jour' : 'semaine', series: added },
      marketplace: {
        nouveauxProprietaires: owners.filter((o) => inPeriod(o.date_inscription, start)).length,
        nouveauxProprietairesPrecedent: owners.filter((o) => inPeriod(o.date_inscription, previousStart, start))
          .length,
        proprietairesTotal: owners.length,
        annoncesDeposees: deposited.length,
        annoncesDeposeesPrecedent: previousDeposited.length,
        parModeration: byModeration,
        tauxValidation: decided > 0 ? Math.round((byModeration.publiee / decided) * 100) : null,
        aValider: ownerListings.filter((l) => l.moderation === 'en_attente').length
      },
      enLigne: {
        machinga: online.filter((l) => l.source === 'machinga').length,
        particulier: online.filter((l) => l.source === 'particulier').length,
        ventes: online.filter((l) => l.type === 'vente').length,
        locationsParCategorie: LOCATION_CATEGORIES.map((label) => ({
          label,
          machinga: onlineLocations.filter((l) => l.category === label && l.source === 'machinga').length,
          particulier: onlineLocations.filter((l) => l.category === label && l.source === 'particulier').length
        }))
      },
      topListings,
      topPages
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
