import Image from 'next/image';

// Mise en page commune des pages de connexion / inscription proprietaire
// (meme habillage que la connexion admin).
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/page-header-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/70" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-icon.svg"
              alt="Machinga Immobilier"
              width={56}
              height={58}
              className="h-14 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-center mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 text-center mb-8">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="text-center text-sm text-white/80 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

export const inputClass =
  'w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
export const labelClass = 'block text-sm font-medium text-ink mb-1';
export const buttonClass =
  'w-full bg-primary text-white rounded-md px-6 py-3 text-sm font-medium transition-colors hover:bg-primary-light disabled:opacity-60';
