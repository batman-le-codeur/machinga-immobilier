'use client';

import { useState } from 'react';
import PhotoUploader from './PhotoUploader';
import ListingCard from '../ListingCard';
import { PERIODES, MAX_PERIODE_NOMBRE, formatListingPrice } from '../../lib/price';

const CATEGORIES = {
  location: ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'],
  vente: ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers']
};

const EMPTY = {
  type: 'location',
  category: 'Chambres/Studios',
  titre: '',
  prix: '',
  periode: 'mois',
  periodeNombre: 1,
  localisation: '',
  surface: '',
  chambres: '',
  sallesDeBain: '',
  description: '',
  photos: [],
  statut: 'disponible',
  ville: '',
  quartier: ''
};

// withCityFields : l'admin modifie une annonce de particulier.
// ownerMode : formulaire de l'espace proprietaire (locations uniquement,
// ville + quartier au lieu d'une localisation libre, API /api/compte/annonces).
export default function ListingForm({ initial, onSaved, onCancel, ownerMode = false, withCityFields = false }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const apiBase = ownerMode ? '/api/compte/annonces' : '/api/listings';
  // Ville + quartier (annonces de particuliers) au lieu d'une localisation libre.
  const cityFields = ownerMode || withCityFields;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const isEdit = Boolean(form.id);
    const url = isEdit ? `${apiBase}/${form.id}` : apiBase;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");
      onSaved(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-offwhite border border-gray-200 p-6">
      <div className="grid sm:grid-cols-2 gap-5">
        {!ownerMode && (
        <div>
          <label className="block text-sm font-medium mb-1">Type d&apos;annonce</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value) || update('category', CATEGORIES[e.target.value][0])}
            className="w-full border border-gray-300 px-3 py-2"
          >
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
        </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          >
            {CATEGORIES[form.type].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input
          required
          value={form.titre}
          onChange={(e) => update('titre', e.target.value)}
          className="w-full border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="listing-prix" className="block text-sm font-medium mb-1">
            {ownerMode || form.type === 'location' ? 'Loyer (FCFA)' : 'Prix (FCFA)'}
          </label>
          <input
            id="listing-prix"
            required
            type="number"
            min="0"
            value={form.prix}
            onChange={(e) => update('prix', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
          {/* Periode de location : un nombre et une unite (ex. pour 3 jours, pour 6 mois) */}
          {(ownerMode || form.type === 'location') && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Pour</span>
              <input
                type="number"
                min="1"
                max={MAX_PERIODE_NOMBRE}
                required
                aria-label="Durée de location (nombre)"
                value={form.periodeNombre ?? 1}
                onChange={(e) => update('periodeNombre', e.target.value)}
                className="w-20 border border-gray-300 px-3 py-2"
              />
              <select
                aria-label="Durée de location (unité)"
                value={form.periode || 'mois'}
                onChange={(e) => update('periode', e.target.value)}
                className="min-w-0 flex-1 border border-gray-300 bg-white px-3 py-2"
              >
                {PERIODES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {Number(form.periodeNombre) > 1 ? p.many : p.one}
                  </option>
                ))}
              </select>
            </div>
          )}
          {Number(form.prix) > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Affiché :{' '}
              {formatListingPrice(form.prix, ownerMode ? 'location' : form.type, form.periode, form.periodeNombre)}
            </p>
          )}
        </div>
        {!cityFields && (
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              required
              value={form.localisation}
              onChange={(e) => update('localisation', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>
        )}
      </div>

      {cityFields && (
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Ville</label>
            <input
              required
              value={form.ville}
              onChange={(e) => update('ville', e.target.value)}
              placeholder="Ex. Libreville"
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quartier</label>
            <input
              required
              value={form.quartier}
              onChange={(e) => update('quartier', e.target.value)}
              placeholder="Ex. Glass, Nzeng-Ayong…"
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Surface (m²)</label>
          <input
            type="number"
            min="0"
            value={form.surface || ''}
            onChange={(e) => update('surface', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chambres</label>
          <input
            type="number"
            min="0"
            value={form.chambres || ''}
            onChange={(e) => update('chambres', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Salles de bain</label>
          <input
            type="number"
            min="0"
            value={form.sallesDeBain || ''}
            onChange={(e) => update('sallesDeBain', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Statut</label>
        <select
          value={form.statut}
          onChange={(e) => update('statut', e.target.value)}
          className="w-full sm:w-64 border border-gray-300 px-3 py-2"
        >
          <option value="disponible">Disponible</option>
          <option value="reserve">Réservé</option>
          <option value="loue_vendu">Loué / Vendu</option>
        </select>
      </div>

      <PhotoUploader photos={form.photos || []} onChange={(photos) => update('photos', photos)} />

      {ownerMode && form.titre && (
        <div>
          <p className="text-sm font-medium mb-2">Aperçu de votre annonce</p>
          {/* Apercu non cliquable, tel qu'il apparaitra dans les resultats. */}
          <div className="max-w-xs pointer-events-none select-none" aria-hidden="true">
            <ListingCard
              listing={{
                ...form,
                type: 'location',
                ownerId: 'apercu',
                prix: Number(form.prix) || 0,
                localisation: [form.quartier, form.ville].filter(Boolean).join(', '),
                photos: form.photos || []
              }}
            />
          </div>
        </div>
      )}

      {ownerMode && (
        <p className="text-sm text-gray-500">
          Votre annonce sera vérifiée par MACHINGA IMMOBILIER avant d&apos;être visible sur le site.
          Toute modification du contenu entraîne une nouvelle vérification.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {saving
            ? 'Enregistrement…'
            : ownerMode && !form.id
              ? 'Envoyer pour validation'
              : "Enregistrer l'annonce"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium border border-gray-300 hover:border-primary transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
