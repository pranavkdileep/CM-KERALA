"use server";

import { api } from "@/lib/api";
import { failure } from "@/lib/action-utils";
import { textValues, type FormState } from "@/lib/form";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["name", "email", "subject", "message"]);
  values.email = values.email.toLowerCase();

  // Quick checks so obvious mistakes do not need a round trip. The API validates again.
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL.test(values.email)) errors.email = "Enter an email address like name@example.com.";
  if (values.subject.length < 3) errors.subject = "Enter a subject.";
  if (values.message.length < 10) errors.message = "Write at least 10 characters so we can help.";
  if (Object.keys(errors).length > 0) return { status: "error", message: "Check the highlighted fields.", errors, values };

  try {
    await api("/api/enquiries", {
      method: "POST",
      auth: false,
      json: { ...values, turnstileToken: String(formData.get("cf-turnstile-response") ?? "") },
    });
  } catch (err) {
    return failure(err, values);
  }

  return { status: "success", message: `Message sent. We will reply to ${values.email} within 3 working days.` };
}
