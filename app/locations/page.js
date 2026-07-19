import { getListings } from '../../lib/publicData';
import ListingGrid from '../../components/ListingGrid';
import PageHeader from '../../components/PageHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Locations à Libreville — MACHINGA IMMOBILIER',
  description:
    'Chambres, studios, appartements, maisons meublées et locaux commerciaux disponibles à la location à Libreville, Gabon.'
};

const CATEGORIES = ['Chambres/Studios', 'Apparts/Maisons', 'Meublés', 'Locaux com./bureaux'];

export default async function LocationsPage() {
  const listings = await getListings({ type: 'location' });

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Chambres, studios, appartements, maisons et locaux commerciaux disponibles à la location."
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <ListingGrid listings={listings} categories={CATEGORIES} />
      </div>
    </div>
  );
}
