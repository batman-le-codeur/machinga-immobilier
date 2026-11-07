import Link from 'next/link';
import Image from 'next/image';
import { getListings, countVisibleListings } from '../lib/publicData';
import ListingCard from '../components/ListingCard';
import CertifiedBadge from '../components/CertifiedBadge';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import Reveal from '../components/Reveal';
import SearchBar from '../components/SearchBar';
import ParallaxBg from '../components/ParallaxBg';
import SocialLinks from '../components/SocialLinks';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { label: 'Chambres/Studios', href: '/locations?cat=Chambres/Studios' },
  { label: 'Apparts/Maisons à louer', href: '/locations?cat=Apparts/Maisons' },
  { label: 'Meublés', href: '/locations?cat=Meublés' },
  { label: 'Locaux com./bureaux à louer', href: '/locations?cat=Locaux com./bureaux' },
  { label: 'Terrains', href: '/ventes?cat=Terrains' },
  { label: 'Apparts/Maisons à vendre', href: '/ventes?cat=Apparts/Maisons' },
  { label: 'Locaux com./bureaux à vendre', href: '/ventes?cat=Locaux com./bureaux' },
  { label: 'Objets divers', href: '/ventes?cat=Objets divers' }
];

const OWNER_STEPS = [
  ['Créez votre compte', 'Gratuit, en une minute.'],
  ['Déposez votre annonce', 'Photos, loyer et quartier.'],
  ['Nous la vérifions', 'Puis elle est mise en ligne.']
];

