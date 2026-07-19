'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Quels documents faut-il pour louer un bien ?',
    a: "Une pièce d'identité valide, un justificatif de revenus et une caution correspondant en général à un ou deux mois de loyer. Notre équipe vous accompagne dans la constitution du dossier."
  },
  {
    q: 'Combien coûte une estimation de mon bien ?',
    a: "L'estimation est entièrement gratuite et sans engagement. Contactez-nous pour convenir d'une visite."
  },
  {
    q: 'Quels sont vos frais de gestion locative ?',
    a: '30% du premier loyer perçu, puis 10% des loyers suivants, en échange d\u2019un suivi complet du bien et du locataire.'
  },
  {
    q: 'Intervenez-vous pour l\u2019achat et la vente de terrains ?',
    a: 'Oui, nous accompagnons aussi bien les particuliers que les professionnels dans l\u2019achat et la vente de terrains, appartements, maisons et locaux commerciaux.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {QUESTIONS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-medium text-ink pr-6">{item.q}</span>
              <span className="text-primary text-xl leading-none">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="pb-5 text-gray-600 leading-relaxed pr-8">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
