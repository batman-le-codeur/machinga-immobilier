// Mini-courbe de tendance pour un indicateur (sans axe) : historique en gris,
// dernier point en couleur d'accent.
export default function Sparkline({ values, color = '#2a78d6' }) {
  if (!values || values.length < 2 || values.every((v) => v === 0)) return null;
  const W = 120;
  const H = 28;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 3 - (v / max) * (H - 6)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-7 mt-3 overflow-visible" aria-hidden="true">
      <path d={d} fill="none" stroke="#c3c2b7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}
