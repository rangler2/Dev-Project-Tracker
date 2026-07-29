import { Star } from "lucide-react";

/** Red → orange → green by score band for at-a-glance scanning. */
export function ratingColor(value: number) {
  if (value < 2) return "var(--rating-1)";
  if (value < 3) return "var(--rating-2)";
  if (value < 3.5) return "var(--rating-3)";
  if (value < 4.25) return "var(--rating-4)";
  return "var(--rating-5)";
}

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
  const filledCount = Math.round(clamped);
  const color = ratingColor(clamped);

  return (
    <span
      className="rating-stars"
      style={{ color }}
      title={`${clamped.toFixed(1)} / ${max}`}
      aria-label={`${clamped.toFixed(1)} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < filledCount;
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? "currentColor" : "transparent"}
            strokeWidth={filled ? 0 : 1.75}
            className={filled ? "opacity-100" : "opacity-30"}
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
  variant?: "rating" | "count" | "stars";
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

  if (variant === "stars") {
    return (
      <span className={`score-stars-only${emphasize ? " score-stars-lg" : ""}`}>
        {label ? <span className="score-chip-label">{label}</span> : null}
        <RatingStars value={value} size={emphasize ? 16 : 14} />
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
              <Star size={11} aria-hidden />
              {score}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
