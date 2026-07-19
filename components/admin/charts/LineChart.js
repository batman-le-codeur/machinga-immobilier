'use client';

import { useRef, useState } from 'react';

const COLOR = '#2a78d6';
const W = 100;
const H = 40;

export default function LineChart({ data }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const max = Math.max(1, ...data.map((d) => d.count));
  const n = data.length;

  const points = data.map((d, i) => ({
    x: n > 1 ? (i / (n - 1)) * W : W / 2,
    y: H - 4 - (d.count / max) * (H - 8)
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (n - 1));
    setHover(index);
  }

  if (data.every((d) => d.count === 0)) {
    return <p className="text-sm text-gray-500">Aucune visite enregistrée pour le moment.</p>;
  }

  const active = hover !== null ? data[hover] : null;
  const activePoint = hover !== null ? points[hover] : null;

  return (
    <div
      ref={ref}
      className="relative h-40 w-full"
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={H * f}
            y2={H * f}
            stroke="#e1e0d9"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={areaPath} fill={COLOR} fillOpacity="0.08" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={COLOR}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {activePoint && (
          <>
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1="0"
              y2={H}
              stroke="#c3c2b7"
              strokeWidth="0.3"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="1.6" fill={COLOR} />
          </>
        )}
      </svg>

      {active && (
        <div
          className="absolute -top-1 bg-ink text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none -translate-y-full"
          style={{
            left: `${(activePoint.x / W) * 100}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {new Date(active.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} -{' '}
          {active.count} visite{active.count > 1 ? 's' : ''}
        </div>
      )}

      <div className="absolute bottom-0 left-0 translate-y-full pt-1 text-xs text-gray-400">
        {new Date(data[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </div>
      <div className="absolute bottom-0 right-0 translate-y-full pt-1 text-xs text-gray-400">
        {new Date(data[n - 1].date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </div>
    </div>
  );
}
