'use client';

import { useState } from 'react';
import PhotoUploader from './PhotoUploader';

const CATEGORIES = {
  location: ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'],
  vente: ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers']
};

const EMPTY = {
  type: 'location',
  category: 'Chambres/Studios',
  titre: '',
  prix: '',
  localisation: '',
  surface: '',
  chambres: '',
  sallesDeBain: '',
  description: '',
  photos: [],
  statut: 'disponible'
};

export default function ListingForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
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
    const url = isEdit ? `/api/listings/${form.id}` : '/api/listings';
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
          <label className="block text-sm font-medium mb-1">
            Prix (FCFA{form.type === 'location' ? '/mois' : ''})
          </label>
          <input
            required
            type="number"
            min="0"
            value={form.prix}
            onChange={(e) => update('prix', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Localisation</label>
          <input
            required
            value={form.localisation}
            onChange={(e) => update('localisation', e.target.value)}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {saving ? 'Enregistrement…' : "Enregistrer l'annonce"}
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
