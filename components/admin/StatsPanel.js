'use client';

import { useEffect, useMemo, useState } from 'react';
import StatTile from './charts/StatTile';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { downloadCsv } from '../../lib/exportCsv';

const LOCATIONS_CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];
const VENTES_CATEGORIES = ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers'];

function countByCategory(listings, type, categories) {
  return categories.map((label) => ({
    label,
    value: listings.filter((l) => l.type === type && l.category === label).length
  }));
}

function Section({ title, action, children }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {action}
      </div>
      <div className="border border-gray-200 p-6">{children}</div>
    </section>
  );
}

export default function StatsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur de chargement des statistiques');
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, []);

  const last7 = useMemo(() => {
    if (!data) return 0;
    return data.viewsByDay.slice(-7).reduce((sum, d) => sum + d.count, 0);
  }, [data]);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error}. Assure-toi que la table <code>page_views</code> existe et a bien la colonne{' '}
        <code>visitor_id</code> (réexécute <code>supabase/schema.sql</code> dans le SQL Editor).
      </p>
    );
  }

  if (!data) {
    return <p className="text-gray-500">Chargement des statistiques…</p>;
  }

  const locationsCounts = countByCategory(data.listings, 'location', LOCATIONS_CATEGORIES);
  const ventesCounts = countByCategory(data.listings, 'vente', VENTES_CATEGORIES);

  function handleExportViews() {
    downloadCsv(`visites-${new Date().toISOString().slice(0, 10)}.csv`, data.viewsByDay, [
      { label: 'Date', value: (d) => d.date },
      { label: 'Visites', value: (d) => d.count }
    ]);
  }

  function handleExportListingViews() {
    downloadCsv(`vues-annonces-${new Date().toISOString().slice(0, 10)}.csv`, data.listingViews, [
      { label: 'Annonce', value: (d) => d.label },
      { label: 'Vues', value: (d) => d.value }
    ]);
  }

  return (
    <div className="space-y-12">
      {/* Visiteurs & volume de visites */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile label="Visiteurs uniques (30j)" value={data.uniqueVisitors} />
        <StatTile label="Visites (30 jours)" value={data.totalViews} />
        <StatTile label="Visites (7 jours)" value={last7} />
        <StatTile label="Annonces consultées" value={data.listingViews.length} />
      </div>

      {/* Nombre de visites (tendance) */}
      <Section
        title="Visites par jour (30 derniers jours)"
        action={
          <button
            onClick={handleExportViews}
            className="text-sm px-4 py-2 border border-gray-300 hover:border-primary transition-colors"
          >
            Exporter (CSV)
          </button>
        }
      >
        <LineChart data={data.viewsByDay} />
      </Section>

      {/* Pages visitées */}
      <Section title="Pages les plus visitées">
        <BarChart data={data.topPages} mode="sequential" emptyLabel="Pas encore assez de visites." />
      </Section>

      {/* Vues par annonce */}
      <Section
        title="Vues par annonce"
        action={
          data.listingViews.length > 0 && (
            <button
              onClick={handleExportListingViews}
              className="text-sm px-4 py-2 border border-gray-300 hover:border-primary transition-colors"
            >
              Exporter (CSV)
            </button>
          )
        }
      >
        <BarChart
          data={data.listingViews}
          mode="sequential"
          emptyLabel="Aucune annonce consultée pour le moment."
        />
      </Section>

      {/* Répartition des annonces publiées */}
      <div className="grid gap-8 md:grid-cols-2">
        <Section title="Locations par catégorie">
          <DoughnutChart data={locationsCounts} />
        </Section>
        <Section title="Ventes par catégorie">
          <DoughnutChart data={ventesCounts} />
        </Section>
      </div>
    </div>
  );
}
