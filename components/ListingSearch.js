'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ListingCard from './ListingCard';

const SORTS = [
  ['pertinence', 'Certifiées MACHINGA d’abord'],
  ['recentes', 'Plus récentes'],
  ['prix_asc', 'Prix croissant'],
  ['prix_desc', 'Prix décroissant']
];

const SOURCES = [
  ['', 'Toutes'],
  ['machinga', 'Certifiées MACHINGA'],
  ['particulier', 'Particuliers']
];

const ROOMS = ['', '1', '2', '3', '4', '5'];

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value));
}

function SearchIcon({ className = '' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Recherche des annonces : une barre de recherche libre (lieu, type de bien,
// mot-cle), les filtres de base toujours visibles (categories, origine,
// tri) et le budget / les chambres dans un panneau
// "Filtres". Tout vit dans l'URL : une recherche se partage telle quelle.
// showSource : filtre par origine, utile seulement sur les locations.
export default function ListingSearch({
  listings,
  categories,
  total,
  page,
  pageCount,
  priceLabel,
  showSource = false
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = (key) => searchParams.get(key) || '';

  const activeCat = param('cat');
  const activeSource = param('source');
  const activeSort = param('tri') || 'pertinence';
  const urlQuery = param('q') || param('lieu');

  const [query, setQuery] = useState(urlQuery);
  const [panelOpen, setPanelOpen] = useState(false);
  const [budget, setBudget] = useState({ min: param('prixMin'), max: param('prixMax') });
  const [rooms, setRooms] = useState(param('chambres'));
  const panelRef = useRef(null);
  const debounce = useRef(null);

  // Resynchronise les champs quand l'URL change (retour arriere, pastille retiree…)
  useEffect(() => {
    const fromUrl = param('q') || param('lieu');
    // Ne pas ecraser la saisie en cours (ex. l'espace tape a la fin d'un mot)
    setQuery((current) => (current.trim() === fromUrl ? current : fromUrl));
    setBudget({ min: param('prixMin'), max: param('prixMax') });
    setRooms(param('chambres'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!panelOpen) return;
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setPanelOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setPanelOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [panelOpen]);

  function hrefWith(changes) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lieu');
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function go(changes) {
    router.push(hrefWith({ ...changes, page: '' }), { scroll: false });
  }

  // Recherche pendant la saisie (apres une courte pause), ou a la validation.
  function onQueryChange(value) {
    setQuery(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => go({ q: value.trim() }), 450);
  }

  function submitQuery(e) {
    e.preventDefault();
    clearTimeout(debounce.current);
    go({ q: query.trim() });
  }

  function applyPanel(e) {
    e.preventDefault();
    go({ prixMin: budget.min, prixMax: budget.max, chambres: rooms });
    setPanelOpen(false);
  }

  const advancedCount = [param('prixMin') || param('prixMax'), param('chambres')].filter(Boolean).length;

  const chips = [
    urlQuery && { key: 'q', label: `« ${urlQuery} »`, clear: { q: '' } },
    activeCat && { key: 'cat', label: activeCat, clear: { cat: '' } },
    activeSource && {
      key: 'source',
      label: activeSource === 'machinga' ? 'Certifiées MACHINGA' : 'Particuliers',
      clear: { source: '' }
    },
    (param('prixMin') || param('prixMax')) && {
      key: 'budget',
      label: `${priceLabel} : ${param('prixMin') ? formatAmount(param('prixMin')) : '0'} - ${
        param('prixMax') ? `${formatAmount(param('prixMax'))} FCFA` : 'sans maximum'
      }`,
      clear: { prixMin: '', prixMax: '' }
    },
    param('chambres') && { key: 'chambres', label: `${param('chambres')} chambre(s) ou +`, clear: { chambres: '' } }
  ].filter(Boolean);

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary';

  return (
    <div>
      {/* Barre de recherche + bouton Filtres */}
      <div className="flex gap-3 mb-5">
        {/* action + name : fonctionne aussi avant le chargement du JavaScript */}
        <form action={pathname} method="get" onSubmit={submitQuery} className="relative flex-1" role="search">
          {activeCat && <input type="hidden" name="cat" value={activeCat} />}
          {activeSource && <input type="hidden" name="source" value={activeSource} />}
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Quartier, ville, type de bien…"
            aria-label="Rechercher une annonce"
            className="w-full h-12 rounded-md border border-gray-300 bg-white pl-12 pr-10 text-[15px] shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                go({ q: '' });
              }}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-offwhite hover:text-ink"
            >
              &times;
            </button>
          )}
        </form>

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-label="Filtres : budget et chambres"
            className={`h-12 inline-flex items-center justify-center gap-2 rounded-md border px-4 sm:px-5 text-sm font-medium transition-colors ${
              advancedCount ? 'border-primary text-primary bg-primary/5' : 'border-gray-300 bg-white hover:border-primary'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="hidden sm:inline">Filtres</span>
            {advancedCount > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                {advancedCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <form
              onSubmit={applyPanel}
              className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-lg border border-gray-200 bg-white p-5 shadow-xl space-y-5"
            >
              <fieldset>
                <legend className="text-sm font-semibold text-ink mb-2">{priceLabel} (FCFA)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    inputMode="numeric"
                    value={budget.min}
                    onChange={(e) => setBudget((b) => ({ ...b, min: e.target.value }))}
                    placeholder="Minimum"
                    aria-label={`${priceLabel} minimum`}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    inputMode="numeric"
                    value={budget.max}
                    onChange={(e) => setBudget((b) => ({ ...b, max: e.target.value }))}
                    placeholder="Maximum"
                    aria-label={`${priceLabel} maximum`}
                    className={inputClass}
                  />
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold text-ink mb-2">Chambres</legend>
                <div className="flex flex-wrap gap-2">
                  {ROOMS.map((n) => (
                    <button
                      key={n || 'all'}
                      type="button"
                      onClick={() => setRooms(n)}
                      aria-pressed={rooms === n}
                      className={`h-9 min-w-[2.75rem] rounded-full border px-3 text-sm transition-colors ${
                        rooms === n ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {n ? `${n}+` : 'Tout'}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setBudget({ min: '', max: '' });
                    setRooms('');
                  }}
                  className="text-sm text-gray-500 hover:text-primary"
                >
                  Réinitialiser
                </button>
                <button type="submit" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light">
                  Voir les annonces
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="-mx-6 px-6 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-1 mb-4">
        {['', ...categories].map((cat) => (
          <Link
            key={cat || 'tous'}
            href={hrefWith({ cat, page: '' })}
            scroll={false}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              activeCat === cat ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-ink hover:border-primary'
            }`}
          >
            {cat || 'Toutes catégories'}
          </Link>
        ))}
      </div>

      {/* Filtres actifs */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => go(c.clear)}
              className="inline-flex items-center gap-1.5 rounded-full bg-offwhite border border-gray-200 px-3 py-1 text-xs text-ink hover:border-primary"
              aria-label={`Retirer le filtre ${c.label}`}
            >
              {c.label} <span aria-hidden="true" className="text-gray-400">&times;</span>
            </button>
          ))}
          {chips.length > 1 && (
            <Link href={pathname} scroll={false} className="text-xs text-gray-500 underline hover:text-primary ml-1">
              Tout effacer
            </Link>
          )}
        </div>
      )}

      {/* Origine, resultats, tri */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {showSource && (
            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden" role="group" aria-label="Annonceur">
              {SOURCES.map(([value, label]) => (
                <Link
                  key={value || 'toutes'}
                  href={hrefWith({ source: value, page: '' })}
                  scroll={false}
                  aria-current={activeSource === value ? 'true' : undefined}
                  className={`px-3.5 py-2 text-sm transition-colors border-r border-gray-300 last:border-r-0 ${
                    activeSource === value ? 'bg-primary text-white' : 'bg-white text-ink hover:bg-offwhite'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500" aria-live="polite">
            <strong className="text-ink">{total}</strong> annonce{total > 1 ? 's' : ''}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Trier par
          <select
            value={activeSort}
            onChange={(e) => go({ tri: e.target.value === 'pertinence' ? '' : e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {listings.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-md p-10 text-center">
          <p className="text-ink font-medium mb-1">Aucune annonce ne correspond à votre recherche.</p>
          <p className="text-sm text-gray-500 mb-4">Essayez un autre quartier, élargissez le budget ou retirez un filtre.</p>
          {chips.length > 0 && (
            <Link href={pathname} scroll={false} className="text-sm font-medium text-primary hover:underline">
              Effacer tous les filtres
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="flex flex-wrap justify-center gap-2 mt-12" aria-label="Pagination">
          {page > 1 && (
            <Link href={hrefWith({ page: page - 1 })} className="px-4 py-2 text-sm border border-gray-300 hover:border-primary">
              &larr; Précédent
            </Link>
          )}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={hrefWith({ page: n === 1 ? '' : n })}
              aria-current={n === page ? 'page' : undefined}
              className={`px-4 py-2 text-sm border transition-colors ${
                n === page ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {n}
            </Link>
          ))}
          {page < pageCount && (
            <Link href={hrefWith({ page: page + 1 })} className="px-4 py-2 text-sm border border-gray-300 hover:border-primary">
              Suivant &rarr;
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
