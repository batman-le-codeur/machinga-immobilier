export default function StatTile({ label, value }) {
  return (
    <div className="border border-gray-200 p-5">
      <p className="text-2xl font-semibold text-primary tabular-nums">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
