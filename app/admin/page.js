'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!res.ok) {
      setError('Adresse e-mail ou mot de passe incorrect.');
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden px-6 py-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/page-header-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/70" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-icon.svg"
              alt="Machinga Immobilier"
              width={56}
              height={58}
              className="h-14 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-center mb-2">Espace administrateur</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Connectez-vous pour gérer vos annonces et vos messages.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-ink mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M3.5 6l8.5 6.5L20.5 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-ink mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M8 11V7a4 4 0 0 1 8 0v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-11 py-2.5 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.3 5.3A9.9 9.9 0 0 1 12 5c5 0 9 4 10.5 7-.5 1-1.3 2.2-2.4 3.3M6.6 6.6C4.6 7.9 3 9.9 1.5 12 3 15 7 19 12 19c1.3 0 2.5-.3 3.6-.7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7-10.5-7-10.5-7z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 text-sm font-medium hover:bg-primary-light transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p className="text-center text-white/60 text-xs mt-6">
          © {new Date().getFullYear()} S.C.I MACHINGA IMMOBILIER
        </p>
      </div>
    </div>
  );
}
