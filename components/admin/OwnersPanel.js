'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { downloadCsv } from '../../lib/exportCsv';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

// Proprietaires inscrits (onglet "Proprietaires" du tableau de bord admin).
export default function OwnersPanel() {
  const [owners, setOwners] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/owners')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur de chargement');
        setOwners(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!owners) return <p className="text-gray-500">Chargement…</p>;

  const verified = owners.filter((o) => o.emailVerifie).length;
  const withListings = owners.filter((o) => o.annonces.total > 0).length;

  function handleExport() {
    downloadCsv(`proprietaires-${new Date().toISOString().slice(0, 10)}.csv`, owners, [
      { label: 'Nom', value: (o) => o.nom },
      { label: 'Téléphone', value: (o) => o.telephone },
      { label: 'Email', value: (o) => o.email },
      { label: 'Email vérifié', value: (o) => (o.emailVerifie ? 'Oui' : 'Non') },
      { label: 'Inscription', value: (o) => formatDate(o.dateInscription) },
      { label: 'Annonces', value: (o) => o.annonces.total },
      { label: 'Publiées', value: (o) => o.annonces.publiee },
      { label: 'À valider', value: (o) => o.annonces.en_attente },
      { label: 'Refusées', value: (o) => o.annonces.refusee }
    ]);
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <p className="text-sm text-gray-500">
          {owners.length} propriétaire(s) inscrit(s), {verified} avec e-mail vérifié, {withListings}{' '}
          ayant déposé au moins une annonce.
        </p>
        <button
          onClick={handleExport}
          disabled={owners.length === 0}
          className="px-5 py-2.5 text-sm font-medium border border-gray-300 hover:border-primary transition-colors disabled:opacity-50"
        >
          Exporter (CSV)
        </button>
      </div>

      {owners.length === 0 ? (
        <p className="text-gray-500">Aucun propriétaire inscrit pour le moment.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-offwhite text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Propriétaire</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium text-center">Annonces</th>
                <th className="px-4 py-3 font-medium text-center">Publiées</th>
                <th className="px-4 py-3 font-medium text-center">À valider</th>
                <th className="px-4 py-3 font-medium text-center">Refusées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {owners.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/admin/dashboard/proprietaires/${o.id}`} className="font-medium text-primary hover:underline">
                      {o.nom}
                    </Link>
                    <p className={`text-xs mt-0.5 ${o.emailVerifie ? 'text-green-700' : 'text-amber-700'}`}>
                      {o.emailVerifie ? 'E-mail vérifié' : 'E-mail non vérifié'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${o.telephone.replace(/[^\d+]/g, '')}`} className="block text-ink hover:text-primary">
                      {o.telephone}
                    </a>
                    <a href={`mailto:${o.email}`} className="block text-gray-500 hover:text-primary">
                      {o.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(o.dateInscription)}</td>
                  <td className="px-4 py-3 text-center font-medium">{o.annonces.total}</td>
                  <td className="px-4 py-3 text-center text-green-700">{o.annonces.publiee}</td>
                  <td className="px-4 py-3 text-center text-amber-700">{o.annonces.en_attente}</td>
                  <td className="px-4 py-3 text-center text-red-700">{o.annonces.refusee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
