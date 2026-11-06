'use client';

import { useState } from 'react';

// Barre segmentee haute : un tout reparti en parts (<= 6), part affichee
// dans le bloc quand elle tient, legende des noms en dessous, detail au survol.
// parts : [{ label, value, color, textColor? }]
export default function SegmentedBar({ parts, unit = '', emptyLabel = 'Aucune donnée' }) {
  const [hovered, setHovered] = useState(null);
  const total = parts.reduce((sum, p) => sum + p.value, 0);

  if (total === 0) return <p className="text-sm text-gray-500">{emptyLabel}</p>;

  const visible = parts.filter((p) => p.value > 0);
  const summary = visible
    .map((p) => `${p.label} : ${p.value}${unit} (${Math.round((p.value / total) * 100)} %)`)
    .join(', ');

  return (
    <div>
      <div className="relative">
        <div className="flex h-7 gap-0.5" role="img" aria-label={summary}>
          {visible.map((p) => {
            const share = p.value / total;
            const pct = Math.round(share * 100);
            return (
              <div
                key={p.label}
                tabIndex={0}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p)}
                onBlur={() => setHovered(null)}
                className="h-full rounded-[4px] flex items-center px-2 text-xs font-medium overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ink"
                style={{ width: `${share * 100}%`, background: p.color, color: p.textColor || '#ffffff' }}
              >
                {share >= 0.12 ? `${pct} %` : ''}
              </div>
            );
          })}
        </div>
        {hovered && (
          <div className="absolute left-0 -top-2 -translate-y-full bg-ink text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none">
            <strong>{hovered.value}{unit}</strong> {hovered.label} ({Math.round((hovered.value / total) * 100)} %)
          </div>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-gray-600">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
            {p.label} <span className="text-gray-400 tabular-nums">{p.value}{unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
