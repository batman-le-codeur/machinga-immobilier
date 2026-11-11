import { parseSearchFilters, searchListings } from '../../lib/publicData';
import ListingSearch from '../../components/ListingSearch';
import PageHeader from '../../components/PageHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Locations à Libreville - MACHINGA IMMOBILIER',
  description:
    'Chambres, studios, appartements, maisons meublées et locaux commerciaux disponibles à la location à Libreville, Gabon.'
};

const CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];

export default async function LocationsPage({ searchParams }) {
  const filters = parseSearchFilters(searchParams);
  const { listings, total, pageCount } = await searchListings('location', filters);

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Chambres, studios, appartements, maisons et locaux commerciaux disponibles à la location."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <ListingSearch
          listings={listings}
          categories={CATEGORIES}
          total={total}
          page={filters.page}
          pageCount={pageCount}
          showSource
          showPeriode
          priceLabel="Loyer"
        />
      </div>
    </div>
  );
}
