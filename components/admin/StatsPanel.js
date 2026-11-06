'use client';

import { useEffect, useState } from 'react';
import StatTile from './charts/StatTile';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import SegmentedBar from './charts/SegmentedBar';
import StackedBars from './charts/StackedBars';
import StackedColumns from './charts/StackedColumns';
import Heatmap from './charts/Heatmap';
import Funnel from './charts/Funnel';
import { downloadCsv } from '../../lib/exportCsv';

// Couleurs des series (palette validee daltonisme) et des statuts.
const SOURCE_COLORS = { machinga: '#2a78d6', particulier: '#eb6834' };
const STATUS = {
  publiee: { color: '#0ca30c', label: 'Publiées' },
  en_attente: { color: '#fab219', textColor: '#0b0b0b', label: 'En attente' },
  refusee: { color: '#d03b3b', label: 'Refusées' }
};
const PERIODS = [
  [7, '7 jours'],
  [30, '30 jours'],
  [90, '90 jours']
];

function Section({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`border border-gray-200 bg-white p-6 ${className}`}>
      {title && <h4 className="text-sm font-semibold text-ink mb-4">{title}</h4>}
      {children}
    </div>
  );
}

function SourceBadge({ source }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[source] }} />
      {source === 'machinga' ? 'MACHINGA' : 'Particulier'}
    </span>
  );
}

const exportButton = 'text-sm px-4 py-2 border border-gray-300 hover:border-primary transition-colors';