export default async function HomePage() {
  const [machingaListings, ownerListings, totalListings] = await Promise.all([
    getListings({ source: 'machinga', limit: 6 }),
    getListings({ source: 'particulier', limit: 3 }),
    countVisibleListings()
  ]);

  // Chiffres reels uniquement (le nombre de biens vient de la base).
  const stats = [
    ...(totalListings > 0 ? [[String(totalListings), 'biens disponibles']] : []),
    ['100 %', 'annonces vérifiées'],
    ['0 FCFA', 'pour créer son compte']
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <ParallaxBg src="/page-header-bg.png" />
        {/* Voiles : sombre a gauche pour le texte, l'image reste visible a droite */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/85 to-primary-dark/60 lg:to-primary-dark/25" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-primary-dark from-50% to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-32 lg:min-h-[78vh] grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-widest text-[#BFD6C0] mb-6 animate-fade-in-up">
              L&apos;immobilier digital à Libreville
            </p>
            <h1
              className="mb-8 tracking-tight animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <span className="block text-[2.1rem] sm:text-5xl lg:text-5xl font-semibold leading-[1.12] text-white text-balance">
                Trouvez le bien immobilier
                <br />
                de vos rêves.
              </span>
              <span aria-hidden="true" className="mt-6 block h-px w-16 bg-[#BFD6C0]/60" />
            </h1>
            <p
              className="text-white/75 text-base md:text-lg font-light max-w-xl leading-relaxed mb-10 animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              MACHINGA est un rêve qui prend racine pour devenir réalité : bâtir là où l&apos;on
              n&apos;osait plus espérer, et faire naître des foyers là où il n&apos;y avait que des
              espaces vides.
            </p>

            <div
              className="flex flex-wrap gap-3 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/compte?publier=1"
                className="inline-flex items-center gap-2 bg-secondary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-secondary-light"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10 3v14M3 10h14" />
                </svg>
                Publier mon bien
              </Link>
              <Link
                href="/locations"
                className="bg-white px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-offwhite"
              >
                Voir les locations
              </Link>
              <Link
                href="/ventes"
                className="border border-white/40 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Voir les ventes
              </Link>
            </div>

            <dl
              className="mt-14 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6 animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              {stats.map(([value, label]) => (
                <div key={label} className="flex flex-col px-4 first:pl-0">
                  <dt className="order-2 mt-1 text-xs text-white/60">{label}</dt>
                  <dd className="order-1 text-2xl md:text-3xl font-light">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Carte proprietaire : appel direct a la publication */}
          {/* L'animation porte sur la carte elle-meme (un parent anime annule le
              flou) ; fill-mode backwards libere la transformation une fois
              l'entree terminee, pour permettre l'effet au survol. */}
          <div className="hidden lg:block lg:col-span-5 lg:pl-6">
            <div
              className="border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-white/40 hover:bg-white/[0.16] hover:shadow-black/40 animate-fade-in-up"
              style={{ animationDelay: '350ms', animationFillMode: 'backwards' }}
            >
              <p className="text-xs uppercase tracking-widest text-[#BFD6C0] mb-3">Propriétaires</p>
              <h2 className="text-2xl font-light leading-snug mb-8">
                Mettez votre bien en location sur <span className="font-semibold">MACHINGA</span>
              </h2>
              <ol className="mb-8 divide-y divide-white/15 border-y border-white/15">
                {OWNER_STEPS.map(([title, text], i) => (
                  <li key={title} className="flex gap-5 py-4">
                    <span className="w-4 shrink-0 text-sm text-white/50">{i + 1}</span>
                    <span>
                      <span className="block font-medium">{title}</span>
                      <span className="block text-sm font-light text-white/60">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href="/compte?publier=1"
                className="block w-full bg-white px-6 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-offwhite"
              >
                Publier mon bien maintenant
              </Link>
              <p className="mt-4 text-center text-xs text-white/55">
                Déjà inscrit ?{' '}
                <Link href="/compte/connexion?publier=1" className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche flottante, à cheval sur le hero et le contenu */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 -mt-7 md:-mt-8">
        <SearchBar />
      </div>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        <Reveal as="h2" className="text-2xl font-semibold mb-8">
          Catégories
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 60} className="h-full">
              <Link
                href={cat.href}
                className={`flex h-full items-center border border-gray-200 border-t-4 ${
                  i % 2 === 0 ? 'border-t-primary' : 'border-t-secondary'
                } p-5 transition-all hover:-translate-y-1 hover:shadow-md`}
              >
                <span className="text-ink font-medium">{cat.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Selection MACHINGA (annonces certifiees) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary mb-2">
              <CertifiedBadge label="Certifié" />
              Publiées et suivies par notre équipe
            </p>
            <h2 className="text-2xl font-semibold">La sélection MACHINGA</h2>
          </div>
          <Link href="/locations?source=machinga" className="text-sm font-medium text-primary hover:underline">
            Toutes les annonces certifiées
          </Link>
        </Reveal>
        {machingaListings.length === 0 ? (
          <p className="text-gray-500">
            Aucune annonce publiée pour le moment. Revenez bientôt.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {machingaListings.map((listing, i) => (
              <Reveal key={listing.id} delay={i * 80} className="h-full min-w-0">
                <ListingCard listing={listing} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Annonces de particuliers */}
      {ownerListings.length > 0 && (
        <section className="bg-offwhite">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <Reveal className="flex flex-wrap items-end justify-between gap-3 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">
                  Vérifiées par MACHINGA avant publication
                </p>
                <h2 className="text-2xl font-semibold">Annonces de particuliers</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/locations?source=particulier" className="text-sm font-medium text-primary hover:underline">
                  Toutes les annonces de particuliers
                </Link>
                <Link
                  href="/compte?publier=1"
                  className="bg-secondary text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary-light"
                >
                  Publier mon bien
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ownerListings.map((listing, i) => (
                <Reveal key={listing.id} delay={i * 80} className="h-full min-w-0">
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Affiche promotionnelle */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="mx-auto max-w-md lg:mx-0">
            <div className="border border-gray-200 overflow-hidden transition-all hover:shadow-xl">
              <Image
                src="/affiche-services.jpg"
                alt="Machinga Immobilier, nos services : annonces gratuites, achat et vente, location, gestion de biens"
                width={1024}
                height={1280}
                sizes="(min-width: 1024px) 448px, (min-width: 768px) 448px, 90vw"
                className="w-full h-auto"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="uppercase tracking-widest text-sm text-secondary mb-3">Offre du moment</p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-snug">
              30% sur les frais de commission et visite gratuite
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Contactez-nous directement par le canal de votre choix, notre équipe vous répond
              rapidement.
            </p>
            <SocialLinks variant="light" />
            <Link
              href="/contact"
              className="inline-block mt-8 bg-primary text-white px-6 py-3 text-sm font-medium transition-all hover:bg-primary-light hover:-translate-y-0.5"
            >
              Nous contacter
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <Reveal as="h2" className="text-2xl font-semibold mb-8">
          Questions fréquentes
        </Reveal>
        <Reveal delay={100}>
          <FAQ />
        </Reveal>
      </section>

      {/* Témoignages */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Reveal as="h2" className="text-2xl font-semibold mb-8">
          Ils nous font confiance
        </Reveal>
        <Reveal delay={100}>
          <Testimonials />
        </Reveal>
      </section>
    </div>
  );
}
