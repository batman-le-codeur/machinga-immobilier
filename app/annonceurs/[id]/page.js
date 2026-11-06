import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicOwnerProfile } from '../../../lib/publicData';
import ListingCard from '../../../components/ListingCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const profile = await getPublicOwnerProfile(params.id);
  if (!profile) return { title: 'Annonceur introuvable - MACHINGA IMMOBILIER' };
  const n = profile.listings.length;
  return {
    title: `${profile.owner.nom} - Annonceur particulier | MACHINGA IMMOBILIER`,
    description: `${n} annonce${n > 1 ? 's' : ''} de location publiée${n > 1 ? 's' : ''} par ${profile.owner.nom} sur MACHINGA IMMOBILIER, vérifiée${n > 1 ? 's' : ''} par notre équipe.`
  };
}

// Profil public d'un proprietaire particulier : ses coordonnees et toutes
// ses annonces en ligne.
export default async function AnnonceurPage({ params }) {
  const profile = await getPublicOwnerProfile(params.id);
  if (!profile) notFound();

  const { owner, listings } = profile;
  const initials = owner.nom
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const memberSince = new Date(owner.dateInscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const quartiers = [...new Set(listings.map((l) => l.quartier || l.localisation).filter(Boolean))].slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/locations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        &larr; Retour aux locations
      </Link>

      <section className="rounded-md border border-gray-200 bg-white p-6 md:p-8 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-white">
              {initials}
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary mb-1">Annonceur particulier</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-ink">{owner.nom}</h1>
              <p className="text-sm text-gray-500 mt-1">Membre depuis {memberSince}</p>
            </div>
          </div>
          <a
            href={`tel:${owner.telephone.replace(/[^\d+]/g, '')}`}
            className="flex items-center gap-3 rounded-md bg-secondary px-6 py-3 text-white transition-colors hover:bg-secondary-light"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="leading-tight">
              <span className="block text-xs text-white/80">Appeler l&apos;annonceur</span>
              <span className="block font-semibold whitespace-nowrap">{owner.telephone}</span>
            </span>
          </a>
        </div>

        <ul className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100 text-sm">
          <li className="rounded-full bg-offwhite border border-gray-200 px-3 py-1 text-ink">
            {listings.length} annonce{listings.length > 1 ? 's' : ''} en ligne
          </li>
          {owner.emailVerifie && (
            <li className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-green-800">
              &#10003; E-mail vérifié
            </li>
          )}
          <li className="rounded-full bg-offwhite border border-gray-200 px-3 py-1 text-ink">
            Annonces vérifiées par MACHINGA
          </li>
          {quartiers.length > 0 && (
            <li className="rounded-full bg-offwhite border border-gray-200 px-3 py-1 text-gray-600">
              Secteurs : {quartiers.join(', ')}
            </li>
          )}
        </ul>
      </section>

      <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
        Les annonces de {owner.nom}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-10 max-w-2xl leading-relaxed">
        Les annonces de particuliers sont vérifiées par MACHINGA IMMOBILIER avant leur publication. Les échanges et
        accords se font directement entre vous et l&apos;annonceur.
      </p>
    </div>
  );
}
