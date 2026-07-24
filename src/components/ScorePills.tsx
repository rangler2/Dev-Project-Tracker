import { ScoreChip } from "@/components/RatingScale";

export function ScorePill({
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
  return (
    <ScoreChip
      value={value}
      label={label}
      emphasize={emphasize}
      variant={variant}
    />
  );
}
