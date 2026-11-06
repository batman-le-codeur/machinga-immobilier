import { redirect } from 'next/navigation';
import AuthShell from '../../../components/compte/AuthShell';
import { LoginForm } from '../../../components/compte/AuthForms';
import { getCurrentOwner } from '../../../lib/owners';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Connexion propriétaire - MACHINGA IMMOBILIER'
};

export default async function ConnexionPage() {
  if (await getCurrentOwner()) redirect('/compte');

  return (
    <AuthShell
      title="Espace propriétaire"
      subtitle="Connectez-vous pour publier et gérer vos biens en location."
    >
      <LoginForm />
    </AuthShell>
  );
}
