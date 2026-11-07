import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin, toListingDTO } from '../../../../../lib/supabaseAdmin';
import { toOwnerDTO } from '../../../../../lib/owners';
import ListingCard from '../../../../../components/ListingCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Propriétaire - Administration MACHINGA IMMOBILIER',
  robots: { index: false, follow: false }
};

const MODERATION = {
  en_attente: { label: 'À valider', className: 'bg-amber-50 border-amber-200 text-amber-800' },
  publiee: { label: 'En ligne', className: 'bg-green-50 border-green-200 text-green-800' },
  refusee: { label: 'Refusée', className: 'bg-red-50 border-red-200 text-red-700' },
  expiree: { label: 'Expirée', className: 'bg-gray-100 border-gray-300 text-gray-600' }
};

function stateOf(l) {
  if (l.moderation === 'publiee' && l.expireLe && new Date(l.expireLe) < new Date()) return 'expiree';
  return l.moderation;
}

// Fiche d'un proprietaire pour l'admin (page protegee par le middleware) :
// son profil tel que les visiteurs le voient sur ses annonces, ses
// coordonnees completes et toutes ses annonces, quel que soit leur etat.
export default async function OwnerAdminPage({ params }) {
  const supabase = getSupabaseAdmin();
  const [{ data: ownerRow }, { data: rows }] = await Promise.all([
    supabase.from('owners').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('listings').select('*').eq('owner_id', params.id).order('date_ajout', { ascending: false })
  ]);
  if (!ownerRow) notFound();

  const owner = toOwnerDTO(ownerRow);
  const listings = (rows || []).map((r) => ({ ...toListingDTO(r), owner: { nom: owner.nom, telephone: owner.telephone } }));
  const counts = listings.reduce((acc, l) => ({ ...acc, [stateOf(l)]: (acc[stateOf(l)] || 0) + 1 }), {});
  const initials = owner.nom
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const memberSince = new Date(owner.dateInscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-primary">
        &larr; Retour au tableau de bord
      </Link>

      <div className="grid gap-6 lg:grid-cols-3 mt-6 mb-12">
        {/* Ce que voit un visiteur */}
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Vu par les visiteurs</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white text-lg font-semibold">
              {initials}
            </span>
            <div>
              <p className="text-lg font-semibold text-ink">{owner.nom}</p>
              <p className="text-sm text-gray-500">Propriétaire particulier · membre depuis {memberSince}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Téléphone affiché sur ses annonces : <span className="font-medium text-ink">{owner.telephone}</span>
          </p>
          {counts.publiee > 0 ? (
            <a
              href={`/annonceurs/${owner.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ouvrir son profil public &rarr;
            </a>
          ) : (
            <p className="mt-4 text-xs text-gray-400">Pas de profil public : aucune annonce en ligne.</p>
          )}
        </div>

        {/* Informations reservees a l'admin */}
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Coordonnées (admin uniquement)</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd>
                <a href={`mailto:${owner.email}`} className="text-primary hover:underline">
                  {owner.email}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email vérifié</dt>
              <dd className={owner.emailVerifie ? 'text-green-700' : 'text-amber-700'}>
                {owner.emailVerifie ? 'Oui' : 'Non'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Téléphone</dt>
              <dd>
                <a href={`tel:${owner.telephone.replace(/[^\d+]/g, '')}`} className="text-primary hover:underline">
                  {owner.telephone}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Inscription</dt>
              <dd>{new Date(owner.dateInscription).toLocaleDateString('fr-FR')}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Ses annonces</p>
          <p className="text-3xl font-semibold text-ink mb-3">{listings.length}</p>
          <ul className="space-y-1.5 text-sm">
            {['en_attente', 'publiee', 'expiree', 'refusee'].map((key) => (
              <li key={key} className="flex justify-between">
                <span className="text-gray-500">{MODERATION[key].label}</span>
                <span className="font-medium tabular-nums">{counts[key] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Annonces de {owner.nom}</h2>
      {listings.length === 0 ? (
        <p className="text-gray-500 border border-dashed border-gray-300 p-8 text-center">
          Ce propriétaire n&apos;a encore déposé aucune annonce.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const state = MODERATION[stateOf(l)];
            return (
              <div key={l.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 border ${state.className}`}>{state.label}</span>
                  <span className="text-xs text-gray-400">
                    Déposée le {new Date(l.dateAjout).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <ListingCard listing={l} />
                </div>
                {l.moderation === 'refusee' && l.motifRefus && (
                  <p className="text-xs text-red-700 mt-2">Motif du refus : {l.motifRefus}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
