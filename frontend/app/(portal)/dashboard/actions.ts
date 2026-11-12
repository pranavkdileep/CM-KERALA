"use server";

import { api } from "@/lib/api";
import { run } from "@/lib/action-utils";
import { textValues, type FormState } from "@/lib/form";

export async function submitFeedback(grievanceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["rating", "satisfied", "comment"]);
  const errors: Record<string, string> = {};
  if (!values.rating) errors.rating = "Choose a rating.";
  if (!values.satisfied) errors.satisfied = "Tell us if the problem was fixed.";
  if (Object.keys(errors).length > 0) return { status: "error", message: "Check the highlighted fields.", errors, values };

  return run(`/dashboard/${grievanceId}`, "Thank you. Your feedback has been recorded.", () =>
    api(`/api/grievances/${grievanceId}/feedback`, { method: "POST", json: { rating: values.rating, satisfied: values.satisfied === "yes", comment: values.comment || undefined } }),
  values);
}
