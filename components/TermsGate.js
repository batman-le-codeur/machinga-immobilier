'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Version des conditions : a incrementer quand le texte change, pour que
// chaque visiteur les accepte de nouveau.
const TERMS_VERSION = '2';
const STORAGE_KEY = 'machinga_cgu_acceptees';

const PRECAUTIONS = [
  "Prenez le temps de vous renseigner sur l'identité de l'annonceur et sa qualité de propriétaire ou de mandataire.",
  'Visitez systématiquement le bien immobilier avant tout engagement.',
  "Vérifiez l'existence du bien, son état réel ainsi que les documents administratifs et juridiques qui s'y rapportent.",
  "Ne versez aucune somme d'argent avant d'avoir visité le bien et effectué les vérifications nécessaires.",
  'Ne vous fiez pas uniquement aux photographies, aux descriptions ou aux informations communiquées dans une annonce.'
];

function SectionTitle({ children }) {
  return <h3 className="text-xs font-semibold uppercase tracking-widest text-ink mb-3">{children}</h3>;
}

// Fenetre d'accueil et d'acceptation des conditions d'utilisation, affichee a
// la premiere visite. Le choix est memorise dans le navigateur du visiteur.
export default function TermsGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let accepted = false;
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === TERMS_VERSION;
    } catch {
      // Stockage indisponible (navigation privee stricte) : on affiche la fenetre.
    }
    setOpen(!accepted);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Les pages des conditions et de confidentialite doivent rester lisibles, et
  // l'admin n'est pas concerne.
  const exempt =
    pathname.startsWith('/conditions-utilisation') ||
    pathname.startsWith('/politique-confidentialite') ||
    pathname.startsWith('/admin');
  if (!open || exempt) return null;

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
    } catch {
      // Sans stockage, l'acceptation vaut pour cette visite uniquement.
    }
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col border border-gray-200 border-t-4 border-t-primary bg-white shadow-2xl animate-fade-in-up">
        {/* En-tete */}
        <div className="border-b border-gray-200 px-6 pt-6 pb-5 text-center sm:px-8">
          <div className="mb-4 flex justify-center">
            <Image src="/logo-full.svg" alt="Machinga Immobilier" width={227} height={69} className="h-10 w-auto" />
          </div>
          <h2 id="terms-title" className="text-lg font-semibold uppercase tracking-wide text-ink sm:text-xl">
            Bienvenue sur MACHINGA IMMOBILIER
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Une plateforme pour faciliter votre accès aux opportunités immobilières au Gabon.
          </p>
        </div>

        {/* Contenu (defile si l'ecran est petit) */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-gray-600 sm:px-8">
          <p>
            MACHINGA Immobilier est une plateforme de publication et de mise en relation immobilière.
            Elle permet aux propriétaires, particuliers et professionnels de publier leurs annonces
            immobilières, sous réserve du respect de nos conditions de mise en ligne.
          </p>

          <section className="border border-gray-200 border-l-2 border-l-primary bg-offwhite p-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-primary" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 9v4.5M10 6.5v.01" strokeLinecap="round" />
              </svg>
              Important : restez vigilants avant toute transaction
            </h3>
            <p className="mb-3">
              Afin de préserver votre sécurité et d&apos;éviter toute tentative d&apos;escroquerie, nous
              vous invitons à respecter les précautions suivantes :
            </p>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {PRECAUTIONS.map((item) => (
                <li key={item} className="flex gap-3 py-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle>Notre responsabilité</SectionTitle>
            <div className="space-y-3">
              <p>
                MACHINGA Immobilier intervient exclusivement en qualité de plateforme de publication et
                de mise en relation. Les annonces sont publiées par des annonceurs indépendants, qui
                demeurent responsables des informations qu&apos;ils communiquent.
              </p>
              <p>
                Sauf mandat ou intervention contractuelle spécifique, MACHINGA Immobilier n&apos;est ni
                vendeur, ni bailleur, ni acquéreur, ni partie aux transactions conclues entre les
                utilisateurs.
              </p>
              <p>
                En conséquence, MACHINGA Immobilier ne saurait être tenue responsable des actes
                frauduleux, fausses déclarations ou engagements pris directement entre les utilisateurs,
                dans les limites prévues par la législation applicable.
              </p>
            </div>
          </section>

          <p className="border-y border-gray-200 py-4 text-center text-sm font-semibold uppercase tracking-wide text-primary">
            Votre sécurité est aussi votre responsabilité.
          </p>

          <p>
            En poursuivant votre navigation, vous reconnaissez avoir pris connaissance de ces
            informations, comprendre le fonctionnement de la plateforme et vous engager à effectuer vos
            propres vérifications avant toute transaction. Consultez nos{' '}
            <Link href="/conditions-utilisation" className="font-medium text-primary underline">
              conditions d&apos;utilisation
            </Link>
            . Notre{' '}
            <Link href="/politique-confidentialite" className="font-medium text-primary underline">
              politique de confidentialité
            </Link>{' '}
            explique comment vos données sont utilisées.
          </p>
        </div>

        {/* Pied : action toujours visible */}
        <div className="border-t border-gray-200 bg-offwhite px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={accept}
            autoFocus
            className="w-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-offwhite"
          >
            J&apos;ai compris et j&apos;accepte les conditions d&apos;utilisation
          </button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-gray-400">
            MACHINGA IMMOBILIER, l&apos;immobilier digital
          </p>
        </div>
      </div>
    </div>
  );
}
