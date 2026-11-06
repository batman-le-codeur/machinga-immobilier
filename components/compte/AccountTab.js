'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fieldClass =
  'w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-md border border-gray-200 bg-white p-6 ${className}`}>
      {title && <h2 className="font-semibold text-ink mb-4">{title}</h2>}
      {children}
    </section>
  );
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Libreville'
  });
}

async function send(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erreur, réessayez.');
  return data;
}

// Petit formulaire avec etat d'envoi, message de succes et d'erreur.
function useAction() {
  const [state, setState] = useState({ busy: false, error: '', message: '' });
  async function run(fn, successMessage) {
    setState({ busy: true, error: '', message: '' });
    try {
      const result = await fn();
      setState({ busy: false, error: '', message: successMessage });
      return result;
    } catch (err) {
      setState({ busy: false, error: err.message, message: '' });
      return null;
    }
  }
  return [state, run];
}

function Feedback({ state }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.message) return <p className="text-sm text-green-700">{state.message}</p>;
  return null;
}

function ProfileForm({ owner, onSaved }) {
  const [form, setForm] = useState({ nom: owner.nom, telephone: owner.telephone });
  const [state, run] = useAction();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await run(() => send('/api/compte/profil', 'PUT', form), 'Vos informations ont été mises à jour.');
    if (data) onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="p-nom" className="block text-sm font-medium mb-1">Nom complet</label>
        <input
          id="p-nom"
          required
          value={form.nom}
          onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
          className={fieldClass}
        />
        <p className="text-xs text-gray-500 mt-1">Affiché sur vos annonces comme nom de l&apos;annonceur.</p>
      </div>
      <div>
        <label htmlFor="p-tel" className="block text-sm font-medium mb-1">Numéro de téléphone</label>
        <input
          id="p-tel"
          required
          type="tel"
          value={form.telephone}
          onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
          className={fieldClass}
        />
        <p className="text-xs text-gray-500 mt-1">Les visiteurs vous appellent à ce numéro.</p>
      </div>
      <div>
        <label htmlFor="p-mail" className="block text-sm font-medium mb-1">Adresse e-mail</label>
        <input id="p-mail" value={owner.email} disabled className={`${fieldClass} bg-gray-100 text-gray-500`} />
        <p className="text-xs text-gray-500 mt-1">Sert à vous connecter et à recevoir nos emails. Jamais affichée publiquement.</p>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={state.busy}
        className="rounded-md bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60"
      >
        {state.busy ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ actuel: '', nouveau: '' });
  const [state, run] = useAction();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await run(() => send('/api/compte/mot-de-passe', 'PUT', form), 'Votre mot de passe a été modifié.');
    if (ok) setForm({ actuel: '', nouveau: '' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pw-old" className="block text-sm font-medium mb-1">Mot de passe actuel</label>
          <input
            id="pw-old"
            type="password"
            required
            autoComplete="current-password"
            value={form.actuel}
            onChange={(e) => setForm((f) => ({ ...f, actuel: e.target.value }))}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="pw-new" className="block text-sm font-medium mb-1">Nouveau (8 caractères min.)</label>
          <input
            id="pw-new"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.nouveau}
            onChange={(e) => setForm((f) => ({ ...f, nouveau: e.target.value }))}
            className={fieldClass}
          />
        </div>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={state.busy}
        className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium hover:border-primary transition-colors disabled:opacity-60"
      >
        {state.busy ? 'Modification…' : 'Modifier le mot de passe'}
      </button>
    </form>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [state, run] = useAction();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!confirm('Supprimer définitivement votre compte et toutes vos annonces ?')) return;
    const ok = await run(() => send('/api/compte', 'DELETE', { password }), '');
    if (ok) {
      router.push('/');
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-red-600 hover:underline">
        Supprimer mon compte…
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600">
        Votre compte et <strong>toutes vos annonces</strong> seront supprimés définitivement. Confirmez avec votre mot
        de passe.
      </p>
      <input
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        aria-label="Mot de passe"
        className={`${fieldClass} max-w-xs`}
      />
      <Feedback state={state} />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={state.busy}
          className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {state.busy ? 'Suppression…' : 'Supprimer définitivement'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-5 py-2.5 text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}

// Onglet "Mon compte" de l'espace proprietaire.
export default function AccountTab({ owner, account, listings, onOwnerSaved }) {
  const online = listings.filter(
    (l) => l.moderation === 'publiee' && (!l.expireLe || new Date(l.expireLe) > new Date())
  ).length;
  const pending = listings.filter((l) => l.moderation === 'en_attente').length;
  const memberSince = new Date(owner.dateInscription).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const initials = owner.nom
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const tel = account.contactTelephone;

  return (
    <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      {/* Colonne principale */}
      <div className="space-y-6 lg:col-span-2">
        <Card title="Mes informations">
          <ProfileForm owner={owner} onSaved={onOwnerSaved} />
        </Card>

        <Card title="Sécurité">
          <PasswordForm />
          {account.lastSignIn && (
            <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-100">
              Dernière connexion : {formatDateTime(account.lastSignIn)}. Si ce n&apos;était pas vous, changez votre mot
              de passe.
            </p>
          )}
        </Card>

      </div>

      {/* Colonne laterale */}
      <div className="space-y-6">
        <Card title="Ce que voient les visiteurs">
          <div className="rounded-md border border-gray-200 bg-offwhite p-4">
            <p className="text-xs uppercase tracking-wide text-secondary mb-1">Annonce de particulier</p>
            <p className="text-sm text-gray-500 mb-3">
              Annonceur : <span className="font-medium text-ink">{owner.nom}</span>
            </p>
            <div className="flex items-center gap-3 rounded-md bg-secondary px-4 py-2.5 text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="leading-tight">
                <span className="block text-[11px] text-white/80">Appeler l&apos;annonceur</span>
                <span className="block text-sm font-semibold">{owner.telephone}</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Votre adresse e-mail n&apos;est jamais affichée. Modifiez votre nom ou votre numéro dans « Mes informations ».
          </p>
          {online > 0 ? (
            <Link
              href={`/annonceurs/${owner.id}`}
              className="mt-4 block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium hover:border-primary"
            >
              Voir mon profil public &rarr;
            </Link>
          ) : (
            <p className="mt-4 text-xs text-gray-500">
              Votre profil public sera visible dès qu&apos;une de vos annonces sera en ligne.
            </p>
          )}
        </Card>

        <Card title="Mon compte en bref">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink truncate">{owner.nom}</p>
              <p className="text-xs text-gray-500 truncate">{owner.email}</p>
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">E-mail</dt>
              <dd className={owner.emailVerifie ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                {owner.emailVerifie ? '✓ Vérifié' : 'Non vérifié'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Membre depuis</dt>
              <dd className="text-ink">{memberSince}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Annonces en ligne</dt>
              <dd className="text-ink font-medium">{online}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">En vérification</dt>
              <dd className="text-ink font-medium">{pending}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Total déposées</dt>
              <dd className="text-ink font-medium">{listings.length}</dd>
            </div>
          </dl>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p>Mise en ligne : 60 jours, renouvelable.</p>
            <p>Jusqu&apos;à 5 nouvelles annonces par 24 h.</p>
          </div>
        </Card>

        <Card title="Besoin d'aide ?">
          <p className="text-sm text-gray-600 mb-4">L&apos;équipe MACHINGA vous répond du lundi au vendredi, 8h30 - 16h30, et le samedi de 9h à 12h.</p>
          <div className="space-y-2 text-sm">
            {tel && (
              <a href={`tel:${tel.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-primary hover:underline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                {tel}
              </a>
            )}
            {account.contactEmail && (
              <a href={`mailto:${account.contactEmail}`} className="flex items-center gap-2 text-primary hover:underline break-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M3.5 6l8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {account.contactEmail}
              </a>
            )}
            <Link href="/contact" className="block text-primary hover:underline">
              Formulaire de contact &rarr;
            </Link>
            <Link href="/conditions-utilisation" className="block text-gray-500 hover:text-primary">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </Card>
      </div>
    </div>

    {/* Tout en bas, sur PC comme sur mobile */}
    <Card title="Supprimer mon compte" className="border-red-100">
      <DeleteAccount />
    </Card>
    </div>
  );
}
