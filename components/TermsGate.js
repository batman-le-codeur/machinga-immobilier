'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Version des conditions : a incrementer quand le texte change, pour que
// chaque visiteur les accepte de nouveau.
const TERMS_VERSION = '1';
const STORAGE_KEY = 'machinga_cgu_acceptees';

// Fenetre d'acceptation des conditions d'utilisation, affichee a la premiere
// visite. Le choix est memorise dans le navigateur du visiteur.
export default function TermsGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let accepted = false;
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === TERMS_VERSION;
    } catch {
      // Stockage indisponible (navigation privee stricte) : on affiche la fenetre.
    }
    setOpen(!accepted);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Les pages des conditions et de confidentialite doivent rester lisibles, et
  // l'admin n'est pas concerne.
  const exempt =
    pathname.startsWith('/conditions-utilisation') ||
    pathname.startsWith('/politique-confidentialite') ||
    pathname.startsWith('/admin');
  if (!open || exempt) return null;

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
    } catch {
      // Sans stockage, l'acceptation vaut pour cette visite uniquement.
    }
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-7 sm:p-8 animate-fade-in-up">
        <div className="flex justify-center mb-5">
          <Image src="/logo-full.svg" alt="Machinga Immobilier" width={227} height={69} className="h-11 w-auto" />
        </div>
        <h2 id="terms-title" className="text-xl font-semibold text-center mb-3">
          Bienvenue sur MACHINGA IMMOBILIER
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Ce site publie des annonces de MACHINGA IMMOBILIER et des annonces déposées par des
          propriétaires particuliers, vérifiées avant leur mise en ligne.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Pour continuer, veuillez lire et accepter nos{' '}
          <Link href="/conditions-utilisation" className="text-primary font-medium underline">
            conditions d&apos;utilisation
          </Link>
          . Notre{' '}
          <Link href="/politique-confidentialite" className="text-primary font-medium underline">
            politique de confidentialité
          </Link>{' '}
          explique comment vos données sont utilisées.
        </p>
        <button
          type="button"
          onClick={accept}
          autoFocus
          className="w-full bg-primary text-white rounded-md px-6 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
        >
          J&apos;accepte les conditions d&apos;utilisation
        </button>
      </div>
    </div>
  );
}
