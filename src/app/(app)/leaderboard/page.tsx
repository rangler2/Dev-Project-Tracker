import Link from "next/link";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ScorePill } from "@/components/ScorePills";
import { SectionHeading } from "@/components/SectionHeading";
import { DEMO_MODE } from "@/lib/demo";
import { getPulseStats, listProjects } from "@/lib/data";
import {
  PULSE_MIN_RESPONSES,
  type ProjectPulseStats,
  type ProjectWithClient,
} from "@/types/database";

type LeaderRow = ProjectPulseStats & {
  project?: ProjectWithClient | null;
};

export default async function LeaderboardPage() {
  const [statsResult, projects] = await Promise.all([
    getPulseStats(),
    listProjects(),
  ]);

  const stats = (
    Array.isArray(statsResult) ? statsResult : statsResult ? [statsResult] : []
  ) as ProjectPulseStats[];

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const rows = stats
    .map((stat) => ({
      ...stat,
      project: projectMap.get(stat.project_id) ?? null,
    }))
    .sort((a, b) => Number(b.overall_avg) - Number(a.overall_avg)) as LeaderRow[];

  const ranked = rows.filter((row) => row.response_count >= PULSE_MIN_RESPONSES);
  const emerging = rows.filter((row) => row.response_count < PULSE_MIN_RESPONSES);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-start gap-3">
        <div className="section-icon tone-accent !h-12 !w-12">
          <Trophy size={24} aria-hidden />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-brand">
            Pulse board
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Top projects by anonymous feel-good feedback. Projects need at least{" "}
            {PULSE_MIN_RESPONSES} responses before they rank.
            {DEMO_MODE ? " (demo data)" : ""}
          </p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          title="No ranked projects yet"
          description={`Collect at least ${PULSE_MIN_RESPONSES} anonymous pulse responses on a project to see it here.`}
          action={
            <Link href="/projects" className="btn btn-primary">
              Browse projects
            </Link>
          }
        />
      ) : (
        <section className="surface rounded-2xl p-2 sm:p-4">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Overall</th>
                  <th>Ease</th>
                  <th>Joy</th>
                  <th>Support</th>
                  <th>Clarity</th>
                  <th>Return</th>
                  <th>Responses</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, index) => (
                  <tr key={row.project_id}>
                    <td className="font-semibold">{index + 1}</td>
                    <td>
                      <Link
                        href={`/projects/${row.project_id}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        {row.project?.name ?? "Unknown project"}
                      </Link>
                      <div className="text-xs text-muted">
                        {row.project?.clients?.name}
                      </div>
                    </td>
                    <td>
                      <ScorePill value={Number(row.overall_avg)} />
                    </td>
                    <td>{Number(row.ease_avg).toFixed(1)}</td>
                    <td>{Number(row.joy_avg).toFixed(1)}</td>
                    <td>{Number(row.team_support_avg).toFixed(1)}</td>
                    <td>{Number(row.clarity_avg).toFixed(1)}</td>
                    <td>{Number(row.would_return_avg).toFixed(1)}</td>
                    <td>{row.response_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {emerging.length > 0 ? (
        <section className="surface rounded-2xl p-6">
          <SectionHeading
            title="Needs more feedback"
            description="These projects are collecting ratings but are not ranked yet."
            icon={Trophy}
            tone="amber"
          />
          <ul className="mt-4 space-y-3">
            {emerging.map((row) => (
              <li
                key={row.project_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/70 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/projects/${row.project_id}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    {row.project?.name ?? "Unknown project"}
                  </Link>
                  <p className="text-xs text-muted">
                    {row.response_count} / {PULSE_MIN_RESPONSES} responses
                  </p>
                </div>
                <ScorePill label="Avg so far" value={Number(row.overall_avg)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
