import Link from 'next/link';
import Image from 'next/image';
import CertifiedBadge from './CertifiedBadge';

function formatPrice(prix, type) {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} FCFA/mois` : `${formatted} FCFA`;
}

// "Aujourd'hui", "Hier", "Il y a 5 jours", "Il y a 3 semaines"… (au jour pres,
// pour que le rendu serveur et le rendu navigateur affichent la meme chose).
function publishedAgo(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  if (days < 14) return `Il y a ${days} jours`;
  if (days < 60) return `Il y a ${Math.floor(days / 7)} semaines`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

function Spec({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400 shrink-0" aria-hidden="true">
        {icon}
      </svg>
      {children}
    </span>
  );
}

const ICONS = {
  surface: <path d="M4 4h16v16H4zM4 9h5V4M20 15h-5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  chambres: (
    <path
      d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 21v-3M21 21v-3M7 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  sdb: (
    <path
      d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  )
};

export default function ListingCard({ listing }) {
  const cover = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;
  const photoCount = listing.photos ? listing.photos.length : 0;

  return (
    <article className="group h-full flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/annonces/${listing.id}`} className="flex flex-1 flex-col">
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
          {listing.ownerId ? (
            <span className="absolute top-2 left-2 bg-white/95 text-secondary text-xs font-medium px-2 py-1 rounded-sm shadow-sm">
              Particulier
            </span>
          ) : (
            <CertifiedBadge className="absolute top-2 left-2 shadow-sm" />
          )}
          {listing.statut === 'reserve' && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-sm shadow-sm">
              Réservé
            </span>
          )}
          {listing.statut === 'loue_vendu' && (
            <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded-sm shadow-sm">
              {listing.type === 'location' ? 'Loué' : 'Vendu'}
            </span>
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

        <div className="flex flex-1 flex-col p-5 pb-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs uppercase tracking-wide text-secondary truncate">{listing.category}</p>
            {listing.dateAjout && (
              <p className="text-xs text-gray-400 shrink-0">{publishedAgo(listing.dateAjout)}</p>
            )}
          </div>
          <h3 className="font-semibold text-ink mb-1.5 leading-snug line-clamp-2" title={listing.titre}>
            {listing.titre}
          </h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 mb-3 truncate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
              <path
                d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="truncate">{listing.localisation}</span>
          </p>

          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 pb-4">
            {listing.surface ? <Spec icon={ICONS.surface}>{listing.surface} m²</Spec> : null}
            {listing.chambres ? (
              <Spec icon={ICONS.chambres}>
                {listing.chambres} ch.
              </Spec>
            ) : null}
            {listing.sallesDeBain ? <Spec icon={ICONS.sdb}>{listing.sallesDeBain} sdb</Spec> : null}
          </div>
        </div>
      </Link>

      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <p className="text-primary font-semibold">{formatPrice(listing.prix, listing.type)}</p>
        <Link
          href={
            // Annonce de particulier : le contact se fait directement avec
            // l'annonceur, depuis la fiche de l'annonce.
            listing.ownerId
              ? `/annonces/${listing.id}`
              : {
                  pathname: '/contact',
                  query: { annonce: listing.titre, type: listing.type, logement: listing.category }
                }
          }
          className="shrink-0 bg-secondary text-white px-4 py-2 text-sm font-medium transition-all hover:bg-secondary-light hover:-translate-y-0.5"
        >
          Contacter
        </Link>
      </div>
    </article>
  );
}
