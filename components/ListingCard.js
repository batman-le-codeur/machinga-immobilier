import Link from 'next/link';
import Image from 'next/image';

function formatPrice(prix, type) {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} FCFA/mois` : `${formatted} FCFA`;
}

export default function ListingCard({ listing }) {
  const cover = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;
  const photoCount = listing.photos ? listing.photos.length : 0;

  return (
    <article className="group bg-white border border-gray-200 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/annonces/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] bg-offwhite flex items-center justify-center overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt={listing.titre}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <span className="text-sm text-gray-400">Photo à venir</span>
          )}
          {photoCount > 1 && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {photoCount}
            </span>
          )}
        </div>

        <div className="p-5 pb-0">
          <p className="text-xs uppercase tracking-wide text-secondary mb-1">{listing.category}</p>
          <h3 className="font-semibold text-ink mb-1 leading-snug">{listing.titre}</h3>
          <p className="text-sm text-gray-500 mb-3">{listing.localisation}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
            {listing.surface ? <span>{listing.surface} m²</span> : null}
            {listing.chambres ? <span>{listing.chambres} chambre(s)</span> : null}
            {listing.sallesDeBain ? <span>{listing.sallesDeBain} SdB</span> : null}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        <p className="text-primary font-semibold">{formatPrice(listing.prix, listing.type)}</p>
        <Link
          href={{
            pathname: '/contact',
            query: { annonce: listing.titre, type: listing.type, logement: listing.category }
          }}
          className="shrink-0 bg-secondary text-white px-4 py-2 text-sm font-medium transition-all hover:bg-secondary-light hover:-translate-y-0.5"
        >
          Contacter
        </Link>
      </div>
    </article>
  );
}
