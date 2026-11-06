'use client';

import { useState } from 'react';

// Histogramme empile dans le temps (colonnes verticales), series a couleur
// fixe, ecart de 2px entre segments, extremites arrondies cote donnee.
// rows : [{ label, [serie.key]: number }] ; series : [{ key, label, color }]
export default function StackedColumns({ rows, series, emptyLabel = 'Aucune donnée' }) {
  const [hovered, setHovered] = useState(null);
  const totals = rows.map((r) => series.reduce((sum, s) => sum + (r[s.key] || 0), 0));
  const max = Math.max(1, ...totals);
  if (totals.every((t) => t === 0)) return <p className="text-sm text-gray-500">{emptyLabel}</p>;

  const labelEvery = Math.ceil(rows.length / 8);

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
      <div className="relative">
        <div className="flex items-end gap-1 h-40 border-b border-[#c3c2b7]">
          {rows.map((r, i) => {
            // Premiere serie en bas ; seul le segment du haut est arrondi.
            const parts = series.filter((s) => (r[s.key] || 0) > 0);
            return (
              <div
                key={r.label}
                className="flex-1 h-full flex flex-col-reverse gap-[2px] cursor-default"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {parts.map((s, j) => (
                  <div
                    key={s.key}
                    className={j === parts.length - 1 ? 'rounded-t-[4px]' : ''}
                    style={{
                      height: `${((r[s.key] || 0) / max) * 100}%`,
                      background: s.color,
                      opacity: hovered === null || hovered === i ? 1 : 0.45
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {rows.map((r, i) => (
            <span key={r.label} className="flex-1 text-[10px] text-gray-400 text-center truncate">
              {i % labelEvery === 0 ? r.short || r.label : ''}
            </span>
          ))}
        </div>
        {hovered !== null && (
          <div className="absolute right-0 top-0 -translate-y-full bg-ink text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none">
            <strong>{rows[hovered].label}</strong> · {series.map((s) => `${s.label} : ${rows[hovered][s.key] || 0}`).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}
