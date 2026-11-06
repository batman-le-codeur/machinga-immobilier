'use client';

const VISITOR_KEY = 'machinga_visitor_id';

// Bouton d'appel de l'annonceur. Le clic est compte pour les statistiques
// admin (contacts generes par la marketplace), puis le lien tel: s'ouvre.
// track=false : clic de l'admin ou du proprietaire en apercu, non compte.
export default function CallOwnerButton({ listingId, telephone, track: shouldTrack = true }) {
  function track() {
    if (!shouldTrack) return;
    let visitorId = null;
    try {
      visitorId = localStorage.getItem(VISITOR_KEY);
    } catch {
      // stockage indisponible : on compte quand meme le clic
    }
    const body = JSON.stringify({ listingId, visitorId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track/appel', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track/appel', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  }

  return (
    <a
      href={`tel:${telephone.replace(/[^\d+]/g, '')}`}
      onClick={track}
      className="flex items-center justify-center gap-3 bg-secondary text-white px-6 py-3 transition-all hover:bg-secondary-light hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-xs text-white/80">Appeler l&apos;annonceur</span>
        <span className="block text-base font-semibold whitespace-nowrap">{telephone}</span>
      </span>
    </a>
  );
}
