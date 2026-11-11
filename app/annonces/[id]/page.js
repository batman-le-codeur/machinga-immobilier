import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  getListingById,
  getListingForPreview,
  getSimilarListings,
  getOwnerOtherListings
} from '../../../lib/publicData';
import { SESSION_COOKIE, isValidSessionToken } from '../../../lib/auth';
import { OWNER_COOKIE, getOwnerIdFromToken } from '../../../lib/ownerAuth';
import PreviewBar from '../../../components/PreviewBar';
import PhotoGallery from '../../../components/PhotoGallery';
import ListingDescription from '../../../components/ListingDescription';
import ListingCard from '../../../components/ListingCard';
import CertifiedBadge from '../../../components/CertifiedBadge';
import CallOwnerButton from '../../../components/CallOwnerButton';
import { formatListingPrice } from '../../../lib/price';

export const dynamic = 'force-dynamic';

const STATUT_LABEL = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  loue_vendu: 'Loué / Vendu'
};

// Annonce a afficher : publique si elle est en ligne ; sinon seulement en
// apercu pour l'admin ou pour son proprietaire.
async function loadListing(id) {
  const isAdmin = await isValidSessionToken(cookies().get(SESSION_COOKIE)?.value);
  const listing = await getListingById(id);
  if (listing) return { listing, hidden: false, isAdmin };

  const viewerOwnerId = await getOwnerIdFromToken(cookies().get(OWNER_COOKIE)?.value);
  if (!isAdmin && !viewerOwnerId) return { listing: null };
  const hiddenListing = await getListingForPreview(id);
  if (hiddenListing && (isAdmin || hiddenListing.ownerId === viewerOwnerId)) {
    return { listing: hiddenListing, hidden: true, isAdmin };
  }
  return { listing: null };
}

export async function generateMetadata({ params }) {
  const { listing, hidden } = await loadListing(params.id);
  if (!listing) return { title: 'Annonce introuvable - MACHINGA IMMOBILIER' };
  if (hidden) return { title: `Aperçu : ${listing.titre}`, robots: { index: false, follow: false } };

  const title = `${listing.titre} - ${formatListingPrice(listing.prix, listing.type, listing.periode)} | MACHINGA IMMOBILIER`;
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
  const { listing, hidden, isAdmin } = await loadListing(params.id);
  if (!listing) notFound();

  const [similar, ownerOthers] = await Promise.all([
    getSimilarListings(listing),
    listing.ownerId ? getOwnerOtherListings(listing.ownerId, listing.id) : []
  ]);
  const similarShown = similar.filter((l) => !ownerOthers.some((o) => o.id === l.id));
  const backHref = listing.type === 'location' ? '/locations' : '/ventes';
  const backLabel = listing.type === 'location' ? 'Locations' : 'Ventes';

  const specs = [
    listing.surface ? [`${listing.surface} m²`, 'Surface'] : null,
    listing.chambres ? [listing.chambres, listing.chambres > 1 ? 'Chambres' : 'Chambre'] : null,
    listing.sallesDeBain
      ? [listing.sallesDeBain, listing.sallesDeBain > 1 ? 'Salles de bain' : 'Salle de bain']
      : null
  ].filter(Boolean);

  const details = [
    ['Type', listing.type === 'location' ? 'Location' : 'Vente'],
    ['Catégorie', listing.category],
    ['Ville', listing.ville],
    ['Quartier', listing.quartier],
    !listing.ville && !listing.quartier ? ['Localisation', listing.localisation] : null,
    ['Surface', listing.surface ? `${listing.surface} m²` : ''],
    ['Chambres', listing.chambres],
    ['Salles de bain', listing.sallesDeBain],
    ['Disponibilité', STATUT_LABEL[listing.statut] || listing.statut]
  ].filter((row) => row && row[1]);

  return (
    <>
    {(hidden || isAdmin) && <PreviewBar listing={listing} hidden={hidden} isAdmin={isAdmin} />}
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        &larr; Retour aux {backLabel.toLowerCase()}
      </Link>

      {/* Sur PC : photos puis description dans la colonne principale, resume
          et contact fixes a droite pendant la lecture. Sur mobile : photos,
          resume + contact, puis description. */}
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <PhotoGallery photos={listing.photos} alt={listing.titre} />
        </div>

        <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-24">
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            {!listing.ownerId && <CertifiedBadge className="mb-3" />}
            <p className="text-xs uppercase tracking-wide text-secondary mb-2">{listing.category}</p>
            <h1 className="text-2xl font-semibold text-ink mb-2 leading-snug break-words">
              {listing.titre}
            </h1>
            <p className="text-gray-500 mb-5">{listing.localisation}</p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <p className="text-2xl font-semibold text-primary">
                {formatListingPrice(listing.prix, listing.type, listing.periode)}
              </p>
              <span className="text-xs px-2.5 py-1 bg-offwhite border border-gray-200 text-gray-600">
                {STATUT_LABEL[listing.statut] || listing.statut}
              </span>
            </div>

            {specs.length > 0 && (
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-200 mb-6 text-center">
                {specs.map(([value, label]) => (
                  <div key={label}>
                    <p className="text-lg font-semibold text-ink">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {listing.ownerId && listing.owner ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary mb-1">
                  Annonce de particulier
                </p>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-gray-500">
                    Annonceur :{' '}
                    {hidden ? (
                      <span className="font-medium text-ink">{listing.owner.nom}</span>
                    ) : (
                      <Link href={`/annonceurs/${listing.ownerId}`} className="font-medium text-ink hover:text-primary hover:underline">
                        {listing.owner.nom}
                      </Link>
                    )}
                  </p>
                  {!hidden && (
                    <Link href={`/annonceurs/${listing.ownerId}`} className="shrink-0 text-xs font-medium text-primary hover:underline">
                      Voir le profil &rarr;
                    </Link>
                  )}
                </div>
                <CallOwnerButton
                  listingId={listing.id}
                  telephone={listing.owner.telephone}
                  track={!isAdmin && !hidden}
                />
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  Annonce déposée par un particulier et vérifiée par MACHINGA IMMOBILIER avant sa
                  publication.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Annonce publiée et suivie directement par l&apos;équipe MACHINGA IMMOBILIER.
                </p>
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
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2 space-y-10">
          {listing.description && (
            <section>
              <h2 className="text-lg font-semibold text-ink mb-4">Description</h2>
              <ListingDescription text={listing.description} />
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-ink mb-4">Caractéristiques</h2>
            <dl className="grid sm:grid-cols-2 sm:gap-x-10 border-t border-gray-200 max-w-[68ch]">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 border-b border-gray-200">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {ownerOthers.length > 0 && listing.owner && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary mb-1">Du même annonceur</p>
              <h2 className="text-xl md:text-2xl font-semibold text-ink">Autres annonces de {listing.owner.nom}</h2>
            </div>
            <Link href={`/annonceurs/${listing.ownerId}`} className="text-sm font-medium text-primary hover:underline">
              Voir le profil de l&apos;annonceur &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ownerOthers.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {similarShown.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary mb-1">À découvrir aussi</p>
              <h2 className="text-xl md:text-2xl font-semibold text-ink">Annonces similaires</h2>
            </div>
            <Link
              href={{ pathname: backHref, query: { cat: listing.category } }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir toutes les annonces « {listing.category} » &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarShown.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
