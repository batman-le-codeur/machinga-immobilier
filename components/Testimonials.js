const TESTIMONIALS = [
  {
    nom: 'Sandrine M.',
    role: 'Locataire à Libreville',
    texte:
      "Accompagnement sérieux du début à la fin. J'ai trouvé mon appartement en moins de deux semaines, avec toutes les démarches prises en charge."
  },
  {
    nom: 'Jean-Paul O.',
    role: 'Propriétaire bailleur',
    texte:
      'La gestion locative de mon bien est simple et transparente. Je reçois mes loyers dans les temps et sans avoir à gérer les locataires moi-même.'
  },
  {
    nom: 'Reine A.',
    role: 'Acheteuse d’un terrain',
    texte:
      "Une équipe à l'écoute qui nous a aidés à négocier l'achat de notre terrain dans de bonnes conditions."
  }
];

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4 text-secondary">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.63 5.33 5.87.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.78 1-5.85L1.5 7.68l5.87-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <figure
          key={i}
          className={`relative bg-white p-6 rounded-sm border border-gray-200 border-t-4 ${
            i % 2 === 0 ? 'border-t-primary' : 'border-t-secondary'
          } transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
        >
          <Stars />
          <blockquote className="text-ink leading-relaxed mb-6">&laquo; {t.texte} &raquo;</blockquote>
          <figcaption className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                i % 2 === 0 ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              {initials(t.nom)}
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t.nom}</span>
              <span className="block text-xs text-secondary">{t.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
