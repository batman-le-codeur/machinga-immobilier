'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ListingForm from '../admin/ListingForm';
import AccountTab from './AccountTab';

const DAY = 86400000;
const EXPIRY_WARNING_DAYS = 7;

const STATUT_LABEL = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  loue_vendu: 'Loué'
};

// Etat d'une annonce du point de vue du proprietaire.
const STATES = {
  en_ligne: { label: 'En ligne', badge: 'bg-green-600 text-white' },
  en_attente: { label: 'En vérification', badge: 'bg-amber-400 text-ink' },
  refusee: { label: 'À corriger', badge: 'bg-red-600 text-white' },
  expiree: { label: 'Expirée', badge: 'bg-gray-600 text-white' }
};

const FILTERS = [
  ['toutes', 'Toutes'],
  ['en_ligne', 'En ligne'],
  ['en_attente', 'En vérification'],
  ['refusee', 'À corriger'],
  ['expiree', 'Expirées']
];

function stateOf(l) {
  if (l.moderation === 'en_attente') return 'en_attente';
  if (l.moderation === 'refusee') return 'refusee';
  if (l.expireLe && new Date(l.expireLe) < new Date()) return 'expiree';
  return 'en_ligne';
}

function daysLeft(l) {
  return l.expireLe ? Math.ceil((new Date(l.expireLe).getTime() - Date.now()) / DAY) : null;
}

