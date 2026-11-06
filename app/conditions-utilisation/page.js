import PageHeader from '../../components/PageHeader';

export const metadata = {
  title: "Conditions d'utilisation - MACHINGA IMMOBILIER",
  description: "Conditions d'utilisation du site MACHINGA IMMOBILIER et de son espace propriétaire."
};

// Si le texte change apres la mise en ligne, incrementer TERMS_VERSION dans
// components/TermsGate.js pour que chaque visiteur l'accepte de nouveau.
const SECTIONS = [
  {
    title: '1. Objet',
    body: [
      "Les présentes conditions encadrent l'utilisation du site MACHINGA IMMOBILIER, édité par la S.C.I MACHINGA IMMOBILIER (Libreville, Gabon), par les visiteurs et par les propriétaires qui y publient des annonces."
    ]
  },
  {
    title: '2. Accès au site',
    body: [
      "La consultation des annonces est libre et gratuite. La publication d'annonces nécessite la création d'un compte propriétaire gratuit, avec un numéro de téléphone valide."
    ]
  },
  {
    title: '3. Annonces publiées par les propriétaires',
    body: [
      "Le propriétaire garantit l'exactitude des informations et des photos qu'il publie, ainsi que son droit à proposer le bien à la location.",
      "Chaque annonce est vérifiée par MACHINGA IMMOBILIER avant sa mise en ligne. MACHINGA IMMOBILIER peut refuser, suspendre ou retirer toute annonce, à tout moment.",
      "Les échanges et accords entre visiteurs et propriétaires se font directement entre eux."
    ]
  },
  {
    title: '4. Données personnelles',
    body: [
      "Le nom et le numéro de téléphone du propriétaire sont affichés sur ses annonces publiées afin que les visiteurs puissent le contacter. L'adresse e-mail n'est jamais publiée.",
      "Le propriétaire peut modifier ses informations ou supprimer ses annonces depuis son espace.",
      "Le détail des données collectées, de leur utilisation et de vos droits figure dans la politique de confidentialité, accessible en bas de chaque page du site."
    ]
  },
  {
    title: '5. Contact',
    body: ['Pour toute question concernant ces conditions, utilisez la page Contactez-nous du site.']
  }
];

export default function ConditionsPage() {
  return (
    <div>
      <PageHeader title="Conditions d'utilisation" />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-ink mb-3">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-gray-700 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
