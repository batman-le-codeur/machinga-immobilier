'use client';

import { useState } from 'react';

// Barres horizontales empilees (une par categorie), series a couleur fixe.
// rows : [{ label, [serie.key]: number }] ; series : [{ key, label, color }]
export default function StackedBars({ rows, series, emptyLabel = 'Aucune donnée' }) {
  const [hovered, setHovered] = useState(null);
  const totals = rows.map((r) => series.reduce((sum, s) => sum + (r[s.key] || 0), 0));
  const max = Math.max(1, ...totals);

  if (totals.every((t) => t === 0)) return <p className="text-sm text-gray-500">{emptyLabel}</p>;

  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 mb-4 text-sm text-gray-600">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="relative flex items-center gap-3"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-40 shrink-0 text-sm text-gray-600 truncate" title={r.label}>
              {r.label}
            </span>
            <div className="flex-1 flex h-5 gap-0.5">
              {series.map((s) =>
                r[s.key] > 0 ? (
                  <div
                    key={s.key}
                    className="h-full first:rounded-l-[4px] last:rounded-r-[4px]"
                    style={{ width: `${(r[s.key] / max) * 100}%`, background: s.color }}
                  />
                ) : null
              )}
            </div>
            <span className="w-8 text-right text-sm font-medium text-ink tabular-nums">{totals[i]}</span>
            {hovered === i && (
              <div className="absolute left-44 -top-1 -translate-y-full bg-ink text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10">
                {series.map((s) => `${s.label} : ${r[s.key] || 0}`).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
