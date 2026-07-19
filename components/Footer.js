import Link from 'next/link';
import Image from 'next/image';
import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image
            src="/logo-icon.svg"
            alt="Machinga Immobilier"
            width={44}
            height={46}
            className="h-11 w-auto mb-4 rounded-md"
          />
          <p className="font-semibold text-lg mb-3">MACHINGA IMMOBILIER</p>
          <p className="text-sm text-white/70 leading-relaxed">
            S.C.I MACHINGA IMMOBILIER — l&apos;immobilier digital, au service de vos projets à
            Libreville.
          </p>
        </div>

        <div>
          <p className="font-medium mb-3 text-white/90">Navigation</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/nous-decouvrir" className="transition-colors hover:text-white">Nous découvrir</Link></li>
            <li><Link href="/locations" className="transition-colors hover:text-white">Locations</Link></li>
            <li><Link href="/ventes" className="transition-colors hover:text-white">Ventes</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-white">Contactez-nous</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-medium mb-3 text-white/90">Horaires</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Libreville, Gabon</li>
            <li>Lun – Ven : 8h30 – 16h30</li>
            <li>Sam : 9h – 12h — Dim : Fermé</li>
          </ul>
        </div>

        <div>
          <p className="font-medium mb-3 text-white/90">Nous suivre</p>
          <SocialLinks variant="dark" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-white/50 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>RCCM : GA-LBV-01-2026-B42-00067 — NIF : 2026010533470</span>
          <span>© {new Date().getFullYear()} S.C.I MACHINGA IMMOBILIER. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
