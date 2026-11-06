'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RefusalForm from './admin/RefusalForm';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Bandeau en haut d'une fiche vue par l'admin (toujours) ou par son
// proprietaire quand l'annonce n'est pas visible du public.
export default function PreviewBar({ listing, hidden, isAdmin }) {
  const router = useRouter();
  const [refusing, setRefusing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const expired =
    listing.ownerId && listing.moderation === 'publiee' && listing.expireLe && new Date(listing.expireLe) < new Date();

  let state;
  if (listing.moderation === 'en_attente') state = 'En attente de validation : invisible du public.';
  else if (listing.moderation === 'refusee') state = `Refusée : invisible du public. Motif : ${listing.motifRefus}`;
  else if (expired) state = `Expirée le ${formatDate(listing.expireLe)} : invisible du public.`;
  else state = listing.ownerId ? 'Publiée : visible par le public.' : 'Annonce MACHINGA publiée : visible par le public.';

  async function moderate(action, motif) {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/listings/${listing.id}/moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, motif })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Erreur');
      return;
    }
    setRefusing(false);
    router.refresh();
  }

  return (
    <div className={`border-b ${hidden ? 'bg-amber-50 border-amber-200' : 'bg-offwhite border-gray-200'}`}>
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            <span className="font-semibold">{isAdmin ? 'Vue administrateur' : 'Aperçu de votre annonce'}</span>
            {' · '}
            {state}
          </p>
          <div className="flex flex-wrap gap-2">
            {isAdmin && listing.ownerId && listing.moderation !== 'publiee' && (
              <button
                onClick={() => moderate('publier')}
                disabled={busy}
                className="text-sm px-3 py-1.5 bg-secondary text-white hover:bg-secondary-light transition-colors disabled:opacity-60"
              >
                Publier
              </button>
            )}
            {isAdmin && listing.ownerId && listing.moderation !== 'refusee' && (
              <button
                onClick={() => setRefusing((r) => !r)}
                className="text-sm px-3 py-1.5 border border-amber-300 text-amber-800 bg-white hover:bg-amber-50 transition-colors"
              >
                Refuser
              </button>
            )}
            <Link
              href={isAdmin ? '/admin/dashboard' : '/compte'}
              className="text-sm px-3 py-1.5 border border-gray-300 bg-white hover:border-primary transition-colors"
            >
              {isAdmin ? 'Retour à l’admin' : 'Retour à mon espace'}
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {refusing && (
          <div className="mt-3">
            <RefusalForm busy={busy} onSubmit={(motif) => moderate('refuser', motif)} onCancel={() => setRefusing(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
