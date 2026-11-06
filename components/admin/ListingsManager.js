'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ListingForm from './ListingForm';
import RefusalForm from './RefusalForm';
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

const MODERATION = {
  en_attente: { label: 'À valider', className: 'bg-amber-50 border-amber-200 text-amber-800' },
  publiee: { label: 'Publiée', className: 'bg-green-50 border-green-200 text-green-800' },
  refusee: { label: 'Refusée', className: 'bg-red-50 border-red-200 text-red-700' }
};

function isExpired(l) {
  return l.ownerId && l.moderation === 'publiee' && l.expireLe && new Date(l.expireLe) < new Date();
}

// Deux espaces bien separes : les annonces de l'equipe MACHINGA, et celles
// deposees par les proprietaires (avec la file de validation).
const SPACES = {
  particuliers: {
    title: 'Annonces des particuliers',
    filters: [
      ['en_attente', 'À valider', (l) => l.moderation === 'en_attente'],
      ['en_ligne', 'En ligne', (l) => l.moderation === 'publiee' && !isExpired(l)],
      ['expirees', 'Expirées', (l) => isExpired(l)],
      ['refusee', 'Refusées', (l) => l.moderation === 'refusee'],
      ['toutes', 'Toutes', () => true]
    ]
  },
  machinga: {
    title: 'Annonces MACHINGA',
    filters: [
      ['toutes', 'Toutes', () => true],
      ['location', 'Locations', (l) => l.type === 'location'],
      ['vente', 'Ventes', (l) => l.type === 'vente']
    ]
  }
};

