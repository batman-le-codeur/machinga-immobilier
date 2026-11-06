// Jauge : un ratio face a une limite (0-100 %). Piste = teinte claire de la
// meme rampe que le remplissage.
export default function Meter({ value, label }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      className="h-2 w-full rounded-full mt-3"
      style={{ background: '#cde2fb' }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#2a78d6' }} />
    </div>
  );
}
