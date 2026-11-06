'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const LOCATIONS_CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];
const VENTES_CATEGORIES = ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers'];

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/nous-decouvrir', label: 'Nous découvrir' },
  { href: '/locations', label: 'Locations', categories: LOCATIONS_CATEGORIES },
  { href: '/ventes', label: 'Ventes', categories: VENTES_CATEGORIES },
  { href: '/contact', label: 'Contactez-nous' }
];

function DesktopDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function hide() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  if (!item.categories) {
    return (
      <Link
        href={item.href}
        className="relative px-1 py-2 text-sm font-medium text-ink transition-colors hover:text-primary after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Link
        href={item.href}
        className="flex items-center gap-1 px-1 py-2 text-sm font-medium text-ink transition-colors hover:text-primary"
      >
        {item.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Link>

      <div
        className={`absolute left-1/2 top-full z-40 w-64 -translate-x-1/2 pt-3 transition-all duration-200 ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg">
          {item.categories.map((cat) => (
            <Link
              key={cat}
              href={{ pathname: item.href, query: { cat } }}
              className="block px-5 py-3 text-sm text-ink transition-colors hover:bg-offwhite hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileAccordion({ item, onNavigate }) {
  const [open, setOpen] = useState(false);

  if (!item.categories) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onNavigate}
          className="block px-6 py-3 text-ink transition-colors hover:bg-offwhite hover:text-primary"
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 px-6 py-3 text-ink transition-colors hover:bg-offwhite hover:text-primary"
        >
          {item.label}
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={`${open ? 'Fermer' : 'Ouvrir'} le sous-menu ${item.label}`}
          className="px-4 py-3 text-ink"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div
        className={`overflow-hidden bg-offwhite/60 transition-all duration-300 ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        {item.categories.map((cat) => (
          <Link
            key={cat}
            href={{ pathname: item.href, query: { cat } }}
            onClick={onNavigate}
            className="block px-10 py-2.5 text-sm text-gray-600 transition-colors hover:text-primary"
          >
            {cat}
          </Link>
        ))}
      </div>
    </li>
  );
}

export default function HeaderClient({ authed, ownerAuthed }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function openMenu() {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }

  function closeMenu() {
    setOpen(false);
    setTimeout(() => setMounted(false), 300);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    closeMenu();
    router.push('/');
    router.refresh();
  }

  return (
    <>
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-gray-200'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-full.svg"
            alt="Machinga Immobilier"
            width={227}
            height={69}
            className="h-11 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => (
            <DesktopDropdown key={item.href} item={item} />
          ))}
          {/* Masque pour l'admin : son tableau de bord prend deja cette place. */}
          {!authed && (
            <Link
              href="/compte"
              className="bg-secondary text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary-light"
            >
              {ownerAuthed ? 'Mon espace' : 'Publier un bien'}
            </Link>
          )}
          {authed && (
            <div className="flex items-center gap-3 pl-5 ml-1 border-l border-gray-200">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
                Tableau de bord
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>

        {/* Burger - mobile only */}
        <button
          type="button"
          onClick={openMenu}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="flex md:hidden flex-col gap-1.5 p-2"
        >
          <span className="block w-6 h-0.5 bg-primary" />
          <span className="block w-6 h-0.5 bg-primary" />
          <span className="block w-6 h-0.5 bg-primary" />
        </button>
      </div>
    </header>

      {/* Mobile drawer - rendered as a sibling of <header>, not a descendant: the
          header's backdrop-blur creates a new containing block for fixed-position
          descendants, which would otherwise squash this drawer to the header's own
          height instead of the full viewport. */}
      {mounted && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
          />
          <nav
            className={`absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <Image
                src="/logo-full.svg"
                alt="Machinga Immobilier"
                width={227}
                height={69}
                className="h-9 w-auto"
              />
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Fermer le menu"
                className="text-2xl leading-none text-ink"
              >
                &times;
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-2">
              {NAV.map((item) => (
                <MobileAccordion key={item.href} item={item} onNavigate={closeMenu} />
              ))}
              <li className="px-6 py-3">
                <Link
                  href="/compte"
                  onClick={closeMenu}
                  className="block text-center bg-secondary text-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary-light"
                >
                  {ownerAuthed ? 'Mon espace propriétaire' : 'Publier un bien'}
                </Link>
              </li>
              {authed && (
                <>
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-6 py-3 text-primary font-medium transition-colors hover:bg-offwhite"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Tableau de bord
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-6 py-3 text-gray-500 transition-colors hover:bg-offwhite hover:text-red-600"
                    >
                      Déconnexion
                    </button>
                  </li>
                </>
              )}
            </ul>
            <div className="px-6 py-5 border-t border-gray-200 text-sm text-gray-500">
              Après l&apos;Union, Libreville - Gabon
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
