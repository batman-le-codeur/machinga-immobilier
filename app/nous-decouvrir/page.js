import Reveal from '../../components/Reveal';
import PageHeader from '../../components/PageHeader';
import SocialLinks from '../../components/SocialLinks';

const SERVICES = [
  {
    nom: 'Annonces (publication de biens)',
    taux: 'Gratuit',
    detail: 'Chambres, studios, appartements, meublés, maisons, locaux commerciaux et immeubles.',
    inclus: ['État des lieux', 'Vérifications diverses', 'Prise d’images', 'Pose d’affiches']
  },
  {
    nom: 'Gestion locative',
    taux: 'Sur devis',
    detail: 'Frais de mise en location inclus, sur tous types de biens.',
    inclus: [
      'Visites gratuites',
      'Collecte des loyers',
      'Rédaction des documents',
      'Conseils juridiques',
      'Suivi entretien et réparations',
      'Rapport mensuel au propriétaire',
      'Gestion des contentieux',
      'Renouvellement des baux'
    ]
  },
  {
    nom: 'Aide au déménagement',
    taux: 'Sur devis',
    detail: 'Y compris les cas de déménagement rapide.',
    inclus: ['Organisation du déménagement', 'Transport de biens', 'Emballage et protection', 'Logistique complète']
  },
  {
    nom: 'Assistance juridique',
    taux: 'Incluse',
    detail: "Accompagnement à chaque étape d'une acquisition immobilière.",
    inclus: [
      "Assistance démarches d'acquisition",
      'Accompagnement notaire',
      'Vérification des documents',
      "Conseil en investissement"
    ]
  },
  {
    nom: 'Achat/Vente',
    taux: '10%',
    detail:
      "Commission sur la valeur du bien, payable à la signature de l'acte de vente, pour tout type de bien (terrain, maison, appartement, local commercial).",
    inclus: ['Recherche de biens', 'Négociation', 'Visites accompagnées', 'Suivi jusqu’à la signature de l’acte']
  },
  { nom: 'Estimation', taux: 'Gratuite', detail: '', inclus: [] }
];

const PILIERS = [
  {
    titre: "L'obsession du client",
    texte: 'Chaque décision est prise avec votre satisfaction comme priorité.'
  },
  {
    titre: "L'excellence opérationnelle",
    texte: 'Des processus rigoureux pour un service impeccable.'
  },
  {
    titre: "L'innovation continue",
    texte: "Nous anticipons les évolutions du marché immobilier."
  },
  {
    titre: "L'esprit entrepreneurial",
    texte: 'Agilité et réactivité face aux défis.'
  },
  {
    titre: 'La recherche de résultats',
    texte: 'Notre succès se mesure à vos réalisations.'
  }
];

