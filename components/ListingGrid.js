'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard from './ListingCard';

export default function ListingGrid({ listings, categories }) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState('Tous');

  useEffect(() => {
    const cat = searchParams.get('cat');
    setActive(cat && categories.includes(cat) ? cat : 'Tous');
  }, [searchParams, categories]);

  const filtered = useMemo(() => {
    if (active === 'Tous') return listings;
    return listings.filter((l) => l.category === active);
  }, [listings, active]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {['Tous', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 text-sm rounded-sm border transition-colors ${
              active === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-ink border-gray-300 hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">Aucune annonce disponible dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
