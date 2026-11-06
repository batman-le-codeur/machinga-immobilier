'use client';

import { useState } from 'react';

// Motifs de refus frequents, inseres en un clic (modifiables avant envoi).
export const REFUSAL_REASONS = [
  'Photos floues, trop sombres ou absentes',
  'Prix manquant ou incohérent',
  'Description insuffisante',
  'Localisation imprécise',
  'Annonce en double',
  "Bien qui n'est pas une location"
];

// Saisie du motif de refus d'une annonce (envoye par email au proprietaire).
export default function RefusalForm({ onSubmit, onCancel, busy }) {
  const [motif, setMotif] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(motif);
      }}
      className="flex flex-wrap gap-2 items-start"
    >
      <div className="w-full flex flex-wrap gap-1.5">
        {REFUSAL_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => setMotif((m) => (m.includes(reason) ? m : m ? `${m}. ${reason}` : reason))}
            className="text-xs px-2.5 py-1 border border-gray-300 rounded-full bg-white hover:border-primary hover:text-primary transition-colors"
          >
            + {reason}
          </button>
        ))}
      </div>
      <textarea
        required
        rows={2}
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Motif du refus, envoyé au propriétaire (ex. photos floues, prix manquant…)"
        className="flex-1 min-w-[240px] border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="text-sm px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        Confirmer le refus
      </button>
      <button type="button" onClick={onCancel} className="text-sm px-3 py-2 border border-gray-300 bg-white">
        Annuler
      </button>
    </form>
  );
}
