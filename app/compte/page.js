import { redirect } from 'next/navigation';
import { getCurrentOwner } from '../../lib/owners';
import { getSupabaseAdmin, toListingDTO } from '../../lib/supabaseAdmin';
import OwnerSpace from '../../components/compte/OwnerSpace';
import AuthShell from '../../components/compte/AuthShell';
import { VerifyEmailForm } from '../../components/compte/AuthForms';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mon espace propriétaire - MACHINGA IMMOBILIER'
};

export default async function ComptePage({ searchParams }) {
  // ?publier=1 : bouton "Publier mon bien" de l'accueil, ouvre directement le
  // formulaire de depot (apres inscription ou connexion si besoin).
  const publier = searchParams?.publier === '1';
  const owner = await getCurrentOwner();
  if (!owner) redirect(publier ? '/compte/inscription?publier=1' : '/compte/connexion');

  if (!owner.emailVerifie) {
    return (
      <AuthShell title="Confirmez votre adresse e-mail">
        <VerifyEmailForm email={owner.email} />
      </AuthShell>
    );
  }

  const { data } = await getSupabaseAdmin()
    .from('listings')
    .select('*')
    .eq('owner_id', owner.id)
    .order('date_ajout', { ascending: false });

  // Derniere connexion (Supabase Auth) et coordonnees de MACHINGA pour l'aide.
  const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(owner.id);
  const account = {
    lastSignIn: authUser?.user?.last_sign_in_at || null,
    contactTelephone: process.env.CONTACT_TELEPHONE || '',
    contactEmail: process.env.CONTACT_EMAIL || ''
  };

  return <OwnerSpace
      owner={owner}
      account={account}
      initialListings={(data || []).map(toListingDTO)}
      startCreate={publier}
    />;
}
