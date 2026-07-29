import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { DEMO_MODE } from "@/lib/demo";
import { listClients, listProjects } from "@/lib/data";
import { createProjectAction } from "../actions";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientFilter } = await searchParams;
  const [clientList, allProjects] = await Promise.all([
    listClients(),
    listProjects(),
  ]);

  const projects = clientFilter
    ? allProjects.filter((p) => p.client_id === clientFilter)
    : allProjects;

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-brand">
          Projects
        </h1>
        <p className="mt-2 text-muted">
          Track CMS, frontend stack, team readiness, and anonymous pulse scores.
          {DEMO_MODE ? " (demo data)" : ""}
        </p>
      </div>

      <section className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Filter:</span>
        <Link
          href="/projects"
          className={`rounded-md px-3 py-1.5 text-sm ${
            !clientFilter
              ? "bg-brand !text-white"
              : "bg-white/70 text-muted"
          }`}
        >
          All
        </Link>
        {clientList.map((client) => (
          <Link
            key={client.id}
            href={`/projects?client=${client.id}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              clientFilter === client.id
                ? "bg-brand !text-white"
                : "bg-white/70 text-muted"
            }`}
          >
            {client.name}
          </Link>
        ))}
      </section>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to capture stack info and let developers mark readiness."
        />
      ) : (
        <section className="surface rounded-2xl p-2 sm:p-4">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>CMS</th>
                  <th>FE stack</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold !text-brand underline underline-offset-2"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.clients?.name ?? "—"}</td>
                    <td>
                      {[project.cms, project.cms_version].filter(Boolean).join(" ") ||
                        "—"}
                    </td>
                    <td>{project.fe_stack || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="surface rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          New project
        </h2>
        {clientList.length === 0 ? (
          <p className="mt-3 text-muted">
            Add a{" "}
            <Link href="/clients" className="font-semibold text-brand underline">
              client
            </Link>{" "}
            before creating a project.
          </p>
        ) : (
          <form action={createProjectAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label" htmlFor="client_id">
                Client
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="field"
                defaultValue={clientFilter ?? ""}
              >
                <option value="" disabled>
                  Select client
                </option>
                {clientList.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="name">
                Project name
              </label>
              <input id="name" name="name" required className="field" />
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
                placeholder="Next.js, TypeScript, Tailwind"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" name="notes" rows={3} className="field" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">
                Create project
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
