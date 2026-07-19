import ContactForm from '../../components/ContactForm';
import PageHeader from '../../components/PageHeader';

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Contactez-nous"
        subtitle="Remplissez ce formulaire et nous vous répondrons dans les meilleurs délais."
      />
      <div className="max-w-6xl mx-auto px-6 py-16 grid gap-16 md:grid-cols-2">
      <div>
        <ContactForm />
      </div>

      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Coordonnées</h2>
          <ul className="text-gray-700 space-y-2">
            <li>Après l&apos;Union, Libreville — GABON</li>
            <li>BP 8521</li>
            <li>{process.env.CONTACT_TELEPHONE || '+241 00 00 00 00'}</li>
            <li>{process.env.CONTACT_EMAIL || 'contact@machinga-immobilier.ga'}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Horaires</h2>
          <ul className="text-gray-700 space-y-2">
            <li>Lun – Ven : 8h30 – 16h30</li>
            <li>Sam : 9h – 12h</li>
            <li>Dim : Fermé</li>
          </ul>
        </div>

        <div className="aspect-video border border-gray-200">
          <iframe
            title="Localisation MACHINGA IMMOBILIER"
            src="https://www.google.com/maps?q=Libreville,Gabon&output=embed"
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
      </div>
    </div>
  );
}
