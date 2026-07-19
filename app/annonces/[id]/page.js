import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingById } from '../../../lib/publicData';
import PhotoGallery from '../../../components/PhotoGallery';

export const dynamic = 'force-dynamic';

const STATUT_LABEL = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  loue_vendu: 'Loué / Vendu'
};

function formatPrice(prix, type) {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} FCFA/mois` : `${formatted} FCFA`;
}

export async function generateMetadata({ params }) {
  const listing = await getListingById(params.id);
  if (!listing) return { title: 'Annonce introuvable - MACHINGA IMMOBILIER' };

  const title = `${listing.titre} - ${formatPrice(listing.prix, listing.type)} | MACHINGA IMMOBILIER`;
  const description = `${listing.category} à ${listing.localisation}${
    listing.surface ? ` - ${listing.surface} m²` : ''
  }${listing.description ? `. ${listing.description}` : ''}`.slice(0, 300);
  const images = listing.photos && listing.photos.length > 0 ? [{ url: listing.photos[0] }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images,
      locale: 'fr_FR'
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images
    }
  };
}

export default async function AnnoncePage({ params }) {
  const listing = await getListingById(params.id);
  if (!listing) notFound();

  const backHref = listing.type === 'location' ? '/locations' : '/ventes';
  const backLabel = listing.type === 'location' ? 'Locations' : 'Ventes';

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        &larr; Retour aux {backLabel.toLowerCase()}
      </Link>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PhotoGallery photos={listing.photos} alt={listing.titre} />
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-secondary mb-2">{listing.category}</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2 leading-snug">
            {listing.titre}
          </h1>
          <p className="text-gray-500 mb-4">{listing.localisation}</p>

          <div className="flex items-center gap-3 mb-6">
            <p className="text-2xl font-semibold text-primary">
              {formatPrice(listing.prix, listing.type)}
            </p>
            <span className="text-xs px-2.5 py-1 bg-offwhite border border-gray-200 text-gray-600">
              {STATUT_LABEL[listing.statut] || listing.statut}
            </span>
          </div>

          {(listing.surface || listing.chambres || listing.sallesDeBain) && (
            <div className="flex flex-wrap gap-6 py-5 border-y border-gray-200 mb-6">
              {listing.surface ? (
                <div>
                  <p className="text-lg font-semibold text-ink">{listing.surface} m²</p>
                  <p className="text-xs text-gray-500">Surface</p>
                </div>
              ) : null}
              {listing.chambres ? (
                <div>
                  <p className="text-lg font-semibold text-ink">{listing.chambres}</p>
                  <p className="text-xs text-gray-500">Chambre(s)</p>
                </div>
              ) : null}
              {listing.sallesDeBain ? (
                <div>
                  <p className="text-lg font-semibold text-ink">{listing.sallesDeBain}</p>
                  <p className="text-xs text-gray-500">Salle(s) de bain</p>
                </div>
              ) : null}
            </div>
          )}

          {listing.description && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-ink mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          <Link
            href={{
              pathname: '/contact',
              query: {
                annonce: listing.titre,
                type: listing.type,
                logement: listing.category
              }
            }}
            className="block text-center bg-secondary text-white px-6 py-3.5 text-sm font-medium transition-all hover:bg-secondary-light hover:-translate-y-0.5"
          >
            Contacter à propos de cette annonce
          </Link>
        </div>
      </div>
    </div>
  );
}
