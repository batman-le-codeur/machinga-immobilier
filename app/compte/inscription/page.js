import { redirect } from 'next/navigation';
import AuthShell from '../../../components/compte/AuthShell';
import { SignupForm } from '../../../components/compte/AuthForms';
import { getCurrentOwner } from '../../../lib/owners';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Créer un compte propriétaire - MACHINGA IMMOBILIER'
};

export default async function InscriptionPage() {
  if (await getCurrentOwner()) redirect('/compte');

  return (
    <AuthShell
      title="Créer un compte gratuit"
      subtitle="Publiez vos biens en location sur MACHINGA IMMOBILIER. Chaque annonce est vérifiée avant sa mise en ligne."
    >
      <SignupForm />
    </AuthShell>
  );
}
