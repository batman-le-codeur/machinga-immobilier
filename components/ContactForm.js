'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const LOGEMENT_OPTIONS = {
  location: ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'],
  vente: ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers']
};

const EMPTY = {
  nom: '',
  telephone: '',
  email: '',
  typeTransaction: '',
  typeLogement: '',
  ville: 'Libreville',
  quartier: '',
  message: '',
  consentement: false
};

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const annonce = searchParams.get('annonce');
    const type = searchParams.get('type');
    const logement = searchParams.get('logement');

    setForm((f) => ({
      ...f,
      typeTransaction: type === 'location' || type === 'vente' ? type : f.typeTransaction,
      typeLogement:
        type && logement && LOGEMENT_OPTIONS[type]?.includes(logement) ? logement : f.typeLogement,
      message: annonce
        ? `Bonjour, je suis intéressé(e) par l'annonce « ${annonce} ». Pourriez-vous me donner plus d'informations ?`
        : f.message
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === 'typeTransaction' ? { typeLogement: '' } : {})
    }));
  }

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    update(name, type === 'checkbox' ? checked : value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue, réessayez.');
      }

      const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      if (web3formsKey) {
        // Envoyée depuis le navigateur : Web3Forms refuse les appels serveur
        // sur le plan gratuit. On n'échoue pas la requête si la notification
        // échoue, le message est déjà enregistré et visible dans /admin.
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `Nouveau message - ${form.nom}`,
            from_name: 'Site MACHINGA IMMOBILIER',
            ...form
          })
        }).catch(() => {});
      }

      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-offwhite border border-gray-200 p-6 text-ink">
        Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais.
      </div>
    );
  }

  const logementOptions = LOGEMENT_OPTIONS[form.typeTransaction] || [];
  const inputClass =
    'w-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-primary transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Nom complet *</label>
          <input
            required
            name="nom"
            placeholder="Jean Dupont"
            value={form.nom}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Téléphone *</label>
          <input
            required
            type="tel"
            name="telephone"
            placeholder="+241 60 35 21 57"
            value={form.telephone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Email *</label>
        <input
          required
          type="email"
          name="email"
          placeholder="jean@exemple.com"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Type de transaction *</label>
          <select
            required
            name="typeTransaction"
            value={form.typeTransaction}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Sélectionnez</option>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Type de logement *</label>
          <select
            required
            name="typeLogement"
            value={form.typeLogement}
            onChange={handleChange}
            disabled={!form.typeTransaction}
            className={`${inputClass} disabled:bg-offwhite disabled:text-gray-400`}
          >
            <option value="">Sélectionnez</option>
            {logementOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Ville *</label>
          <input
            required
            name="ville"
            placeholder="Libreville"
            value={form.ville}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Quartier</label>
          <input
            name="quartier"
            placeholder="Batterie IV, Lalala..."
            value={form.quartier}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Votre message *</label>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Décrivez votre projet..."
          value={form.message}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-gray-600">
        <input
          required
          type="checkbox"
          name="consentement"
          checked={form.consentement}
          onChange={handleChange}
          className="mt-0.5 h-4 w-4 accent-primary shrink-0"
        />
        J&apos;accepte que mes données soient utilisées pour le traitement de ma demande
      </label>

      {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-primary text-white px-6 py-3 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={null}>
      <ContactFormInner />
    </Suspense>
  );
}
