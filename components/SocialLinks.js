function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M15 4h-2a4 4 0 0 0-4 4v2H7v3h2v7h3v-7h2.5l.5-3H12V8a1 1 0 0 1 1-1h2V4z"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M16.5 3c.3 1.8 1.5 3.2 3.5 3.5v3c-1.3 0-2.5-.4-3.5-1.1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.4 2.4 0 1 0 1.7 2.3V3h2.9z"
        fill="currentColor"
      />
    </svg>
  );
}

function EmailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 6l8.5 6.5L20.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9 0-16-7-16-16 0-.6.4-1 1-1h2.9c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1l-1.9 1.9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { Icon: FacebookIcon, value: 'Machinga Immobilier', label: 'Facebook', href: null },
  { Icon: TikTokIcon, value: '@machinga_immobilier', label: 'TikTok', href: null },
  {
    Icon: EmailIcon,
    value: 'machingaimmobilier@gmail.com',
    label: 'Email',
    href: 'mailto:machingaimmobilier@gmail.com'
  },
  {
    Icon: PhoneIcon,
    value: '+241 60 35 21 57',
    label: 'Téléphone / WhatsApp',
    href: 'https://wa.me/24160352157'
  }
];

export default function SocialLinks({ variant = 'light' }) {
  const isDark = variant === 'dark';
  const iconWrap = isDark
    ? 'bg-white/10 text-white group-hover:bg-white/20'
    : 'bg-offwhite text-primary group-hover:bg-primary group-hover:text-white';
  const value = isDark ? 'text-white/90' : 'text-ink';
  const label = isDark ? 'text-white/50' : 'text-gray-500';

  return (
    <ul className="space-y-3">
      {ITEMS.map(({ Icon, value: v, label: l, href }) => {
        const content = (
          <>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${iconWrap}`}>
              <Icon width="16" height="16" />
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-medium truncate ${value}`}>{v}</span>
              <span className={`block text-xs ${label}`}>{l}</span>
            </span>
          </>
        );
        return (
          <li key={l}>
            {href ? (
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-3"
              >
                {content}
              </a>
            ) : (
              <div className="group flex items-center gap-3">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