export default function ListingsManager({ listings, setListings }) {
  const [mode, setMode] = useState('list'); // list | create | edit
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refusing, setRefusing] = useState(null); // id de l'annonce en cours de refus
  const [moderatingId, setModeratingId] = useState(null);
  const [moderationError, setModerationError] = useState('');

  const ownerListings = listings.filter((l) => l.ownerId);
  const machingaListings = listings.filter((l) => !l.ownerId);
  const pendingCount = ownerListings.filter((l) => l.moderation === 'en_attente').length;

  const [space, setSpace] = useState(pendingCount > 0 ? 'particuliers' : 'machinga');
  const [filters, setFilters] = useState({
    particuliers: pendingCount > 0 ? 'en_attente' : 'toutes',
    machinga: 'toutes'
  });

  const spaceListings = space === 'particuliers' ? ownerListings : machingaListings;
  const activeFilter = SPACES[space].filters.find(([key]) => key === filters[space]);
  const visible = spaceListings.filter(activeFilter[2]);

  async function moderate(id, action, motifRefus) {
    setModeratingId(id);
    setModerationError('');
    const res = await fetch(`/api/listings/${id}/moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, motif: motifRefus })
    });
    const data = await res.json();
    if (res.ok) {
      setListings((prev) => prev.map((l) => (l.id === id ? data : l)));
      setRefusing(null);
    } else {
      setModerationError(data.error || 'Erreur lors de la validation');
    }
    setModeratingId(null);
  }

  function handleSaved(listing) {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      return exists ? prev.map((l) => (l.id === listing.id ? { ...l, ...listing } : l)) : [listing, ...prev];
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
    const columns = [
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
    ];
    if (space === 'particuliers') {
      columns.push(
        { label: 'Validation', value: (l) => (isExpired(l) ? 'Expirée' : MODERATION[l.moderation]?.label || '') },
        { label: 'Propriétaire', value: (l) => l.owner?.nom || '' },
        { label: 'Téléphone', value: (l) => l.owner?.telephone || '' },
        { label: 'Email', value: (l) => l.owner?.email || '' }
      );
    }
    downloadCsv(`annonces-${space}-${new Date().toISOString().slice(0, 10)}.csv`, visible, columns);
  }

  if (mode === 'create') {
    return <ListingForm onSaved={handleSaved} onCancel={() => setMode('list')} />;
  }
  if (mode === 'edit' && editing) {
    return (
      <ListingForm
        initial={editing}
        withCityFields={Boolean(editing.ownerId)}
        onSaved={handleSaved}
        onCancel={() => setMode('list')}
      />
    );
  }

  return (
    <div>
      {/* Choix de l'espace */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[
          ['particuliers', `${ownerListings.length} annonce(s)`, pendingCount ? `${pendingCount} à valider` : 'Rien à valider'],
          ['machinga', `${machingaListings.length} annonce(s)`, 'Publiées directement, badge « Certifié »']
        ].map(([key, count, hint]) => (
          <button
            key={key}
            onClick={() => setSpace(key)}
            aria-pressed={space === key}
            className={`text-left border-2 p-5 transition-colors ${
              space === key ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: key === 'machinga' ? '#2a78d6' : '#eb6834' }}
              />
              <span className="font-semibold text-ink">{SPACES[key].title}</span>
            </span>
            <span className="block text-sm text-gray-500 mt-1">
              {count} ·{' '}
              <span className={key === 'particuliers' && pendingCount ? 'text-amber-700 font-medium' : ''}>{hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {SPACES[space].filters.map(([key, label, test]) => (
            <button
              key={key}
              onClick={() => setFilters((f) => ({ ...f, [space]: key }))}
              className={`px-4 py-2 text-sm border transition-colors ${
                filters[space] === key ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {label} ({spaceListings.filter(test).length})
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={visible.length === 0}
            className="px-5 py-2.5 text-sm font-medium border border-gray-300 hover:border-primary transition-colors disabled:opacity-50"
          >
            Exporter (CSV)
          </button>
          {space === 'machinga' && (
            <button
              onClick={() => setMode('create')}
              className="bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-light transition-colors"
            >
              + Nouvelle annonce
            </button>
          )}
        </div>
      </div>

      {moderationError && <p className="text-sm text-red-600 mb-4">{moderationError}</p>}

      {visible.length === 0 ? (
        <p className="text-gray-500 border border-dashed border-gray-300 p-8 text-center">
          {filters[space] === 'en_attente' ? 'Aucune annonce à valider.' : 'Aucune annonce dans cette liste.'}
        </p>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
          {visible.map((l) => {
            const expired = isExpired(l);
            return (
              <div key={l.id} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative w-20 h-16 bg-offwhite shrink-0 border border-gray-200 overflow-hidden">
                    {l.photos && l.photos[0] ? (
                      <Image src={l.photos[0]} alt="" fill sizes="80px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-medium text-ink">{l.titre}</p>
                    <p className="text-sm text-gray-500">
                      {l.type === 'location' ? 'Location' : 'Vente'} · {l.category} · {l.localisation} ·{' '}
                      <span className="text-primary font-medium">{formatPrice(l.prix, l.type)}</span>
                    </p>
                    {l.ownerId && l.owner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Par{' '}
                        <Link
                          href={`/admin/dashboard/proprietaires/${l.ownerId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {l.owner.nom}
                        </Link>{' '}
                        · {l.owner.telephone} · {l.owner.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-offwhite border border-gray-200 text-gray-600">
                      {STATUT_LABEL[l.statut] || l.statut}
                    </span>
                    {l.ownerId && (
                      <span
                        className={`text-xs px-2 py-1 border ${
                          expired ? 'bg-gray-100 border-gray-300 text-gray-600' : MODERATION[l.moderation]?.className || ''
                        }`}
                      >
                        {expired ? 'Expirée' : MODERATION[l.moderation]?.label || l.moderation}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/annonces/${l.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm px-3 py-1.5 border border-gray-300 hover:border-primary transition-colors"
                    >
                      Aperçu
                    </a>
                    {l.ownerId && l.moderation !== 'publiee' && (
                      <button
                        onClick={() => moderate(l.id, 'publier')}
                        disabled={moderatingId === l.id}
                        className="text-sm px-3 py-1.5 bg-secondary text-white hover:bg-secondary-light transition-colors disabled:opacity-60"
                      >
                        Publier
                      </button>
                    )}
                    {l.ownerId && l.moderation !== 'refusee' && (
                      <button
                        onClick={() => setRefusing(l.id)}
                        className="text-sm px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors"
                      >
                        Refuser
                      </button>
                    )}
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
                {l.moderation === 'refusee' && l.motifRefus && (
                  <p className="text-xs text-red-700 mt-2">Motif du refus : {l.motifRefus}</p>
                )}
                {refusing === l.id && (
                  <div className="mt-3">
                    <RefusalForm
                      busy={moderatingId === l.id}
                      onSubmit={(motif) => moderate(l.id, 'refuser', motif)}
                      onCancel={() => setRefusing(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
