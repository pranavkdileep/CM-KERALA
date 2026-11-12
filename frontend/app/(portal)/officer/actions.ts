"use server";

import { api } from "@/lib/api";
import { failure, run } from "@/lib/action-utils";
import { textValues, type FormState } from "@/lib/form";
import { revalidatePath } from "next/cache";

const page = (id: string) => `/officer/grievances/${id}`;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Progress notes keep the grievance In Progress. A note for the citizen is marked public.
export async function postUpdate(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["remark", "visibility", "status"]);
  if (!v.remark) return { status: "error", message: "Check the highlighted fields.", errors: { remark: "Write the progress update." }, values: v };
  return run(page(id), "Progress update saved.", () =>
    api(`/api/grievances/${id}/status`, { method: "PATCH", json: { status: v.status || "In Progress", remark: v.remark, visibility: v.visibility || "internal" } }), v);
}

export async function submitReport(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const v = textValues(formData, ["summary", "details"]);
  const body = new FormData();
  for (const [k, val] of Object.entries(v)) body.set(k, val);

  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return { status: "error", message: "Check the highlighted fields.", errors: { attachment: "The file is larger than 5 MB." }, values: v };
    body.set("attachment", file, file.name);
  }

  try {
    await api(`/api/officer/grievances/${id}/action-report`, { method: "POST", form: body });
  } catch (err) {
    return failure(err, v);
  }
  revalidatePath(page(id));
  return { status: "success", message: "Action taken report sent to the CMO for review." };
}
