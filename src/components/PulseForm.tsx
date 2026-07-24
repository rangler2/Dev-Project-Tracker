import { PULSE_QUESTIONS, type ProjectPulse } from "@/types/database";
import { upsertPulseAction } from "@/app/(app)/actions";

export function PulseForm({
  projectId,
  pulse,
}: {
  projectId: string;
  pulse: ProjectPulse | null;
}) {
  return (
    <form action={upsertPulseAction} className="space-y-5">
      <input type="hidden" name="project_id" value={projectId} />
      <p className="text-sm text-muted">
        Scores are anonymous in reports. You can update your vote anytime; only
        you can see that you submitted one.
      </p>

      {PULSE_QUESTIONS.map((question) => (
        <fieldset key={question.key} className="space-y-2">
          <legend className="text-sm font-semibold">
            {question.label}
            <span className="ml-2 font-normal text-muted">{question.prompt}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <label
                key={score}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-white px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-[color-mix(in_srgb,var(--brand)_10%,white)]"
              >
                <input
                  type="radio"
                  name={question.key}
                  value={score}
                  required
                  defaultChecked={(pulse?.[question.key] ?? 0) === score}
                />
                {score}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div>
        <label className="label" htmlFor="comment">
          Optional anonymous comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="field"
          defaultValue={pulse?.comment ?? ""}
          placeholder="What would make this project healthier?"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {pulse ? "Update anonymous pulse" : "Submit anonymous pulse"}
      </button>
    </form>
  );
}
