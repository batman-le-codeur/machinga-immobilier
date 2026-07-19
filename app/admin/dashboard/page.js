'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ListingsManager from '../../../components/admin/ListingsManager';
import MessagesManager from '../../../components/admin/MessagesManager';
import StatsPanel from '../../../components/admin/StatsPanel';

export default function DashboardPage() {
  const [tab, setTab] = useState('annonces');
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [listingsRes, messagesRes] = await Promise.all([
        fetch('/api/listings'),
        fetch('/api/messages')
      ]);
      setListings(await listingsRes.json());
      setMessages(messagesRes.ok ? await messagesRes.json() : []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  const stats = {
    total: listings.length,
    locations: listings.filter((l) => l.type === 'location').length,
    ventes: listings.filter((l) => l.type === 'vente').length,
    messagesNonLus: messages.filter((m) => !m.lu).length
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 border border-gray-300 hover:border-primary transition-colors"
        >
          Se déconnecter
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              ['Annonces au total', stats.total],
              ['Locations', stats.locations],
              ['Ventes', stats.ventes],
              ['Messages non lus', stats.messagesNonLus]
            ].map(([label, value]) => (
              <div key={label} className="border border-gray-200 p-5">
                <p className="text-2xl font-semibold text-primary">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {[
              ['annonces', 'Annonces'],
              ['messages', `Messages${stats.messagesNonLus ? ` (${stats.messagesNonLus})` : ''}`],
              ['stats', 'Statistiques']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'annonces' && <ListingsManager listings={listings} setListings={setListings} />}
          {tab === 'messages' && <MessagesManager messages={messages} setMessages={setMessages} />}
          {tab === 'stats' && <StatsPanel />}
        </>
      )}
    </div>
  );
}
