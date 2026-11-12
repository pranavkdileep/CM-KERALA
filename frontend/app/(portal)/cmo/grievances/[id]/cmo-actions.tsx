"use client";

import { useState } from "react";
import { ActionForm, SelectField, SubmitButton, TextAreaField } from "@/components/form";
import { Panel } from "@/components/portal";
import { categories, priorities } from "@/lib/site";
import type { DepartmentSummary, Priority, Status } from "@/lib/types";
import { addRemark, assign, changeStatus, escalate, reviewReport, triage } from "../../actions";

type Props = {
  grievance: {
    id: string;
    status: Status;
    category: string;
    priority: Priority;
    isOverdue: boolean;
    departmentId: string;
    suggestedDepartment: string;
    allowedStatuses: Status[];
    resolved: boolean;
  };
  departments: DepartmentSummary[];
  officers: { id: string; name: string; departmentId: string }[];
  pendingReport: { summary: string; details: string } | null;
};

const visibilityOptions = [
  { value: "public", label: "Visible to the citizen" },
  { value: "internal", label: "Internal only" },
];

export function CmoActions({ grievance: g, departments, officers, pendingReport }: Props) {
  const initialDepartment = g.departmentId || departments.find((d) => d.name === g.suggestedDepartment)?.id || "";
  const [departmentId, setDepartmentId] = useState(initialDepartment);
  const [officerId, setOfficerId] = useState("");
  const departmentOfficers = officers.filter((o) => o.departmentId === departmentId);

  return (
    <>
      {pendingReport ? (
        <Panel title="Review the action taken report" description="The department has submitted its response. Accept it to resolve the grievance, or send it back.">
          <div className="mb-5 rounded-lg bg-line-soft/70 p-4 text-sm">
            <p className="font-medium text-navy">{pendingReport.summary}</p>
            <p className="mt-1.5 leading-relaxed whitespace-pre-line text-ink-soft">{pendingReport.details}</p>
          </div>
          <ActionForm action={reviewReport.bind(null, g.id)}>
            {(state) => (
              <>
                <TextAreaField name="citizenMessage" label="Message to the citizen" required={false} rows={3} maxLength={1000} state={state} hint="Shown on the citizen's page if you accept. Leave blank to use the department's summary." />
                <TextAreaField name="remark" label="Internal remark" required={false} rows={3} maxLength={2000} state={state} hint="Required when you send the report back." />
                <div className="flex flex-wrap gap-3">
                  <SubmitButton name="decision" value="accept" size="md" pendingLabel="Saving">
                    Accept and resolve
                  </SubmitButton>
                  <SubmitButton name="decision" value="reject" size="md" variant="secondary" pendingLabel="Saving">
                    Send back
                  </SubmitButton>
                </div>
              </>
            )}
          </ActionForm>
        </Panel>
      ) : null}

      {!g.resolved ? (
        <Panel title="Forward to a department" description="Choose who acts on this grievance. The citizen sees the department name.">
          <ActionForm action={assign.bind(null, g.id)}>
            {(state) => (
              <>
                <SelectField name="departmentId" label="Department" state={state} options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Choose a department" value={departmentId} onValueChange={(v) => { setDepartmentId(v); setOfficerId(""); }} hint={g.suggestedDepartment ? `The assistant suggested ${g.suggestedDepartment}.` : undefined} />
                <SelectField name="officerId" label="Officer" required={false} state={state} options={departmentOfficers.map((o) => ({ value: o.id, label: o.name }))} placeholder={departmentId ? "Any officer in the department" : "Choose a department first"} value={officerId} onValueChange={setOfficerId} />
                <TextAreaField name="instructions" label="Instructions" required={false} rows={3} maxLength={2000} state={state} />
                <SubmitButton size="md" pendingLabel="Forwarding">
                  {g.departmentId ? "Forward again" : "Forward grievance"}
                </SubmitButton>
              </>
            )}
          </ActionForm>
        </Panel>
      ) : null}

      <Panel title="Review the suggestion" description="Correct the category or priority if the assistant got it wrong.">
        <ActionForm action={triage.bind(null, g.id)}>
          {(state) => (
            <>
              <SelectField name="category" label="Category" state={state} options={categories} defaultValue={g.category} />
              <SelectField name="priority" label="Priority" state={state} options={priorities} defaultValue={g.priority} />
              <SubmitButton size="md" variant="secondary" pendingLabel="Saving">
                Save changes
              </SubmitButton>
            </>
          )}
        </ActionForm>
      </Panel>

      {g.allowedStatuses.length > 0 ? (
        <Panel title="Change status" description={g.resolved ? "Reopen if the problem is not fixed." : undefined}>
          <ActionForm action={changeStatus.bind(null, g.id)}>
            {(state) => (
              <>
                <SelectField name="status" label="New status" state={state} options={g.allowedStatuses} placeholder="Choose a status" />
                <SelectField name="visibility" label="Remark visibility" required={false} state={state} options={visibilityOptions} defaultValue="public" />
                <TextAreaField name="remark" label="Remark" required={false} rows={3} maxLength={2000} state={state} />
                <SubmitButton size="md" variant="secondary" pendingLabel="Saving">
                  Change status
                </SubmitButton>
              </>
            )}
          </ActionForm>
        </Panel>
      ) : null}

      <Panel title="Add a remark">
        <ActionForm action={addRemark.bind(null, g.id)}>
          {(state) => (
            <>
              <TextAreaField name="text" label="Remark" rows={3} maxLength={2000} state={state} />
              <SelectField name="visibility" label="Who can see it" state={state} options={visibilityOptions} defaultValue="internal" />
              <SubmitButton size="md" variant="secondary" pendingLabel="Saving">
                Add remark
              </SubmitButton>
            </>
          )}
        </ActionForm>
      </Panel>

      {!g.resolved ? (
        <Panel title="Escalate" description={g.isOverdue ? "This grievance is past its deadline." : "Use this for grievances that need urgent attention."}>
          <ActionForm action={escalate.bind(null, g.id)}>
            {(state) => (
              <>
                <TextAreaField name="reason" label="Reason" rows={3} maxLength={1000} state={state} />
                <SubmitButton size="md" variant="secondary" pendingLabel="Escalating">
                  Escalate grievance
                </SubmitButton>
              </>
            )}
          </ActionForm>
        </Panel>
      ) : null}
    </>
  );
}
