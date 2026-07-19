'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function formatPrice(prix, type) {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} FCFA/mois` : `${formatted} FCFA`;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function ensureLoaded() {
    if (listings !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !listings) return [];
    return listings
      .filter(
        (l) =>
          l.titre.toLowerCase().includes(q) ||
          l.localisation.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, listings]);

  useEffect(() => {
    setHighlighted(-1);
  }, [results]);

  function goTo(index) {
    const target = results[index];
    if (!target) return;
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(`/annonces/${target.id}`);
  }

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      goTo(highlighted === -1 ? 0 : highlighted);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showPanel = open && query.trim().length > 0;

  function handleSearchClick() {
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }
    ensureLoaded();
    setOpen(true);
    if (results.length > 0) {
      goTo(highlighted === -1 ? 0 : highlighted);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-stretch bg-white border transition-shadow rounded-lg overflow-hidden ${
          showPanel ? 'shadow-2xl border-gray-200 rounded-b-none' : 'shadow-xl border-gray-100'
        }`}
      >
        <div className="flex flex-1 min-w-0 items-center gap-3 px-5 py-4 sm:py-4.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-offwhite text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={query}
            onFocus={() => {
              ensureLoaded();
              setOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher : titre, quartier, catégorie…"
            className="flex-1 min-w-0 text-ink placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Effacer la recherche"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-offwhite hover:text-ink transition-colors"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearchClick}
          className="shrink-0 flex items-center gap-2.5 bg-primary px-6 sm:px-9 text-sm font-medium text-white transition-colors hover:bg-primary-light"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full bg-white rounded-b-lg shadow-2xl border border-t-0 border-gray-200 overflow-hidden z-30">
          {loading || listings === null ? (
            <p className="px-5 py-4 text-sm text-gray-500">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-500">
              Aucune annonce ne correspond à « {query} ».
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {results.map((l, i) => (
                <li key={l.id}>
                  <Link
                    href={`/annonces/${l.id}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`flex items-center gap-3 px-5 py-3 border-l-2 transition-colors ${
                      highlighted === i ? 'bg-offwhite border-l-primary' : 'border-l-transparent'
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded-sm bg-offwhite border border-gray-200 overflow-hidden">
                      {l.photos && l.photos[0] ? (
                        <Image src={l.photos[0]} alt="" fill sizes="48px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium text-ink truncate">{l.titre}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {l.category} - {l.localisation}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-primary shrink-0">
                      {formatPrice(l.prix, l.type)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
