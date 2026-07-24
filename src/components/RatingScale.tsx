import { Star } from "lucide-react";

const scoreColors = [
  "var(--rating-1)",
  "var(--rating-2)",
  "var(--rating-3)",
  "var(--rating-4)",
  "var(--rating-5)",
];

export function RatingStars({
  value,
  max = 5,
  size = 16,
}: {
  value: number;
  max?: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(max, Number(value) || 0));
  const color = scoreColors[Math.max(0, Math.round(clamped) - 1)] ?? scoreColors[2];

  return (
    <span className="rating-stars" style={{ color }} aria-label={`${clamped} of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(clamped);
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? "currentColor" : "transparent"}
            strokeWidth={filled ? 0 : 1.75}
            className={filled ? "opacity-100" : "opacity-35"}
            aria-hidden
          />
        );
      })}
    </span>
  );
}

export function ScoreChip({
  value,
  label,
  emphasize = false,
  variant = "rating",
}: {
  value: number | null;
  label?: string;
  emphasize?: boolean;
  variant?: "rating" | "count";
}) {
  if (value === null || Number.isNaN(value)) {
    return (
      <span className="score-chip score-chip-empty">
        {label ? <span className="score-chip-label">{label}</span> : null}
        <strong>—</strong>
      </span>
    );
  }

  if (variant === "count") {
    return (
      <span className={`score-chip score-chip-count${emphasize ? " score-chip-lg" : ""}`}>
        {label ? <span className="score-chip-label">{label}</span> : null}
        <strong>{Math.round(value)}</strong>
      </span>
    );
  }

  const rounded = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <span
      className={`score-chip score-${rounded}${emphasize ? " score-chip-lg" : ""}`}
    >
      {label ? <span className="score-chip-label">{label}</span> : null}
      <strong>{Number(value).toFixed(1)}</strong>
      <RatingStars value={value} size={emphasize ? 15 : 12} />
    </span>
  );
}

export function RatingRadioGroup({
  name,
  label,
  prompt,
  defaultValue,
  accentClass,
}: {
  name: string;
  label: string;
  prompt: string;
  defaultValue?: number;
  accentClass: string;
}) {
  return (
    <fieldset className={`rating-fieldset ${accentClass}`}>
      <legend className="rating-legend">
        <span className="rating-legend-title">{label}</span>
        <span className="rating-legend-prompt">{prompt}</span>
      </legend>
      <div className="rating-options">
        {[1, 2, 3, 4, 5].map((score) => (
          <label key={score} className={`rating-option rating-tone-${score}`}>
            <input
              type="radio"
              name={name}
              value={score}
              required
              defaultChecked={(defaultValue ?? 0) === score}
            />
            <span className="rating-option-face">
              <Star size={14} aria-hidden />
              {score}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
