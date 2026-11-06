import Link from 'next/link';
import PageHeader from '../../components/PageHeader';

export const metadata = {
  title: 'Politique de confidentialité - MACHINGA IMMOBILIER',
  description:
    'Données personnelles collectées sur le site MACHINGA IMMOBILIER, utilisation, conservation et exercice de vos droits.'
};

// Texte valide avec MACHINGA : a mettre a jour (et changer LAST_UPDATE) si le
// site collecte de nouvelles donnees ou change de prestataire.
const LAST_UPDATE = '4 novembre 2026';
const CONTACT_EMAIL = 'machingaimmobilier@gmail.com';

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

// Tableau a deux colonnes ; sur mobile, chaque ligne s'empile (intitule en
// gras au-dessus de sa valeur) pour eviter le defilement horizontal.
function Table({ head, rows }) {
  return (
    <table className="w-full border border-gray-200 text-sm">
      {head && (
        <thead className="hidden sm:table-header-group bg-offwhite text-left text-ink">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium border-b border-gray-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-gray-200">
        {rows.map((row) => (
          <tr key={row[0]} className="block sm:table-row align-top py-2 sm:py-0">
            {row.map((cell, i) => (
              <td
                key={i}
                className={`block sm:table-cell px-4 sm:py-2.5 ${i === 0 ? 'font-medium text-ink sm:w-2/5' : 'pt-0.5'}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function List({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-secondary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div>
      <PageHeader
        title="Politique de confidentialité"
        subtitle="Quelles données nous collectons, pourquoi, et comment exercer vos droits."
      />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {LAST_UPDATE}</p>

        <div className="bg-offwhite border-l-4 border-secondary px-5 py-4 mb-10 text-gray-700 leading-relaxed">
          La présente politique explique quelles données personnelles la S.C.I MACHINGA IMMOBILIER collecte sur le site
          machinga-immobilier.com, pourquoi elle les collecte, avec qui elles sont partagées, combien de temps elles sont
          conservées et comment exercer vos droits. Elle s&apos;applique à toute personne qui consulte le site, nous écrit
          via le formulaire de contact ou crée un compte propriétaire.
        </div>

        <div className="space-y-10">
          <Section title="1. Responsable du traitement">
            <Table
              rows={[
                ['Société', 'S.C.I MACHINGA IMMOBILIER'],
                ['Siège', 'Libreville, Gabon'],
                ['RCCM / NIF', 'GA-LBV-01-2026-B42-00067 / 2026010533470'],
                [
                  'Contact pour vos données',
                  <>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                      {CONTACT_EMAIL}
                    </a>{' '}
                    · +241 60 35 21 57 ·{' '}
                    <Link href="/contact" className="text-primary hover:underline">
                      formulaire de contact
                    </Link>
                  </>
                ]
              ]}
            />
            <p>
              Les traitements décrits ci-dessous sont mis en œuvre dans le respect de la loi gabonaise n°001/2011 du 25
              septembre 2011 relative à la protection des données à caractère personnel.
            </p>
          </Section>

          <Section title="2. Les données que nous collectons">
            <h3 className="font-semibold text-ink pt-1">Lorsque vous consultez le site</h3>
            <p>
              Pour mesurer la fréquentation du site, nous enregistrons les pages consultées, la page d&apos;où vous venez
              (si votre navigateur la transmet), la date et l&apos;heure de la visite, ainsi que les clics sur le bouton
              « Appeler l&apos;annonceur ». Ces informations sont rattachées à un <strong>identifiant aléatoire</strong> créé
              par votre navigateur et conservé sur votre appareil. Cet identifiant ne contient ni votre nom, ni vos
              coordonnées, et ne sert qu&apos;à compter les visiteurs. Nous ne l&apos;utilisons pas pour de la publicité.
            </p>
            <p>
              Votre navigateur conserve aussi le fait que vous avez accepté les conditions d&apos;utilisation, pour ne pas
              vous les redemander à chaque visite.
            </p>

            <h3 className="font-semibold text-ink pt-1">Lorsque vous nous écrivez</h3>
            <p>
              Le formulaire « Contactez-nous » recueille votre nom, votre adresse e-mail, votre numéro de téléphone, le
              type de transaction et de logement recherché, la ville, le quartier et votre message, ainsi que votre accord
              pour que ces données soient utilisées pour traiter votre demande.
            </p>

            <h3 className="font-semibold text-ink pt-1">Lorsque vous créez un compte propriétaire</h3>
            <List
              items={[
                <>
                  <strong>Données de compte</strong> : nom, adresse e-mail, numéro de téléphone et mot de passe. Le mot de
                  passe est enregistré sous une forme chiffrée irréversible : personne, y compris MACHINGA IMMOBILIER, ne
                  peut le lire.
                </>,
                <>
                  <strong>Données de sécurité</strong> : date d&apos;inscription, date de dernière connexion, confirmation
                  de l&apos;adresse e-mail. Les codes à 6 chiffres envoyés par e-mail sont enregistrés sous forme chiffrée
                  et expirent au bout de 15 minutes.
                </>,
                <>
                  <strong>Vos annonces</strong> : titre, description, prix, ville, quartier, caractéristiques et photos du
                  bien, leur état (en vérification, en ligne, refusée, expirée) et, le cas échéant, le motif d&apos;un
                  refus.
                </>
              ]}
            />
          </Section>

          <Section title="3. Ce qui est rendu public">
            <p>Lorsqu&apos;une de vos annonces est validée et mise en ligne, les visiteurs du site peuvent voir :</p>
            <List
              items={[
                <>
                  votre <strong>nom</strong> et votre <strong>numéro de téléphone</strong>, afin de pouvoir vous appeler au
                  sujet du bien ;
                </>,
                'le contenu de vos annonces en ligne, dont la ville, le quartier et les photos ;',
                'votre page de profil d’annonceur : nom, mois d’inscription, nombre d’annonces en ligne, secteurs et confirmation de votre e-mail.'
              ]}
            />
            <p>
              <strong>Votre adresse e-mail n&apos;est jamais publiée.</strong> Votre profil n&apos;est visible que tant
              qu&apos;au moins une de vos annonces est en ligne. Nous vous conseillons de ne pas faire figurer sur vos
              photos de personnes, de plaques d&apos;immatriculation ni de documents personnels.
            </p>
          </Section>

          <Section title="4. Pourquoi nous utilisons vos données">
            <Table
              head={['Finalité', 'Fondement']}
              rows={[
                [
                  'Créer et gérer votre compte propriétaire, vous permettre de publier, modifier, prolonger et supprimer vos annonces',
                  'Exécution des conditions d’utilisation que vous avez acceptées'
                ],
                [
                  'Vérifier les annonces avant leur publication et retirer les contenus non conformes',
                  'Intérêt légitime : garantir des annonces fiables aux visiteurs'
                ],
                [
                  'Vous envoyer les e-mails liés à votre compte : code de vérification, réinitialisation du mot de passe, publication ou refus d’une annonce',
                  'Exécution des conditions d’utilisation'
                ],
                [
                  'Répondre aux messages envoyés via le formulaire de contact',
                  'Votre consentement, donné en cochant la case du formulaire'
                ],
                [
                  'Mesurer la fréquentation du site et l’intérêt pour les annonces, sous forme de statistiques',
                  'Intérêt légitime : améliorer le site et le service'
                ],
                [
                  'Assurer la sécurité du site et des comptes (limitation des tentatives, prévention des abus)',
                  'Intérêt légitime et obligations de sécurité'
                ]
              ]}
            />
            <p>Nous n&apos;utilisons pas vos données à des fins publicitaires, nous ne les vendons pas et nous ne les louons à personne.</p>
          </Section>

          <Section title="5. Qui a accès à vos données">
            <List
              items={[
                <>
                  <strong>L&apos;équipe MACHINGA IMMOBILIER</strong> habilitée à gérer le site, via un espace
                  d&apos;administration protégé par mot de passe.
                </>,
                <>
                  <strong>Les visiteurs du site</strong>, uniquement pour les informations publiques décrites à la section 3.
                </>,
                <>
                  <strong>Nos prestataires techniques</strong>, qui agissent uniquement pour notre compte : Hostinger,
                  hébergeur du serveur et de la base de données du site et fournisseur de la messagerie des e-mails
                  automatiques ; Web3Forms, qui nous transmet par e-mail une copie des messages du formulaire de contact.
                </>,
                <>
                  <strong>Google</strong> : la page « Contactez-nous » affiche une carte Google Maps. Lorsque cette carte se
                  charge, Google peut recevoir des informations techniques sur votre navigateur, selon sa propre politique
                  de confidentialité.
                </>,
                <>
                  <strong>Les autorités</strong>, uniquement si la loi nous y oblige.
                </>
              ]}
            />
            <p>
              Certains de ces prestataires peuvent traiter des données en dehors du Gabon. Nous choisissons des
              prestataires qui offrent des garanties de sécurité reconnues.
            </p>
          </Section>

          <Section title="6. Combien de temps nous conservons vos données">
            <Table
              head={['Données', 'Durée de conservation']}
              rows={[
                [
                  'Compte propriétaire et annonces',
                  'Tant que votre compte existe. Une annonce non prolongée cesse d’être publique au bout de 60 jours mais reste dans votre espace jusqu’à ce que vous la supprimiez.'
                ],
                [
                  'Suppression du compte',
                  'Lorsque vous supprimez votre compte, votre compte, votre profil et toutes vos annonces sont effacés immédiatement.'
                ],
                ['Codes de vérification envoyés par e-mail', '15 minutes de validité ; ils ne peuvent plus être utilisés ensuite.'],
                [
                  'Messages du formulaire de contact',
                  'Le temps de traiter votre demande et d’assurer le suivi de la relation, et au plus 3 ans après notre dernier échange.'
                ],
                ['Statistiques de fréquentation', 'Au plus 25 mois.']
              ]}
            />
          </Section>

          <Section title="7. Cookies et stockage sur votre appareil">
            <p>
              Le site n&apos;utilise <strong>aucun cookie publicitaire</strong>. Il dépose uniquement les éléments
              nécessaires à son fonctionnement :
            </p>
            <Table
              head={['Élément', 'Rôle et durée']}
              rows={[
                ['Cookie de session propriétaire', 'Vous garder connecté à votre espace propriétaire. 30 jours, ou jusqu’à la déconnexion.'],
                ['Cookie de session administrateur', 'Réservé à l’équipe MACHINGA IMMOBILIER. 8 heures, ou jusqu’à la déconnexion.'],
                ['Acceptation des conditions', 'Ne pas vous redemander d’accepter les conditions d’utilisation. Conservé sur votre appareil.'],
                ['Identifiant de visite aléatoire', 'Compter les visiteurs pour les statistiques. Conservé sur votre appareil.']
              ]}
            />
            <p>
              Vous pouvez effacer ces éléments à tout moment depuis les réglages de votre navigateur (« Effacer les données
              de navigation »). Vous devrez alors accepter de nouveau les conditions d&apos;utilisation et vous reconnecter
              à votre espace.
            </p>
          </Section>

          <Section title="8. Sécurité">
            <p>
              Le site est accessible uniquement en connexion chiffrée (HTTPS). Les mots de passe et les codes de
              vérification sont enregistrés sous forme chiffrée. Le nombre de tentatives de saisie d&apos;un code est
              limité. L&apos;accès à l&apos;administration est réservé à l&apos;équipe habilitée. Aucune mesure de
              sécurité n&apos;étant infaillible, nous vous recommandons de choisir un mot de passe propre à ce site et de
              ne jamais le communiquer.
            </p>
          </Section>

          <Section title="9. Vos droits">
            <p>Vous disposez des droits suivants sur vos données :</p>
            <List
              items={[
                <>
                  <strong>Accès</strong> : savoir quelles données nous détenons sur vous et en obtenir une copie ;
                </>,
                <>
                  <strong>Rectification</strong> : corriger des données inexactes. Vous pouvez modifier vous-même votre nom
                  et votre téléphone dans « Mon compte » ;
                </>,
                <>
                  <strong>Suppression</strong> : supprimer vos annonces ou votre compte vous-même depuis votre espace, ou
                  nous demander l&apos;effacement de vos données ;
                </>,
                <>
                  <strong>Opposition</strong> : vous opposer à un traitement fondé sur notre intérêt légitime, pour un motif
                  tenant à votre situation ;
                </>,
                <>
                  <strong>Retrait du consentement</strong> pour les messages envoyés via le formulaire de contact.
                </>
              ]}
            />
            <p>
              Pour exercer ces droits, écrivez-nous à{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>{' '}
              ou via le{' '}
              <Link href="/contact" className="text-primary hover:underline">
                formulaire de contact
              </Link>
              , en précisant l&apos;adresse e-mail de votre compte le cas échéant. Nous pourrons vous demander de justifier
              de votre identité. Nous vous répondrons dans un délai d&apos;un mois.
            </p>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la{' '}
              <strong>Commission Nationale pour la Protection des Données à Caractère Personnel (CNPDCP)</strong>,
              autorité de contrôle au Gabon.
            </p>
          </Section>

          <Section title="10. Mineurs">
            <p>
              La création d&apos;un compte propriétaire et la publication d&apos;annonces sont réservées aux personnes
              majeures. La consultation des annonces est libre.
            </p>
          </Section>

          <Section title="11. Modification de cette politique">
            <p>
              Nous pouvons modifier cette politique, notamment en cas d&apos;évolution du site ou de la réglementation. La
              date de dernière mise à jour figure en haut de cette page. En cas de changement important, nous vous en
              informerons sur le site ou par e-mail si vous avez un compte.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
