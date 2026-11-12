"use server";

import { api } from "@/lib/api";
import { run } from "@/lib/action-utils";
import { textValues, type FormState } from "@/lib/form";

const page = (id: string) => `/cmo/grievances/${id}`;

export async function changeStatus(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["status", "remark", "visibility"]);
  if (!v.status) return { status: "error", message: "Check the highlighted fields.", errors: { status: "Choose a status." }, values: v };
  return run(page(id), `Status changed to ${v.status}.`, () =>
    api(`/api/grievances/${id}/status`, { method: "PATCH", json: { status: v.status, remark: v.remark || undefined, visibility: v.visibility || "public" } }), v);
}

export async function triage(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["category", "priority"]);
  return run(page(id), "Category and priority saved.", () => api(`/api/cmo/grievances/${id}/triage`, { method: "PATCH", json: v }), v);
}

export async function assign(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["departmentId", "officerId", "instructions"]);
  if (!v.departmentId) return { status: "error", message: "Check the highlighted fields.", errors: { departmentId: "Choose a department." }, values: v };
  return run(page(id), "Forwarded to the department.", () =>
    api(`/api/cmo/grievances/${id}/assign`, { method: "POST", json: { departmentId: v.departmentId, officerId: v.officerId || undefined, instructions: v.instructions || undefined } }), v);
}

export async function addRemark(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["text", "visibility"]);
  return run(page(id), v.visibility === "public" ? "Update posted to the citizen." : "Internal remark saved.", () =>
    api(`/api/grievances/${id}/remarks`, { method: "POST", json: { text: v.text, visibility: v.visibility || "internal" } }), v);
}

export async function escalate(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["reason"]);
  return run(page(id), "Grievance escalated.", () => api(`/api/cmo/grievances/${id}/escalate`, { method: "POST", json: v }), v);
}

export async function reviewReport(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["decision", "remark", "citizenMessage"]);
  return run(page(id), v.decision === "accept" ? "Report accepted. The grievance is resolved." : "Report sent back to the department.", () =>
    api(`/api/cmo/grievances/${id}/review-report`, { method: "POST", json: { decision: v.decision, remark: v.remark || undefined, citizenMessage: v.citizenMessage || undefined } }), v);
}
