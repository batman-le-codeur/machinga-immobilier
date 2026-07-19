'use client';

import { useState } from 'react';
import Image from 'next/image';
import ListingForm from './ListingForm';
import { downloadCsv } from '../../lib/exportCsv';

function formatPrice(prix, type) {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} FCFA/mois` : `${formatted} FCFA`;
}

const STATUT_LABEL = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  loue_vendu: 'Loué / Vendu'
};

export default function ListingsManager({ listings, setListings }) {
  const [mode, setMode] = useState('list'); // list | create | edit
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function handleSaved(listing) {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      return exists ? prev.map((l) => (l.id === listing.id ? listing : l)) : [listing, ...prev];
    });
    setMode('list');
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
    setDeletingId(null);
  }

  function handleExport() {
    downloadCsv(
      `annonces-${new Date().toISOString().slice(0, 10)}.csv`,
      listings,
      [
        { label: 'Titre', value: (l) => l.titre },
        { label: 'Type', value: (l) => (l.type === 'location' ? 'Location' : 'Vente') },
        { label: 'Catégorie', value: (l) => l.category },
        { label: 'Prix (FCFA)', value: (l) => l.prix },
        { label: 'Localisation', value: (l) => l.localisation },
        { label: 'Surface (m²)', value: (l) => l.surface || '' },
        { label: 'Chambres', value: (l) => l.chambres || '' },
        { label: 'Salles de bain', value: (l) => l.sallesDeBain || '' },
        { label: 'Statut', value: (l) => STATUT_LABEL[l.statut] || l.statut },
        { label: 'Date ajout', value: (l) => new Date(l.dateAjout).toLocaleDateString('fr-FR') }
      ]
    );
  }

  if (mode === 'create') {
    return <ListingForm onSaved={handleSaved} onCancel={() => setMode('list')} />;
  }
  if (mode === 'edit' && editing) {
    return <ListingForm initial={editing} onSaved={handleSaved} onCancel={() => setMode('list')} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{listings.length} annonce(s)</p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={listings.length === 0}
            className="px-5 py-2.5 text-sm font-medium border border-gray-300 hover:border-primary transition-colors disabled:opacity-50"
          >
            Exporter (CSV)
          </button>
          <button
            onClick={() => setMode('create')}
            className="bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-light transition-colors"
          >
            + Nouvelle annonce
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500">Aucune annonce pour le moment.</p>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200">
          {listings.map((l) => (
            <div key={l.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="relative w-16 h-16 bg-offwhite shrink-0 border border-gray-200 overflow-hidden">
                {l.photos && l.photos[0] ? (
                  <Image src={l.photos[0]} alt="" fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-ink">{l.titre}</p>
                <p className="text-sm text-gray-500">
                  {l.type === 'location' ? 'Location' : 'Vente'} - {l.category} - {l.localisation}
                </p>
              </div>
              <div className="text-sm text-primary font-medium">{formatPrice(l.prix, l.type)}</div>
              <div className="text-xs px-2 py-1 bg-offwhite border border-gray-200 text-gray-600">
                {STATUT_LABEL[l.statut] || l.statut}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(l);
                    setMode('edit');
                  }}
                  className="text-sm px-3 py-1.5 border border-gray-300 hover:border-primary transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  disabled={deletingId === l.id}
                  className="text-sm px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {deletingId === l.id ? '…' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
