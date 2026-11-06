'use client';

import { useState } from 'react';

// Rampe sequentielle (une teinte, clair -> fonce) : plus c'est fonce, plus il
// y a de visites.
const RAMP = ['#f0efec', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#104281'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Seuils par quantiles des creneaux non vides : un pic isolé ne rend pas
// tout le reste pale, chaque teinte regroupe a peu pres autant de creneaux.
function thresholdsFor(values) {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b);
  const steps = RAMP.length - 1;
  return Array.from({ length: steps - 1 }, (_, i) => sorted[Math.floor(((i + 1) / steps) * (sorted.length - 1))] ?? 0);
}

function colorFor(value, thresholds) {
  if (value === 0) return RAMP[0];
  const step = thresholds.filter((t) => value > t).length + 1;
  return RAMP[Math.min(step, RAMP.length - 1)];
}

// Carte de chaleur jour de la semaine x heure. grid[jour 0=lundi][heure 0-23].
export default function Heatmap({ grid, unit = 'visite' }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(1, ...grid.flat());
  const thresholds = thresholdsFor(grid.flat());
  if (grid.flat().every((v) => v === 0)) {
    return <p className="text-sm text-gray-500">Pas encore assez de visites.</p>;
  }

  return (
    <div>
      <div className="relative overflow-x-auto">
        <div className="grid gap-[2px] min-w-[420px]" style={{ gridTemplateColumns: '36px repeat(24, minmax(0, 1fr))' }}>
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-[10px] text-gray-400 text-center">
              {h % 3 === 0 ? `${h}h` : ''}
            </span>
          ))}
          {grid.map((row, d) => (
            <div key={DAYS[d]} className="contents">
              <span className="text-xs text-gray-500 self-center">{DAYS[d]}</span>
              {row.map((value, h) => (
                <div
                  key={h}
                  tabIndex={0}
                  onMouseEnter={() => setHovered({ d, h, value })}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered({ d, h, value })}
                  onBlur={() => setHovered(null)}
                  className="aspect-square rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  style={{ background: colorFor(value, thresholds) }}
                  aria-label={`${DAYS[d]} ${h}h : ${value} ${unit}${value > 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
        {hovered && (
          <div className="absolute right-0 -top-1 -translate-y-full bg-ink text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none">
            <strong>{hovered.value}</strong> {unit}
            {hovered.value > 1 ? 's' : ''} · {DAYS[hovered.d]} {hovered.h}h-{hovered.h + 1}h
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        Moins
        {RAMP.map((c) => (
          <span key={c} className="inline-block w-4 h-3 rounded-[2px]" style={{ background: c }} />
        ))}
        Plus
        <span className="text-gray-400 ml-2">(heure de Libreville, jusqu&apos;à {max} par créneau)</span>
      </div>
    </div>
  );
}
