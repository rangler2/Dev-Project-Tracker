import {
  CheckCircle2,
  CircleDashed,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import type { CompetenceLevel } from "@/types/database";

export function BoolBadge({
  value,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean;
  yesLabel?: string;
  noLabel?: string;
}) {
  if (value) {
    return (
      <span className="status-pill status-yes">
        <CheckCircle2 size={14} aria-hidden />
        {yesLabel}
      </span>
    );
  }
  return (
    <span className="status-pill status-no">
      <XCircle size={14} aria-hidden />
      {noLabel}
    </span>
  );
}

const levelMeta: Record<
  CompetenceLevel,
  { className: string; icon: typeof Sparkles; label: string }
> = {
  none: {
    className: "level-none",
    icon: CircleDashed,
    label: "None",
  },
  basic: {
    className: "level-basic",
    icon: Wrench,
    label: "Basic",
  },
  intermediate: {
    className: "level-intermediate",
    icon: ShieldCheck,
    label: "Intermediate",
  },
  advanced: {
    className: "level-advanced",
    icon: Sparkles,
    label: "Advanced",
  },
};

export function CompetenceBadge({ level }: { level: CompetenceLevel }) {
  const meta = levelMeta[level] ?? levelMeta.none;
  const Icon = meta.icon;
  return (
    <span className={`status-pill ${meta.className}`}>
      <Icon size={14} aria-hidden />
      {meta.label}
    </span>
  );
}

export function EnvBadge({
  env,
  value,
}: {
  env: "dev" | "uat" | "live";
  value: boolean;
}) {
  const labels = { dev: "Dev", uat: "UAT", live: "Live" } as const;
  return (
    <span
      className={`status-pill env-${env} ${value ? "is-on" : "is-off"}`}
      title={`${labels[env]} access: ${value ? "yes" : "no"}`}
    >
      <Server size={14} aria-hidden />
      {labels[env]}
    </span>
  );
}
