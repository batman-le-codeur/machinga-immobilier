import Sparkline from './Sparkline';
import Meter from './Meter';

// Indicateur chiffre, avec variation par rapport a la periode precedente,
// et au choix une mini-courbe de tendance (trend) ou une jauge (meter).
export default function StatTile({ label, value, previous, hint, suffix = '', trend, meter }) {
  let delta = null;
  if (typeof previous === 'number' && typeof value === 'number') {
    if (previous === 0) delta = value > 0 ? { text: 'nouveau', up: true } : null;
    else {
      const pct = Math.round(((value - previous) / previous) * 100);
      delta = { text: `${pct > 0 ? '+' : ''}${pct} %`, up: pct > 0, flat: pct === 0 };
    }
  }

  return (
    <div className="border border-gray-200 bg-white p-5 flex flex-col">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-ink tabular-nums">
        {value === null || value === undefined ? '-' : `${value}${suffix}`}
      </p>
      {delta ? (
        <p
          className={`text-xs mt-1 ${delta.up ? 'text-[#006300]' : 'text-gray-500'}`}
          title="Par rapport à la période précédente de même durée"
        >
          {delta.flat ? '=' : delta.up ? '↑' : '↓'} {delta.text}
          <span className="text-gray-400"> vs période précédente</span>
        </p>
      ) : (
        hint && <p className="text-xs mt-1 text-gray-400">{hint}</p>
      )}
      <div className="mt-auto">
        {trend && <Sparkline values={trend} />}
        {meter && <Meter value={value} label={label} />}
      </div>
    </div>
  );
}
