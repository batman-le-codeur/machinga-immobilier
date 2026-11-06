import Link from 'next/link';
import Image from 'next/image';
import { getListings } from '../lib/publicData';
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

export default async function HomePage() {
  const [machingaListings, ownerListings] = await Promise.all([
    getListings({ source: 'machinga', limit: 6 }),
    getListings({ source: 'particulier', limit: 3 })
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <ParallaxBg src="/page-header-bg.png" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/55" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <p className="uppercase tracking-widest text-sm text-secondary-light mb-4 animate-fade-in-up">
            L&apos;immobilier digital
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold leading-tight max-w-2xl mb-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Trouvez le bien immobilier de vos rêves.
          </h1>
          <p
            className="text-white/80 max-w-xl leading-relaxed mb-8 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            MACHINGA est un rêve qui prend racine pour devenir réalité - bâtir là où l&apos;on
            n&apos;osait plus espérer, et faire naître des foyers là où il n&apos;y avait que des
            espaces vides.
          </p>
          <div
            className="flex flex-wrap gap-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link
              href="/locations"
              className="bg-white text-primary px-6 py-3 text-sm font-medium transition-all hover:bg-offwhite hover:-translate-y-0.5 hover:shadow-lg"
            >
              Voir les locations
            </Link>
            <Link
              href="/ventes"
              className="border border-white/40 px-6 py-3 text-sm font-medium transition-all hover:bg-white/10 hover:-translate-y-0.5"
            >
              Voir les ventes
            </Link>
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
            Toutes les annonces certifiées &rarr;
          </Link>
        </Reveal>
        {machingaListings.length === 0 ? (
          <p className="text-gray-500">
            Aucune annonce publiée pour le moment. Revenez bientôt.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {machingaListings.map((listing, i) => (
              <Reveal key={listing.id} delay={i * 80} className="h-full">
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
                  Toutes les annonces de particuliers &rarr;
                </Link>
                <Link
                  href="/compte"
                  className="bg-secondary text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary-light"
                >
                  Publier mon bien
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ownerListings.map((listing, i) => (
                <Reveal key={listing.id} delay={i * 80} className="h-full">
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
                src="/affiche.jpg"
                alt="Machinga Immobilier - 30% sur les frais de commission, visite gratuite"
                width={1100}
                height={1375}
                sizes="(min-width: 1024px) 448px, (min-width: 768px) 448px, 90vw"
                className="w-full h-auto"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="uppercase tracking-widest text-sm text-secondary mb-3">Offre du moment</p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-snug">
              30% sur les frais de commission - visite gratuite
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
