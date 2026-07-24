import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ScorePill } from "@/components/ScorePills";
import { requireUser } from "@/lib/auth";
import {
  PULSE_MIN_RESPONSES,
  type ProjectWithClient,
  type ProjectPulseStats,
} from "@/types/database";

type LeaderRow = ProjectPulseStats & {
  project?: ProjectWithClient | null;
};

export default async function LeaderboardPage() {
  const { supabase } = await requireUser();

  const [{ data: stats }, { data: projects }] = await Promise.all([
    supabase
      .from("project_pulse_stats")
      .select("*")
      .order("overall_avg", { ascending: false }),
    supabase.from("projects").select("*, clients(id, name)"),
  ]);

  const projectMap = new Map(
    ((projects ?? []) as ProjectWithClient[]).map((p) => [p.id, p]),
  );

  const rows = ((stats ?? []) as ProjectPulseStats[]).map((stat) => ({
    ...stat,
    project: projectMap.get(stat.project_id) ?? null,
  })) as LeaderRow[];

  const ranked = rows.filter((row) => row.response_count >= PULSE_MIN_RESPONSES);
  const emerging = rows.filter((row) => row.response_count < PULSE_MIN_RESPONSES);

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-brand">
          Pulse board
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Top projects by anonymous feel-good feedback. Projects need at least{" "}
          {PULSE_MIN_RESPONSES} responses before they rank.
        </p>
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
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Needs more feedback
          </h2>
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
