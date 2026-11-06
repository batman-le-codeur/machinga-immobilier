import AuthShell from '../../../components/compte/AuthShell';
import { ForgotPasswordForm } from '../../../components/compte/AuthForms';

export const metadata = {
  title: 'Mot de passe oublié - MACHINGA IMMOBILIER'
};

export default function MotDePasseOubliePage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez l'adresse e-mail de votre compte : nous vous enverrons un code pour choisir un nouveau mot de passe."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
