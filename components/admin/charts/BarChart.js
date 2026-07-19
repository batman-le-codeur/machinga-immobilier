'use client';

import { useState } from 'react';

const SEQUENTIAL = '#2a78d6';
const CATEGORICAL = ['#2a78d6', '#008300', '#e87ba4', '#eda100'];

export default function BarChart({ data, mode = 'sequential', emptyLabel = 'Aucune donnée' }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const color = mode === 'categorical' ? CATEGORICAL[i % CATEGORICAL.length] : SEQUENTIAL;
        const pct = Math.max(2, Math.round((d.value / max) * 100));
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-gray-600 truncate" title={d.label}>
              {d.label}
            </span>
            <div
              className="relative flex-1 h-6 bg-offwhite rounded-sm overflow-hidden cursor-default"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="h-full rounded-sm transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  opacity: hovered === null || hovered === i ? 1 : 0.45
                }}
              />
              {hovered === i && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-ink text-white text-xs px-2 py-0.5 rounded-sm whitespace-nowrap">
                  {d.value}
                </div>
              )}
            </div>
            <span className="w-10 shrink-0 text-sm font-medium text-ink tabular-nums text-right">
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
