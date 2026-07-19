import { getListings } from '../../lib/publicData';
import ListingGrid from '../../components/ListingGrid';
import PageHeader from '../../components/PageHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ventes à Libreville - MACHINGA IMMOBILIER',
  description:
    'Terrains, appartements, maisons, locaux commerciaux et biens divers disponibles à la vente à Libreville, Gabon.'
};

const CATEGORIES = ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers'];

export default async function VentesPage() {
  const listings = await getListings({ type: 'vente' });

  return (
    <div>
      <PageHeader
        title="Ventes"
        subtitle="Terrains, appartements, maisons, locaux commerciaux et biens divers disponibles à la vente."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <ListingGrid listings={listings} categories={CATEGORIES} />
      </div>
    </div>
  );
}
