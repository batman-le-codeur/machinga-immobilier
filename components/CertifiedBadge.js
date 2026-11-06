// Badge des annonces publiees par l'equipe MACHINGA IMMOBILIER (owner_id vide).
export default function CertifiedBadge({ className = '', label = 'Certifié MACHINGA' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-primary text-white text-xs font-medium px-2 py-1 rounded-sm ${className}`}
      title="Annonce publiée et suivie par l'équipe MACHINGA IMMOBILIER"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l2.6 2.1 3.3-.3.9 3.2 2.9 1.6-1.2 3.1 1.2 3.1-2.9 1.6-.9 3.2-3.3-.3L12 22l-2.6-2.1-3.3.3-.9-3.2-2.9-1.6 1.2-3.1-1.2-3.1 2.9-1.6.9-3.2 3.3.3L12 2z"
          fill="currentColor"
          opacity="0.25"
        />
        <path d="M8 12.5l2.6 2.5L16 9.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}
