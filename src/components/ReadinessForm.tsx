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

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_set_up"
          defaultChecked={readiness?.is_set_up ?? false}
        />
        I am set up to work on this project
      </label>

      <div>
        <p className="label">Environment access</p>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["access_dev", "Dev", readiness?.access_dev],
              ["access_uat", "UAT", readiness?.access_uat],
              ["access_live", "Live", readiness?.access_live],
            ] as const
          ).map(([name, label, checked]) => (
            <label key={name} className="flex items-center gap-2 text-sm">
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
