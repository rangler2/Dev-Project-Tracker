import type { LucideIcon } from "lucide-react";

export function SectionHeading({
  title,
  description,
  icon: Icon,
  tone = "brand",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: "brand" | "accent" | "sky" | "violet" | "amber";
}) {
  return (
    <div className="section-heading">
      <div className={`section-icon tone-${tone}`}>
        <Icon size={20} aria-hidden />
      </div>
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
