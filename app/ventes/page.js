import { parseSearchFilters, searchListings } from '../../lib/publicData';
import ListingSearch from '../../components/ListingSearch';
import PageHeader from '../../components/PageHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ventes à Libreville - MACHINGA IMMOBILIER',
  description:
    'Terrains, appartements, maisons, locaux commerciaux et biens divers disponibles à la vente à Libreville, Gabon.'
};

const CATEGORIES = ['Terrains', 'Apparts/Maisons', 'Locaux com./bureaux', 'Objets divers'];

export default async function VentesPage({ searchParams }) {
  const filters = parseSearchFilters(searchParams);
  const { listings, total, pageCount } = await searchListings('vente', filters);

  return (
    <div>
      <PageHeader
        title="Ventes"
        subtitle="Terrains, appartements, maisons, locaux commerciaux et biens divers disponibles à la vente."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <ListingSearch
          listings={listings}
          categories={CATEGORIES}
          total={total}
          page={filters.page}
          pageCount={pageCount}
          priceLabel="Prix"
        />
      </div>
    </div>
  );
}
