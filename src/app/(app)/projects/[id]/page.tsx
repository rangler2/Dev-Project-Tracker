import Link from "next/link";
import {
  ClipboardList,
  FolderKanban,
  HeartPulse,
  MessageSquareText,
  UsersRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PulseForm } from "@/components/PulseForm";
import { ReadinessForm } from "@/components/ReadinessForm";
import { ScorePill } from "@/components/ScorePills";
import { SectionHeading } from "@/components/SectionHeading";
import {
  BoolBadge,
  CompetenceBadge,
  EnvBadge,
} from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import {
  getMyPulse,
  getProject,
  getPulseStats,
  listClients,
  listPulseComments,
  listReadiness,
} from "@/lib/data";
import {
  PULSE_MIN_RESPONSES,
  type ProjectPulseStats,
} from "@/types/database";
import { deleteProjectAction, updateProjectAction } from "../../actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const projectRow = await getProject(id);
  if (!projectRow) notFound();

  const [clientList, readiness, myPulse, stats, pulseComments] =
    await Promise.all([
      listClients(),
      listReadiness(id),
      getMyPulse(id, user.id),
      getPulseStats(id),
      listPulseComments(id),
    ]);

  const mine = readiness.find((row) => row.user_id === user.id) ?? null;
  const pulseStats = stats as ProjectPulseStats | null;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/projects" className="text-sm font-medium text-muted hover:text-brand">
            ← Back to projects
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-brand">
            {projectRow.name}
          </h1>
          <p className="mt-2 text-muted">
            {[projectRow.cms, projectRow.cms_version].filter(Boolean).join(" ") ||
              "No CMS set"}
            {projectRow.fe_stack ? ` · ${projectRow.fe_stack}` : ""}
          </p>
        </div>
        <form action={deleteProjectAction}>
          <input type="hidden" name="id" value={projectRow.id} />
          <button type="submit" className="btn btn-danger">
            Delete project
          </button>
        </form>
      </div>

      <section className="surface rounded-2xl p-6">
        <SectionHeading
          title="Project info"
          description="CMS, FE stack, and notes for this engagement."
          icon={FolderKanban}
          tone="brand"
        />
        <form action={updateProjectAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={projectRow.id} />
          <div className="md:col-span-2">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="field"
              defaultValue={projectRow.name}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="client_id">
              Client
            </label>
            <select
              id="client_id"
              name="client_id"
              required
              className="field"
              defaultValue={projectRow.client_id}
            >
              {clientList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="cms">
              CMS
            </label>
            <input
              id="cms"
              name="cms"
              className="field"
              placeholder="Sitecore 10.3"
              defaultValue={
                [projectRow.cms, projectRow.cms_version]
                  .filter(Boolean)
                  .join(" ")
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="fe_stack">
              FE stack
            </label>
            <input
              id="fe_stack"
              name="fe_stack"
              className="field"
              defaultValue={projectRow.fe_stack}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="field"
              defaultValue={projectRow.notes}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              Save project
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-2xl p-6">
          <SectionHeading
            title="My readiness"
            description="Only you can edit your own readiness. Everyone in the org can see the team table."
            icon={ClipboardList}
            tone="sky"
          />
          <div className="mt-4">
            <ReadinessForm projectId={projectRow.id} readiness={mine} />
          </div>
        </div>

        <div className="surface rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeading
              title="Project pulse"
              description="Anonymous feel-good ratings for this project."
              icon={HeartPulse}
              tone="accent"
            />
            <Link href="/leaderboard" className="text-sm font-semibold text-brand">
              View leaderboard →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ScorePill
              label="Overall"
              value={pulseStats?.overall_avg ?? null}
              emphasize
            />
            <ScorePill
              label="n"
              value={pulseStats?.response_count ?? 0}
              variant="count"
            />
            {(pulseStats?.response_count ?? 0) < PULSE_MIN_RESPONSES ? (
              <span className="badge">Needs {PULSE_MIN_RESPONSES}+ responses to rank</span>
            ) : (
              <span className="badge">Ranked</span>
            )}
          </div>
          {pulseStats ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <ScorePill label="Ease" value={Number(pulseStats.ease_avg)} />
              <ScorePill label="Joy" value={Number(pulseStats.joy_avg)} />
              <ScorePill label="Support" value={Number(pulseStats.team_support_avg)} />
              <ScorePill label="Clarity" value={Number(pulseStats.clarity_avg)} />
              <ScorePill label="Return" value={Number(pulseStats.would_return_avg)} />
            </div>
          ) : null}
          <div className="mt-4">
            <PulseForm projectId={projectRow.id} pulse={myPulse} />
          </div>
        </div>
      </section>

      <section className="surface rounded-2xl p-6">
        <SectionHeading
          title="Team readiness"
          description="Who is set up, which environments they can reach, and competence by discipline."
          icon={UsersRound}
          tone="violet"
        />
        {readiness.length === 0 ? (
          <p className="mt-3 text-muted">
            No one has marked readiness on this project yet.
          </p>
        ) : (
          <div className="table-wrap mt-4">
            <table className="data readiness-table">
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Set up</th>
                  <th>Environments</th>
                  <th>BE</th>
                  <th>FE</th>
                  <th>QA</th>
                </tr>
              </thead>
              <tbody>
                {readiness.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="font-semibold">
                        {row.profiles?.display_name ?? "Unknown"}
                        {row.user_id === user.id ? (
                          <span className="ml-2 badge">You</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted">
                        {row.profiles?.email}
                      </div>
                    </td>
                    <td>
                      <BoolBadge value={row.is_set_up} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <EnvBadge env="dev" value={row.access_dev} />
                        <EnvBadge env="uat" value={row.access_uat} />
                        <EnvBadge env="live" value={row.access_live} />
                      </div>
                    </td>
                    <td>
                      <CompetenceBadge level={row.be_level} />
                    </td>
                    <td>
                      <CompetenceBadge level={row.fe_level} />
                    </td>
                    <td>
                      <CompetenceBadge level={row.qa_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="surface rounded-2xl p-6">
        <SectionHeading
          title="Anonymous feedback"
          description="Recent comments with no attribution."
          icon={MessageSquareText}
          tone="amber"
        />
        {pulseComments.length === 0 ? (
          <p className="mt-3 text-muted">No comments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pulseComments.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-line bg-white/70 px-4 py-3"
              >
                <p className="text-sm">{item.comment}</p>
                <p className="mt-2 text-xs text-muted">
                  {new Date(item.updated_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
