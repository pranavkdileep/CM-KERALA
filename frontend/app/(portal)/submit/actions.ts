"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { failure } from "@/lib/action-utils";
import { textValues, type FormState } from "@/lib/form";
import type { AiSuggestion } from "@/lib/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type AnalyzeResult = { ok: true; data: AiSuggestion } | { ok: false; message: string };

// Asks the AI Grievance Assistant for suggestions. Nothing is submitted yet.
export async function analyzeGrievance(input: { description: string; district: string }): Promise<AnalyzeResult> {
  try {
    const data = await api<AiSuggestion>("/api/grievances/analyze", {
      method: "POST",
      json: { description: input.description, district: input.district || undefined },
    });
    return { ok: true, data };
  } catch (err) {
    const state = failure(err);
    return { ok: false, message: state.errors?.description ?? state.message ?? "The assistant could not analyse this right now." };
  }
}

export async function createGrievance(formData: FormData): Promise<FormState> {
  const fields = ["district", "category", "subject", "description", "analysisId"];
  const values = textValues(formData, fields);

  const body = new FormData();
  for (const name of fields) if (values[name]) body.set(name, values[name]);
  body.set("turnstileToken", String(formData.get("cf-turnstile-response") ?? ""));

  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { status: "error", message: "Check the highlighted fields.", errors: { attachment: "The file is larger than 5 MB." }, values };
    }
    body.set("attachment", file, file.name);
  }

  let created: { id: string; referenceId: string };
  try {
    created = await api<{ id: string; referenceId: string }>("/api/grievances", { method: "POST", form: body });
  } catch (err) {
    return failure(err, values);
  }
  redirect(`/dashboard/${created.id}?submitted=1`);
}
