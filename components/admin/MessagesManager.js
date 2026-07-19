'use client';

import { downloadCsv } from '../../lib/exportCsv';

export default function MessagesManager({ messages, setMessages }) {
  function handleExport() {
    downloadCsv(
      `messages-${new Date().toISOString().slice(0, 10)}.csv`,
      messages,
      [
        { label: 'Nom', value: (m) => m.nom },
        { label: 'Email', value: (m) => m.email },
        { label: 'Téléphone', value: (m) => m.telephone || '' },
        { label: 'Type de transaction', value: (m) => m.type_transaction || '' },
        { label: 'Type de logement', value: (m) => m.type_logement || '' },
        { label: 'Ville', value: (m) => m.ville || '' },
        { label: 'Quartier', value: (m) => m.quartier || '' },
        { label: 'Message', value: (m) => m.message },
        { label: 'Lu', value: (m) => (m.lu ? 'Oui' : 'Non') },
        { label: 'Date', value: (m) => new Date(m.date_envoi).toLocaleString('fr-FR') }
      ]
    );
  }

  async function toggleRead(msg) {
    const res = await fetch(`/api/messages/${msg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lu: !msg.lu })
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    }
  }

  async function remove(id) {
    if (!confirm('Supprimer ce message ?')) return;
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  if (messages.length === 0) {
    return <p className="text-gray-500">Aucun message reçu pour le moment.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{messages.length} message(s)</p>
        <button
          onClick={handleExport}
          className="px-5 py-2.5 text-sm font-medium border border-gray-300 hover:border-primary transition-colors"
        >
          Exporter (CSV)
        </button>
      </div>

      <div className="border border-gray-200 divide-y divide-gray-200">
        {messages.map((m) => (
        <div key={m.id} className={`p-4 ${m.lu ? '' : 'bg-offwhite'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="font-medium text-ink">{m.nom}</span>{' '}
              <span className="text-sm text-gray-500">
                - {m.email}
                {m.telephone ? ` - ${m.telephone}` : ''}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(m.date_envoi).toLocaleString('fr-FR')}
            </span>
          </div>
          {(m.type_transaction || m.type_logement || m.ville) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {m.type_transaction && (
                <span className="text-xs px-2 py-1 bg-offwhite border border-gray-200 text-gray-600">
                  {m.type_transaction === 'location' ? 'Location' : 'Vente'}
                </span>
              )}
              {m.type_logement && (
                <span className="text-xs px-2 py-1 bg-offwhite border border-gray-200 text-gray-600">
                  {m.type_logement}
                </span>
              )}
              {m.ville && (
                <span className="text-xs px-2 py-1 bg-offwhite border border-gray-200 text-gray-600">
                  {m.ville}
                  {m.quartier ? ` - ${m.quartier}` : ''}
                </span>
              )}
            </div>
          )}
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{m.message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleRead(m)}
              className="text-sm px-3 py-1.5 border border-gray-300 hover:border-primary transition-colors"
            >
              {m.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}
            </button>
            <button
              onClick={() => remove(m.id)}
              className="text-sm px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
