import { RatingRadioGroup } from "@/components/RatingScale";
import { PULSE_QUESTIONS, type ProjectPulse } from "@/types/database";
import { upsertPulseAction } from "@/app/(app)/actions";

const accents = {
  ease: "tone-ease",
  joy: "tone-joy",
  team_support: "tone-team",
  clarity: "tone-clarity",
  would_return: "tone-return",
} as const;

export function PulseForm({
  projectId,
  pulse,
}: {
  projectId: string;
  pulse: ProjectPulse | null;
}) {
  return (
    <form action={upsertPulseAction} className="space-y-2.5">
      <input type="hidden" name="project_id" value={projectId} />
      <p className="text-xs text-muted">
        Scores are anonymous in reports. Only you can see that you submitted one.
      </p>

      {PULSE_QUESTIONS.map((question) => (
        <RatingRadioGroup
          key={question.key}
          name={question.key}
          label={question.label}
          prompt={question.prompt}
          defaultValue={pulse?.[question.key]}
          accentClass={accents[question.key]}
        />
      ))}

      <div>
        <label className="label" htmlFor="comment">
          Optional anonymous comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={2}
          className="field field-compact"
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
