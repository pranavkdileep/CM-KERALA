"use client";

import { ActionForm, FileField, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/form";
import { Panel } from "@/components/portal";
import type { Status } from "@/lib/types";
import { postUpdate, submitReport } from "../../actions";

const visibilityOptions = [
  { value: "internal", label: "Internal only" },
  { value: "public", label: "Visible to the citizen" },
];

export function OfficerActions({ grievanceId, canAct, waiting, status, reportRejected }: { grievanceId: string; canAct: boolean; waiting: boolean; status: Status; reportRejected: boolean }) {
  if (!canAct) {
    return (
      <Panel title="No action needed">
        <p className="text-sm leading-relaxed text-ink-soft">
          {status === "Resolved" ? "The CMO accepted your report and resolved this grievance." : "This grievance is not open for department action right now."}
        </p>
      </Panel>
    );
  }

  return (
    <>
      {reportRejected ? (
        <p className="rounded-lg bg-error/[0.08] px-4 py-3 text-sm text-error-ink">The CMO sent the last report back. Read the remark in the history, then file a new report.</p>
      ) : null}

      <Panel title="Post a progress update" description="Record what you have found or done so far.">
        <ActionForm action={postUpdate.bind(null, grievanceId)}>
          {(state) => (
            <>
              <input type="hidden" name="status" value="In Progress" />
              <TextAreaField name="remark" label="Investigation remark" rows={4} maxLength={2000} state={state} />
              <SelectField name="visibility" label="Who can see it" state={state} options={visibilityOptions} defaultValue="internal" hint="Choose visible to the citizen for updates they should read, such as a site visit date." />
              <SubmitButton size="md" variant="secondary" pendingLabel="Saving">
                Save update
              </SubmitButton>
            </>
          )}
        </ActionForm>
      </Panel>

      {waiting ? (
        <Panel title="Action taken report">
          <p className="text-sm leading-relaxed text-ink-soft">Your report is with the CMO for review. You will be able to file another one if it is sent back.</p>
        </Panel>
      ) : (
        <Panel title="Submit the action taken report" description="Describe what the department did. The CMO reviews it before the grievance is resolved.">
          <ActionForm action={submitReport.bind(null, grievanceId)}>
            {(state) => (
              <>
                <TextField name="summary" label="Summary" state={state} maxLength={300} hint="One sentence, for example: All 14 streetlights replaced." />
                <TextAreaField name="details" label="What was done" rows={6} maxLength={4000} state={state} />
                <FileField name="attachment" label="Supporting file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" state={state} hint="JPG, PNG or PDF, up to 5 MB." />
                <SubmitButton size="md" pendingLabel="Sending report">
                  Send report to the CMO
                </SubmitButton>
              </>
            )}
          </ActionForm>
        </Panel>
      )}
    </>
  );
}