function formatPrice(prix) {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA/mois`;
}

function formatDate(iso, withYear = true) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {})
  });
}

// ------------------------------------------------------------- Une annonce

function MoreMenu({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Plus d'actions"
        className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 z-20 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const menuItem = 'block w-full text-left px-4 py-2 text-sm hover:bg-offwhite disabled:opacity-50';

function OwnerListingCard({ listing: l, busy, onEdit, onQuick, onDelete }) {
  const state = stateOf(l);
  const left = daysLeft(l);
  const expiringSoon = state === 'en_ligne' && left !== null && left <= EXPIRY_WARNING_DAYS;

  // Action principale selon l'etat de l'annonce
  let primary = null;
  if (state === 'refusee') primary = { label: 'Corriger l’annonce', onClick: onEdit };
  else if (state === 'expiree') primary = { label: 'Renouveler 60 jours', onClick: () => onQuick({ renouveler: true }) };
  else if (expiringSoon) primary = { label: 'Prolonger 60 jours', onClick: () => onQuick({ renouveler: true }) };

  return (
    <article className="flex flex-col bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="relative aspect-[16/10] bg-offwhite">
        {l.photos && l.photos[0] ? (
          <Image src={l.photos[0]} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Aucune photo</span>
        )}
        <span className={`absolute top-2 left-2 rounded-sm px-2 py-1 text-xs font-medium shadow-sm ${STATES[state].badge}`}>
          {STATES[state].label}
        </span>
        {l.statut !== 'disponible' && (
          <span className="absolute top-2 right-2 rounded-sm bg-white/95 px-2 py-1 text-xs font-medium text-ink shadow-sm">
            {STATUT_LABEL[l.statut]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-secondary mb-1">{l.category}</p>
        <h3 className="font-semibold text-ink leading-snug line-clamp-2">{l.titre}</h3>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{l.localisation}</p>
        <p className="text-primary font-semibold mt-2">{formatPrice(l.prix)}</p>

        <div className="mt-3 text-xs leading-relaxed">
          {state === 'en_attente' && (
            <p className="text-amber-800">
              En cours de vérification par MACHINGA. Vous recevrez un email dès qu&apos;elle sera publiée.
            </p>
          )}
          {state === 'en_ligne' && (
            <p className={expiringSoon ? 'text-amber-800 font-medium' : 'text-gray-500'}>
              {expiringSoon
                ? `Expire dans ${left} jour${left > 1 ? 's' : ''}, le ${formatDate(l.expireLe, false)}.`
                : `En ligne jusqu’au ${formatDate(l.expireLe)}.`}
            </p>
          )}
          {state === 'expiree' && (
            <p className="text-gray-700">
              Plus visible depuis le {formatDate(l.expireLe, false)}. Renouvelez-la sans nouvelle vérification.
            </p>
          )}
          {state === 'refusee' && l.motifRefus && (
            <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-red-700">
              <strong>Motif :</strong> {l.motifRefus}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          {primary ? (
            <button
              onClick={primary.onClick}
              disabled={busy}
              className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-white hover:bg-secondary-light disabled:opacity-60"
            >
              {primary.label}
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:border-primary"
            >
              Modifier
            </button>
          )}
          <Link
            href={`/annonces/${l.id}`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:border-primary"
          >
            {state === 'en_ligne' ? 'Voir' : 'Aperçu'}
          </Link>
          <MoreMenu>
            {primary && (
              <button onClick={onEdit} className={menuItem}>
                Modifier
              </button>
            )}
            {l.statut === 'loue_vendu' ? (
              <button onClick={() => onQuick({ statut: 'disponible' })} disabled={busy} className={menuItem}>
                Remettre disponible
              </button>
            ) : (
              <>
                <button onClick={() => onQuick({ statut: 'loue_vendu' })} disabled={busy} className={menuItem}>
                  Marquer comme loué
                </button>
                {l.statut !== 'reserve' && (
                  <button onClick={() => onQuick({ statut: 'reserve' })} disabled={busy} className={menuItem}>
                    Marquer comme réservé
                  </button>
                )}
              </>
            )}
            {l.statut === 'reserve' && (
              <button onClick={() => onQuick({ statut: 'disponible' })} disabled={busy} className={menuItem}>
                Remettre disponible
              </button>
            )}
            <button onClick={onDelete} className={`${menuItem} text-red-600 border-t border-gray-100`}>
              Supprimer l&apos;annonce
            </button>
          </MoreMenu>
        </div>
      </div>
    </article>
  );
}

// ------------------------------------------------------------------ Page

export default function OwnerSpace({ owner: initialOwner, account, initialListings, startCreate = false }) {
  const router = useRouter();
  const [owner, setOwner] = useState(initialOwner);
  const [listings, setListings] = useState(initialListings);
  const [tab, setTab] = useState('annonces');
  const [filter, setFilter] = useState('toutes');
  const [mode, setMode] = useState(startCreate ? 'create' : 'list'); // list | create | edit
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // Arrivee par "Publier mon bien" : le formulaire est deja ouvert, on retire
  // ?publier=1 de l'URL pour qu'un rechargement ramene a la liste.
  useEffect(() => {
    if (startCreate) window.history.replaceState(null, '', '/compte');
  }, [startCreate]);

  const counts = listings.reduce((acc, l) => ({ ...acc, [stateOf(l)]: (acc[stateOf(l)] || 0) + 1 }), {});
  const expiringSoon = listings.filter((l) => {
    const left = daysLeft(l);
    return stateOf(l) === 'en_ligne' && left !== null && left <= EXPIRY_WARNING_DAYS;
  }).length;
  const visible = filter === 'toutes' ? listings : listings.filter((l) => stateOf(l) === filter);

  const initials = owner.nom
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function openForm(listing) {
    setEditing(listing || null);
    setMode(listing ? 'edit' : 'create');
    setTab('annonces');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSaved(listing) {
    const isNew = !listings.some((l) => l.id === listing.id);
    setListings((prev) => (isNew ? [listing, ...prev] : prev.map((l) => (l.id === listing.id ? listing : l))));
    setMode('list');
    setEditing(null);
    setNotice(
      listing.moderation === 'en_attente'
        ? 'Annonce envoyée : MACHINGA la vérifie et vous prévient par email dès sa publication.'
        : 'Annonce enregistrée.'
    );
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    setBusyId(id);
    const res = await fetch(`/api/compte/annonces/${id}`, { method: 'DELETE' });
    if (res.ok) setListings((prev) => prev.filter((l) => l.id !== id));
    setBusyId(null);
  }

  // Actions rapides (statut, renouvellement) : sans nouvelle verification.
  async function quickUpdate(id, body) {
    setBusyId(id);
    setActionError('');
    const res = await fetch(`/api/compte/annonces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      setListings((prev) => prev.map((l) => (l.id === id ? data : l)));
      if (body.renouveler) setNotice(`Annonce en ligne jusqu’au ${formatDate(data.expireLe)}.`);
    } else {
      setActionError(data.error || 'Erreur, réessayez.');
    }
    setBusyId(null);
  }

  async function handleLogout() {
    await fetch('/api/compte/deconnexion', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  // Formulaire de depot / modification
  if (mode !== 'list') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => setMode('list')} className="text-sm text-gray-500 hover:text-primary mb-4">
          &larr; Retour à mes annonces
        </button>
        <h1 className="text-2xl font-semibold mb-6">{mode === 'edit' ? 'Modifier l’annonce' : 'Publier un bien en location'}</h1>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <ListingForm
            ownerMode
            initial={mode === 'edit' ? editing : undefined}
            onSaved={handleSaved}
            onCancel={() => setMode('list')}
          />
          <aside className="rounded-md border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold text-ink mb-3">Conseils pour une annonce vite publiée</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <strong className="text-ink">Des photos nettes et lumineuses</strong>, prises de jour : pièce
                principale en premier.
              </li>
              <li>
                <strong className="text-ink">Le loyer réel</strong>, charges comprises ou non, précisé dans la
                description.
              </li>
              <li>
                <strong className="text-ink">Le quartier exact</strong> : c&apos;est le premier critère de
                recherche des visiteurs.
              </li>
              <li>
                <strong className="text-ink">Une description complète</strong> : pièces, équipements, eau,
                électricité, conditions (caution, avance).
              </li>
            </ul>
            {mode === 'edit' && editing?.moderation === 'refusee' && editing.motifRefus && (
              <p className="mt-4 rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                <strong>À corriger :</strong> {editing.motifRefus}
              </p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* En-tete */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-5 mb-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-white">
            {initials}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">Bonjour {owner.nom}</h1>
            <p className="text-sm text-gray-500">
              Espace propriétaire · membre depuis{' '}
              {new Date(owner.dateInscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openForm(null)}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
          >
            + Publier un bien
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {[
          ['annonces', `Mes annonces (${listings.length})`],
          ['compte', 'Mon compte']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 -mb-px border-b-2 text-sm font-semibold transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'compte' && (
        <AccountTab owner={owner} account={account} listings={listings} onOwnerSaved={setOwner} />
      )}

      {tab === 'annonces' && (
        <div>
          {notice && (
            <div className="flex items-start justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 mb-6 text-sm text-green-800">
              <p>{notice}</p>
              <button onClick={() => setNotice('')} aria-label="Fermer" className="text-green-700">
                &times;
              </button>
            </div>
          )}
          {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

          {/* A faire */}
          {(counts.refusee > 0 || counts.expiree > 0 || expiringSoon > 0) && (
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              {counts.refusee > 0 && (
                <button
                  onClick={() => setFilter('refusee')}
                  className="text-left rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 hover:border-red-300"
                >
                  <strong>{counts.refusee} annonce{counts.refusee > 1 ? 's' : ''} à corriger</strong> : consultez le
                  motif et renvoyez-la{counts.refusee > 1 ? 's' : ''} en vérification &rarr;
                </button>
              )}
              {(counts.expiree > 0 || expiringSoon > 0) && (
                <button
                  onClick={() => setFilter(counts.expiree > 0 ? 'expiree' : 'en_ligne')}
                  className="text-left rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:border-amber-300"
                >
                  <strong>
                    {counts.expiree > 0
                      ? `${counts.expiree} annonce${counts.expiree > 1 ? 's' : ''} expirée${counts.expiree > 1 ? 's' : ''}`
                      : `${expiringSoon} annonce${expiringSoon > 1 ? 's' : ''} expire${expiringSoon > 1 ? 'nt' : ''} bientôt`}
                  </strong>{' '}
                  : renouvelez en un clic, sans nouvelle vérification &rarr;
                </button>
              )}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-ink mb-2">Publiez votre premier bien</h2>
              <p className="text-sm text-gray-500 mb-8">C&apos;est gratuit, et votre annonce est vérifiée par MACHINGA.</p>
              <ol className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto mb-8 text-left">
                {[
                  ['1', 'Décrivez votre bien', 'Photos, loyer, quartier et description.'],
                  ['2', 'MACHINGA vérifie', 'Vous êtes prévenu par email dès la validation.'],
                  ['3', 'Recevez des appels', 'Les visiteurs vous contactent directement.']
                ].map(([n, title, text]) => (
                  <li key={n} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                      {n}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{title}</span>
                      <span className="block text-sm text-gray-500">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => openForm(null)}
                className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white hover:bg-secondary-light"
              >
                Publier mon premier bien
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
                {FILTERS.map(([key, label]) => {
                  const n = key === 'toutes' ? listings.length : counts[key] || 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                        filter === key ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white hover:border-primary'
                      }`}
                    >
                      {label} <span className={filter === key ? 'text-white/80' : 'text-gray-400'}>{n}</span>
                    </button>
                  );
                })}
              </div>

              {visible.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                  Aucune annonce dans cette catégorie.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((l) => (
                    <OwnerListingCard
                      key={l.id}
                      listing={l}
                      busy={busyId === l.id}
                      onEdit={() => openForm(l)}
                      onQuick={(body) => quickUpdate(l.id, body)}
                      onDelete={() => handleDelete(l.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
