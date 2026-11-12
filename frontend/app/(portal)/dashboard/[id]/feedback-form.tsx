"use client";

import { ActionForm, SubmitButton, TextAreaField } from "@/components/form";
import { submitFeedback } from "../actions";

export function FeedbackForm({ grievanceId }: { grievanceId: string }) {
  return (
    <ActionForm action={submitFeedback.bind(null, grievanceId)}>
      {(state) => (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-navy">Was the problem fixed?</legend>
            <div className="flex flex-wrap gap-5 text-sm">
              {[
                ["yes", "Yes, it is fixed"],
                ["no", "No, it is not fixed"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input type="radio" name="satisfied" value={value} className="size-[18px] accent-navy" />
                  {label}
                </label>
              ))}
            </div>
            {state.errors?.satisfied ? <p className="mt-1 text-xs text-error-ink">{state.errors.satisfied}</p> : null}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-navy">How would you rate the handling?</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex items-center gap-2">
                  <input type="radio" name="rating" value={n} className="size-[18px] accent-navy" />
                  {n}
                </label>
              ))}
              <span className="text-xs text-slate">1 is poor, 5 is excellent</span>
            </div>
            {state.errors?.rating ? <p className="mt-1 text-xs text-error-ink">{state.errors.rating}</p> : null}
          </fieldset>

          <TextAreaField name="comment" label="Comment" required={false} rows={3} maxLength={1000} state={state} />
          <SubmitButton size="md" pendingLabel="Sending feedback">
            Send feedback
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
