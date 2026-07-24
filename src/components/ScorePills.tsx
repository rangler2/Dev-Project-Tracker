export function ScorePill({ value, label }: { value: number | null; label?: string }) {
  const display =
    value === null || Number.isNaN(value) ? "—" : value.toFixed(1);

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-sm">
      {label ? <span className="text-muted">{label}</span> : null}
      <strong>{display}</strong>
    </span>
  );
}