export default function StatsPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    fetch(`/api/analytics?jours=${days}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur de chargement des statistiques');
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, [days]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Chargement des statistiques…</p>;

  const { audience, marketplace, enLigne } = data;
  const maxVues = Math.max(1, ...data.topListings.map((l) => l.vues));
  const stamp = new Date().toISOString().slice(0, 10);

  function exportVisits() {
    downloadCsv(`visites-${days}j-${stamp}.csv`, audience.visitesParJour, [
      { label: 'Date', value: (d) => d.date },
      { label: 'Visites', value: (d) => d.count }
    ]);
  }

  function exportTop() {
    downloadCsv(`annonces-consultees-${days}j-${stamp}.csv`, data.topListings, [
      { label: 'Annonce', value: (l) => l.titre },
      { label: 'Origine', value: (l) => (l.source === 'machinga' ? 'MACHINGA' : 'Particulier') },
      { label: 'Vues', value: (l) => l.vues },
      { label: 'Appels', value: (l) => l.appels }
    ]);
  }

  return (
    <div className="space-y-12">
      {/* Periode */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Chaque indicateur est comparé à la période précédente de même durée.
        </p>
        <div className="inline-flex border border-gray-300 rounded-sm overflow-hidden" role="group" aria-label="Période">
          {PERIODS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              aria-pressed={days === value}
              className={`px-4 py-2 text-sm border-r border-gray-300 last:border-r-0 transition-colors ${
                days === value ? 'bg-primary text-white' : 'bg-white hover:bg-offwhite'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <Section title="Audience du site" subtitle={`Sur les ${days} derniers jours`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Visiteurs uniques"
            value={audience.visiteurs}
            previous={audience.visiteursPrecedent}
            trend={audience.visiteursParJour}
          />
          <StatTile
            label="Pages vues"
            value={audience.visites}
            previous={audience.visitesPrecedent}
            trend={audience.visitesParJour.map((d) => d.count)}
          />
          <StatTile label="Fiches d'annonces consultées" value={audience.vuesFiches} hint="Vues des pages d'annonces" />
          <StatTile
            label="Appels aux annonceurs"
            value={audience.appels}
            previous={audience.appelsPrecedent}
            hint="Clics sur « Appeler l'annonceur »"
            trend={audience.appelsParJour}
          />
        </div>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-semibold text-ink">Pages vues par jour</h4>
            <button onClick={exportVisits} className={exportButton}>
              Exporter (CSV)
            </button>
          </div>
          <LineChart data={audience.visitesParJour} />
          <div className="h-6" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card title="Quand les visiteurs viennent-ils ?">
            <Heatmap grid={audience.affluence} unit="page vue" />
          </Card>
          <Card title="De la visite à l'appel">
            <Funnel
              steps={[
                { label: 'Visiteurs du site', value: audience.entonnoir.visiteurs },
                {
                  label: 'Ont consulté une annonce',
                  value: audience.entonnoir.visiteursFiches,
                  hint: 'Au moins une fiche ouverte'
                },
                {
                  label: 'Ont appelé un annonceur',
                  value: audience.entonnoir.appelants,
                  hint: 'Annonces de particuliers'
                }
              ]}
            />
          </Card>
        </div>
      </Section>

      {/* Marketplace */}
      <Section
        title="Marketplace : propriétaires particuliers"
        subtitle="Les résultats de la phase de test"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Nouveaux propriétaires"
            value={marketplace.nouveauxProprietaires}
            previous={marketplace.nouveauxProprietairesPrecedent}
          />
          <StatTile
            label="Annonces déposées"
            value={marketplace.annoncesDeposees}
            previous={marketplace.annoncesDeposeesPrecedent}
          />
          <StatTile
            label="Taux de validation"
            value={marketplace.tauxValidation}
            suffix=" %"
            hint="Publiées / (publiées + refusées)"
            meter={marketplace.tauxValidation !== null}
          />
          <StatTile
            label="À valider maintenant"
            value={marketplace.aValider}
            hint={`${marketplace.proprietairesTotal} propriétaire(s) inscrit(s) au total`}
          />
        </div>
        <Card title={`Devenir des annonces déposées sur ${days} jours`}>
          <SegmentedBar
            parts={['publiee', 'en_attente', 'refusee'].map((key) => ({
              label: STATUS[key].label,
              value: marketplace.parModeration[key],
              color: STATUS[key].color,
              textColor: STATUS[key].textColor
            }))}
            emptyLabel="Aucune annonce déposée par un propriétaire sur la période."
          />
        </Card>
      </Section>

      {/* Annonces ajoutees dans le temps */}
      <Section
        title="Annonces ajoutées"
        subtitle={`Par ${data.annoncesAjoutees.parPeriode}, selon leur origine`}
      >
        <Card>
          <StackedColumns
            rows={data.annoncesAjoutees.series}
            series={[
              { key: 'machinga', label: 'MACHINGA', color: SOURCE_COLORS.machinga },
              { key: 'particulier', label: 'Particuliers', color: SOURCE_COLORS.particulier }
            ]}
            emptyLabel="Aucune annonce ajoutée sur la période."
          />
        </Card>
      </Section>

      {/* Annonces en ligne */}
      <Section title="Annonces en ligne aujourd'hui" subtitle="Visibles par le public, par origine">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card title="Répartition par origine" className="lg:col-span-2">
            <SegmentedBar
              parts={[
                { label: 'MACHINGA', value: enLigne.machinga, color: SOURCE_COLORS.machinga },
                { label: 'Particuliers', value: enLigne.particulier, color: SOURCE_COLORS.particulier }
              ]}
              emptyLabel="Aucune annonce en ligne."
            />
            <p className="text-xs text-gray-400 mt-4">
              Dont {enLigne.ventes} vente(s), toutes publiées par MACHINGA.
            </p>
          </Card>
          <Card title="Locations par catégorie" className="lg:col-span-3">
            <StackedBars
              rows={enLigne.locationsParCategorie}
              series={[
                { key: 'machinga', label: 'MACHINGA', color: SOURCE_COLORS.machinga },
                { key: 'particulier', label: 'Particuliers', color: SOURCE_COLORS.particulier }
              ]}
              emptyLabel="Aucune location en ligne."
            />
          </Card>
        </div>
      </Section>

      {/* Annonces les plus consultees */}
      <Section
        title="Annonces les plus consultées"
        subtitle={`Top 10 sur ${days} jours`}
        action={
          data.topListings.length > 0 && (
            <button onClick={exportTop} className={exportButton}>
              Exporter (CSV)
            </button>
          )
        }
      >
        {data.topListings.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">Aucune annonce consultée sur la période.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-offwhite text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Annonce</th>
                  <th className="px-4 py-3 font-medium">Origine</th>
                  <th className="px-4 py-3 font-medium w-1/3">Vues</th>
                  <th className="px-4 py-3 font-medium text-right">Appels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topListings.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3">
                      <a href={`/annonces/${l.id}`} target="_blank" rel="noreferrer" className="text-ink hover:text-primary">
                        {l.titre}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={l.source} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-offwhite rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(l.vues / maxVues) * 100}%`, background: SOURCE_COLORS[l.source] }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums">{l.vues}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{l.source === 'particulier' ? l.appels : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Pages */}
      <Section title="Pages les plus visitées" subtitle="Hors fiches d'annonces">
        <Card>
          <BarChart data={data.topPages} mode="sequential" emptyLabel="Pas encore assez de visites." />
        </Card>
      </Section>
    </div>
  );
}
