import {
  COMPETENCE_LEVELS,
  type ProjectReadiness,
} from "@/types/database";
import { upsertReadinessAction } from "@/app/(app)/actions";

export function ReadinessForm({
  projectId,
  readiness,
}: {
  projectId: string;
  readiness: ProjectReadiness | null;
}) {
  return (
    <form action={upsertReadinessAction} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />

      <label className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--brand)_20%,var(--line))] bg-[color-mix(in_srgb,var(--brand)_6%,white)] px-3 py-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_set_up"
          defaultChecked={readiness?.is_set_up ?? false}
        />
        I am set up to work on this project
      </label>

      <div>
        <p className="label">Environment access</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["access_dev", "Dev", readiness?.access_dev, "env-dev"],
              ["access_uat", "UAT", readiness?.access_uat, "env-uat"],
              ["access_live", "Live", readiness?.access_live, "env-live"],
            ] as const
          ).map(([name, label, checked, tone]) => (
            <label
              key={name}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${tone} ${
                checked ? "is-on" : "is-off"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                defaultChecked={checked ?? false}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["be_level", "BE competence", readiness?.be_level],
            ["fe_level", "FE competence", readiness?.fe_level],
            ["qa_level", "QA competence", readiness?.qa_level],
          ] as const
        ).map(([name, label, value]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>
              {label}
            </label>
            <select
              id={name}
              name={name}
              className="field"
              defaultValue={value ?? "none"}
            >
              {COMPETENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button type="submit" className="btn btn-primary">
        Save my readiness
      </button>
    </form>
  );
}
