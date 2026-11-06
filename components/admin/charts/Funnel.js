// Entonnoir : etapes ordonnees, largeur proportionnelle a la premiere etape,
// taux de passage entre deux etapes. Rampe ordinale (une teinte, du fonce au clair).
const ORDINAL = ['#104281', '#2a78d6', '#86b6ef'];

export default function Funnel({ steps }) {
  const first = Math.max(1, steps[0]?.value || 0);
  if (!steps[0]?.value) return <p className="text-sm text-gray-500">Pas encore de visites sur la période.</p>;

  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const pct = (s.value / first) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label}>
            {rate !== null && (
              <p className="text-xs text-gray-500 pl-1 py-1">
                <span aria-hidden="true">&darr;</span> {rate} % passent à l&apos;étape suivante
              </p>
            )}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div
                  className="h-10 rounded-[4px] flex items-center px-3 min-w-[2.5rem]"
                  style={{ width: `${Math.max(pct, 3)}%`, background: ORDINAL[i % ORDINAL.length] }}
                >
                  <span className={`text-sm font-semibold tabular-nums ${i === 2 ? 'text-ink' : 'text-white'}`}>
                    {s.value}
                  </span>
                </div>
              </div>
              <div className="w-56 shrink-0">
                <p className="text-sm font-medium text-ink">{s.label}</p>
                {s.hint && <p className="text-xs text-gray-500">{s.hint}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
