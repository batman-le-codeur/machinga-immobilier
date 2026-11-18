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

const baseInput =
  'border border-gray-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const inputClass = `w-full ${baseInput}`;

// Une etape du formulaire : numero, titre, aide courte, puis les champs.
function Step({ number, title, hint, children }) {
  return (
    <section className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary text-sm font-semibold text-white">
          {number}
        </span>
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-gray-500">{hint}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, optional, htmlFor, help, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-gray-400"> (facultatif)</span>}
      </label>
      {children}
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

// withCityFields : l'admin modifie une annonce de particulier.
// ownerMode : formulaire de l'espace proprietaire (locations uniquement,
// ville + quartier au lieu d'une localisation libre, API /api/compte/annonces).
export default function ListingForm({ initial, onSaved, onCancel, ownerMode = false, withCityFields = false }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const apiBase = ownerMode ? '/api/compte/annonces' : '/api/listings';
  // Ville + quartier (annonces de particuliers) au lieu d'une localisation libre.
  const cityFields = ownerMode || withCityFields;
  const isLocation = ownerMode || form.type === 'location';
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (uploading) return;
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

  const photos = form.photos || [];
  let step = 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 border border-gray-200 bg-offwhite p-5 sm:p-6">
      <Step number={++step} title="Votre bien" hint={ownerMode ? 'Le type de logement et un titre clair.' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          {!ownerMode && (
            <Field label="Type d'annonce" htmlFor="listing-type">
              <select
                id="listing-type"
                value={form.type}
                onChange={(e) => update('type', e.target.value) || update('category', CATEGORIES[e.target.value][0])}
                className={inputClass}
              >
                <option value="location">Location</option>
                <option value="vente">Vente</option>
              </select>
            </Field>
          )}
          <Field label="Catégorie" htmlFor="listing-category">
            <select
              id="listing-category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputClass}
            >
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Titre de l'annonce" htmlFor="listing-titre" help="Le type de bien et le quartier suffisent.">
          <input
            id="listing-titre"
            required
            maxLength={120}
            value={form.titre}
            onChange={(e) => update('titre', e.target.value)}
            placeholder="Ex. Studio meublé climatisé à Louis"
            className={inputClass}
          />
        </Field>
      </Step>

      <Step
        number={++step}
        title="Photos"
        hint="Les annonces avec photos sont beaucoup plus consultées. Ajoutez la pièce principale en premier."
      >
        <PhotoUploader photos={photos} onChange={(next) => update('photos', next)} onBusyChange={setUploading} />
      </Step>

      <Step number={++step} title={isLocation ? 'Loyer' : 'Prix'}>
        <Field label={isLocation ? 'Montant du loyer (FCFA)' : 'Prix (FCFA)'} htmlFor="listing-prix">
          <input
            id="listing-prix"
            required
            type="number"
            min="0"
            inputMode="numeric"
            value={form.prix}
            onChange={(e) => update('prix', e.target.value)}
            placeholder={isLocation ? 'Ex. 150000' : 'Ex. 25000000'}
            className={`${inputClass} sm:max-w-xs`}
          />
        </Field>
        {/* Periode de location : un nombre et une unite (ex. pour 3 jours, pour 6 mois) */}
        {isLocation && (
          <Field label="Ce loyer est pour" htmlFor="listing-periode-nombre">
            <div className="flex items-center gap-2 sm:max-w-xs">
              <input
                id="listing-periode-nombre"
                type="number"
                min="1"
                max={MAX_PERIODE_NOMBRE}
                required
                inputMode="numeric"
                aria-label="Durée de location (nombre)"
                value={form.periodeNombre ?? 1}
                onChange={(e) => update('periodeNombre', e.target.value)}
                className={`${baseInput} w-20 shrink-0`}
              />
              <select
                aria-label="Durée de location (unité)"
                value={form.periode || 'mois'}
                onChange={(e) => update('periode', e.target.value)}
                className={`${baseInput} min-w-0 flex-1`}
              >
                {PERIODES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {Number(form.periodeNombre) > 1 ? p.many : p.one}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        )}
        {Number(form.prix) > 0 && (
          <p className="text-sm text-gray-600">
            Affiché sur le site :{' '}
            <strong className="text-primary">
              {formatListingPrice(form.prix, isLocation ? 'location' : form.type, form.periode, form.periodeNombre)}
            </strong>
          </p>
        )}
      </Step>

      <Step number={++step} title="Emplacement" hint={cityFields ? 'Le quartier est le premier critère de recherche.' : undefined}>
        {cityFields ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ville" htmlFor="listing-ville">
              <input
                id="listing-ville"
                required
                value={form.ville}
                onChange={(e) => update('ville', e.target.value)}
                placeholder="Ex. Libreville"
                className={inputClass}
              />
            </Field>
            <Field label="Quartier" htmlFor="listing-quartier">
              <input
                id="listing-quartier"
                required
                value={form.quartier}
                onChange={(e) => update('quartier', e.target.value)}
                placeholder="Ex. Glass, Nzeng-Ayong…"
                className={inputClass}
              />
            </Field>
          </div>
        ) : (
          <Field label="Localisation" htmlFor="listing-localisation">
            <input
              id="listing-localisation"
              required
              value={form.localisation}
              onChange={(e) => update('localisation', e.target.value)}
              className={inputClass}
            />
          </Field>
        )}
      </Step>

      <Step number={++step} title="Détails" hint="Tous ces champs sont facultatifs mais rassurent les visiteurs.">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Field label="Surface (m²)" htmlFor="listing-surface">
            <input
              id="listing-surface"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.surface || ''}
              onChange={(e) => update('surface', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Chambres" htmlFor="listing-chambres">
            <input
              id="listing-chambres"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.chambres || ''}
              onChange={(e) => update('chambres', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Salles de bain" htmlFor="listing-sdb">
            <input
              id="listing-sdb"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.sallesDeBain || ''}
              onChange={(e) => update('sallesDeBain', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="listing-description">
          <textarea
            id="listing-description"
            rows={5}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={
              isLocation
                ? 'Pièces, équipements, eau et électricité, conditions (caution, avance)…'
                : 'Superficie, titre foncier, accès, équipements…'
            }
            className={inputClass}
          />
        </Field>
        {/* A la creation par un proprietaire, le bien est forcement disponible. */}
        {(!ownerMode || form.id) && (
          <Field label="Statut" htmlFor="listing-statut">
            <select
              id="listing-statut"
              value={form.statut}
              onChange={(e) => update('statut', e.target.value)}
              className={`${inputClass} sm:w-64`}
            >
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservé</option>
              <option value="loue_vendu">Loué / Vendu</option>
            </select>
          </Field>
        )}
      </Step>

      {ownerMode && form.titre && (
        <div className="border-t border-gray-200 pt-6">
          <p className="mb-2 text-sm font-medium">Aperçu de votre annonce</p>
          {/* Apercu non cliquable, tel qu'il apparaitra dans les resultats. */}
          <div className="max-w-xs pointer-events-none select-none" aria-hidden="true">
            <ListingCard
              listing={{
                ...form,
                type: 'location',
                ownerId: 'apercu',
                prix: Number(form.prix) || 0,
                localisation: [form.quartier, form.ville].filter(Boolean).join(', '),
                photos
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-gray-200 pt-6">
        {ownerMode && (
          <p className="text-sm text-gray-500">
            Votre annonce sera vérifiée par MACHINGA IMMOBILIER avant d&apos;être visible sur le site.
            Toute modification du contenu entraîne une nouvelle vérification.
          </p>
        )}
        {ownerMode && photos.length === 0 && !uploading && (
          <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Vous n&apos;avez ajouté aucune photo. Vous pouvez envoyer l&apos;annonce, mais elle sera
            beaucoup moins vue.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 px-6 py-3 text-sm font-medium transition-colors hover:border-primary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-60 sm:min-w-[16rem]"
          >
            {uploading
              ? 'Patientez, envoi des photos…'
              : saving
                ? 'Enregistrement…'
                : ownerMode && !form.id
                  ? 'Envoyer pour validation'
                  : "Enregistrer l'annonce"}
          </button>
        </div>
      </div>
    </form>
  );
}
