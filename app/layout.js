import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageViewTracker from '../components/PageViewTracker';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'MACHINGA IMMOBILIER — L\u2019immobilier digital à Libreville',
  description:
    "S.C.I MACHINGA IMMOBILIER accompagne particuliers et professionnels dans la location, l'achat et la vente de biens immobiliers à Libreville, Gabon.",
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.png', type: 'image/png' }
    ],
    apple: '/logo-icon.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-white text-ink antialiased">
        <PageViewTracker />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