export default function NousDecouvrirPage() {
  return (
    <div>
      <PageHeader
        title="Nous découvrir"
        subtitle="Qui nous sommes, nos services, notre philosophie et le mot de notre fondateur."
      />
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
      <Reveal as="section">
        <h2 className="text-2xl font-semibold mb-6">Qui sommes-nous ?</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            S.C.I MACHINGA IMMOBILIER est une entreprise immobilière engagée à rendre
            l&apos;accès au logement plus simple, plus sûr et plus accessible à tous.
          </p>
          <p>
            Nous accompagnons nos clients dans la recherche de biens immobiliers,
            l&apos;organisation de leurs déménagements ainsi que dans leurs démarches
            administratives, afin de leur garantir des transactions fiables et conformes à la
            réglementation en vigueur.
          </p>
          <p>
            Convaincus que chacun mérite un logement de qualité, nous mettons tout en œuvre pour
            lever les obstacles liés à l&apos;accès à l&apos;immobilier. Grâce à des solutions
            adaptées, des coûts maîtrisés et un accompagnement personnalisé, nous permettons à
            nos clients de concrétiser leurs projets en toute sérénité.
          </p>
          <p>
            Chez MACHINGA IMMOBILIER, notre ambition est de bâtir une relation de confiance
            durable avec chaque client en offrant un service fondé sur le professionnalisme, la
            transparence, l&apos;intégrité et l&apos;excellence.
          </p>
          <p className="text-primary font-medium">
            Parce que votre projet mérite plus qu&apos;un simple service, nous nous engageons à
            en faire une véritable réussite.
          </p>
        </div>
      </Reveal>

      <Reveal as="section">
        <h2 className="text-2xl font-semibold mb-6">Découvrez-nous en vidéo</h2>
        <video
          controls
          preload="none"
          poster="/decouvrir-video-poster.jpg"
          className="w-full aspect-video border border-gray-200 bg-black"
        >
          <source src="/decouvrir-video.mp4" type="video/mp4" />
        </video>
      </Reveal>

      <Reveal as="section">
        <h2 className="text-2xl font-semibold mb-6">Nos services</h2>
        <div className="space-y-4">
          {SERVICES.map((s, i) => (
            <div
              key={s.nom}
              className={`border border-gray-200 border-l-4 ${
                i % 2 === 0 ? 'border-l-primary' : 'border-l-secondary'
              } p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-medium text-ink">{s.nom}</span>
                <span className="text-secondary font-medium text-sm shrink-0">{s.taux}</span>
              </div>
              {s.detail && <p className="text-sm text-gray-600 mb-3">{s.detail}</p>}
              {s.inclus.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {s.inclus.map((item) => (
                    <li
                      key={item}
                      className="text-xs px-2.5 py-1 bg-offwhite border border-gray-200 text-gray-600"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section">
        <h2 className="text-2xl font-semibold mb-2">Notre philosophie</h2>
        <p className="text-gray-600 mb-6">
          Nous croyons qu&apos;une entreprise ne grandit durablement que lorsqu&apos;elle place
          ses clients au centre de toutes ses actions.
        </p>
        <ol className="grid gap-4 sm:grid-cols-2">
          {PILIERS.map((p, i) => (
            <li
              key={p.titre}
              className="group border border-gray-200 p-5 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-110 ${
                  i % 2 === 0 ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-ink font-medium mb-1">{p.titre}</p>
                <p className="text-sm text-gray-600">{p.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section">
        <h2 className="text-2xl font-semibold mb-6">Mot du Fondateur</h2>
        <div className="relative space-y-4 text-gray-700 leading-relaxed border-l-2 border-secondary pl-6">
          <span className="absolute -left-2 -top-4 text-6xl text-secondary/20 font-serif select-none" aria-hidden="true">
            &laquo;
          </span>
          <p>
            Depuis toujours, l&apos;immobilier représente pour moi bien plus qu&apos;une simple
            activité économique. C&apos;est un moyen de bâtir, de créer de la valeur durable et
            de participer au développement des communautés. Chaque terrain, chaque maison et
            chaque projet immobilier porte en lui une histoire, une ambition et l&apos;espoir
            d&apos;un avenir meilleur.
          </p>
          <p>
            Notre vision place le client au cœur de toutes nos actions. Nous croyons que
            l&apos;immobilier doit être accessible, transparent et fondé sur la confiance. Notre
            engagement est d&apos;accompagner chaque client avec professionnalisme, écoute et
            intégrité.
          </p>
          <p>
            Pour l&apos;avenir, nous aspirons à construire une entreprise reconnue pour son
            excellence, son innovation et son impact positif sur la société.
          </p>
          <p className="text-ink font-medium pt-2">- Fondateur de S.C.I MACHINGA IMMOBILIER</p>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-8 sm:grid-cols-2 border-t border-gray-200 pt-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Informations légales</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>RCCM : GA-LBV-01-2026-B42-00067</li>
            <li>NIF : 2026010533470</li>
            <li>Adresse : Après l&apos;Union, Libreville - GABON</li>
            <li>BP : 8521</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Horaires</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Lun - Ven : 8h30 - 16h30</li>
            <li>Sam : 9h - 12h</li>
            <li>Dim : Fermé</li>
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className="border-t border-gray-200 pt-12">
        <h2 className="text-xl font-semibold mb-4">Nous suivre</h2>
        <SocialLinks variant="light" />
      </Reveal>
      </div>
    </div>
  );
}
