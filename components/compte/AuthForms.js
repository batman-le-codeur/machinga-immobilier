'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { inputClass, labelClass, buttonClass } from './AuthShell';

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Une erreur est survenue, réessayez.');
  return data;
}

// ?publier=1 (bouton "Publier mon bien" de l'accueil) : conserve l'intention
// entre inscription et connexion, puis ouvre le formulaire de depot.
function usePublishSuffix() {
  return useSearchParams().get('publier') === '1' ? '?publier=1' : '';
}

function useSubmit(action) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return { loading, error, submit };
}

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${inputClass} pr-24`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-primary"
      >
        {visible ? 'Masquer' : 'Afficher'}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const suffix = usePublishSuffix();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, submit } = useSubmit(async () => {
    await postJson('/api/compte/connexion', { email, password });
    router.push(`/compte${suffix}`);
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="text-sm font-medium text-ink">Mot de passe</label>
          <Link href="/compte/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
      <p className="text-sm text-center text-gray-500">
        Pas encore de compte ?{' '}
        <Link href={`/compte/inscription${suffix}`} className="text-primary font-medium hover:underline">
          Créer un compte gratuit
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const suffix = usePublishSuffix();
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', password: '' });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const { loading, error, submit } = useSubmit(async () => {
    await postJson('/api/compte/inscription', form);
    router.push(`/compte${suffix}`);
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="nom" className={labelClass}>Nom complet</label>
        <input id="nom" required value={form.nom} onChange={update('nom')} autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="telephone" className={labelClass}>Numéro de téléphone</label>
        <input
          id="telephone"
          type="tel"
          required
          value={form.telephone}
          onChange={update('telephone')}
          placeholder="+241 …"
          autoComplete="tel"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1">
          Affiché sur vos annonces : les visiteurs vous appelleront directement.
        </p>
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Mot de passe (8 caractères minimum)</label>
        <PasswordInput
          id="password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? 'Création du compte…' : 'Créer mon compte'}
      </button>
      <p className="text-xs text-center text-gray-500 leading-relaxed">
        En créant un compte, vous acceptez les{' '}
        <Link href="/conditions-utilisation" className="text-primary hover:underline">
          conditions d&apos;utilisation
        </Link>{' '}
        du site et notre{' '}
        <Link href="/politique-confidentialite" className="text-primary hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
      <p className="text-sm text-center text-gray-500">
        Déjà inscrit ?{' '}
        <Link href={`/compte/connexion${suffix}`} className="text-primary font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

// Saisie d'un code a 6 chiffres (recu par email).
export function CodeInput({ value, onChange }) {
  return (
    <input
      id="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      required
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
      className={`${inputClass} text-center text-2xl font-semibold tracking-[0.5em] text-primary`}
    />
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');

  const sendCode = useSubmit(async () => {
    await postJson('/api/compte/mot-de-passe-oublie', { email });
    setInfo('');
    setStep('code');
  });

  const reset = useSubmit(async () => {
    await postJson('/api/compte/nouveau-mot-de-passe', { email, code, password });
    router.push('/compte');
    router.refresh();
  });

  async function resend() {
    setInfo('');
    try {
      await postJson('/api/compte/mot-de-passe-oublie', { email });
      setInfo('Un nouveau code vient d’être envoyé.');
    } catch (err) {
      setInfo(err.message);
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={sendCode.submit} className="space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>Adresse e-mail du compte</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </div>
        {sendCode.error && <p className="text-sm text-red-600">{sendCode.error}</p>}
        <button type="submit" disabled={sendCode.loading} className={buttonClass}>
          {sendCode.loading ? 'Envoi…' : 'Recevoir un code'}
        </button>
        <p className="text-sm text-center">
          <Link href="/compte/connexion" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={reset.submit} className="space-y-5">
      <p className="text-sm text-gray-600 leading-relaxed">
        Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un code à 6 chiffres vient
        d&apos;y être envoyé. Pensez à vérifier vos courriers indésirables.
      </p>
      <div>
        <label htmlFor="code" className={labelClass}>Code reçu par email</label>
        <CodeInput value={code} onChange={setCode} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Nouveau mot de passe (8 caractères minimum)</label>
        <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
      </div>
      {reset.error && <p className="text-sm text-red-600">{reset.error}</p>}
      {info && <p className="text-sm text-gray-600">{info}</p>}
      <button type="submit" disabled={reset.loading || code.length !== 6} className={buttonClass}>
        {reset.loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
      </button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setStep('email')} className="text-gray-500 hover:text-primary">
          Changer d&apos;adresse
        </button>
        <button type="button" onClick={resend} className="text-primary hover:underline">
          Renvoyer le code
        </button>
      </div>
    </form>
  );
}

// Confirmation de l'adresse e-mail apres l'inscription.
export function VerifyEmailForm({ email }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [info, setInfo] = useState('');
  const { loading, error, submit } = useSubmit(async () => {
    await postJson('/api/compte/verification', { code });
    router.refresh();
  });

  async function resend() {
    setInfo('');
    try {
      await postJson('/api/compte/verification/renvoyer', {});
      setInfo('Un nouveau code vient d’être envoyé.');
    } catch (err) {
      setInfo(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-gray-600 leading-relaxed text-center">
        Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>. Saisissez-le pour activer
        votre compte et publier vos biens.
      </p>
      <CodeInput value={code} onChange={setCode} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {info && <p className="text-sm text-gray-600">{info}</p>}
      <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
        {loading ? 'Vérification…' : 'Confirmer mon adresse'}
      </button>
      <p className="text-sm text-center text-gray-500">
        Pas reçu ? Vérifiez vos courriers indésirables ou{' '}
        <button type="button" onClick={resend} className="text-primary font-medium hover:underline">
          renvoyez le code
        </button>
        .
      </p>
    </form>
  );
}
