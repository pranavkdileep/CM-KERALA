"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, SESSION_COOKIE } from "@/lib/api";
import { failure } from "@/lib/action-utils";
import { homeFor } from "@/lib/dal";
import { safeNext, textValues, type FormState } from "@/lib/form";
import type { SessionUser } from "@/lib/types";

type AuthResponse = { user: SessionUser; token: string; expiresAt: string };

// The API's JWT is kept in an httpOnly cookie, so page scripts can never read it.
async function startSession({ token, expiresAt }: AuthResponse) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["email"]);
  const password = String(formData.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (!values.email) errors.email = "Enter your email address.";
  if (!password) errors.password = "Enter your password.";
  if (Object.keys(errors).length > 0) return { status: "error", message: "Check the highlighted fields.", errors, values };

  let session: AuthResponse;
  try {
    session = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      json: { email: values.email, password, turnstileToken: String(formData.get("cf-turnstile-response") ?? "") },
    });
  } catch (err) {
    return failure(err, values);
  }

  await startSession(session);
  redirect(safeNext(formData.get("next"), homeFor(session.user.role)));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["name", "email", "mobile"]);
  const password = String(formData.get("password") ?? "");

  let session: AuthResponse;
  try {
    session = await api<AuthResponse>("/api/auth/register", {
      method: "POST",
      auth: false,
      json: { ...values, password, turnstileToken: String(formData.get("cf-turnstile-response") ?? "") },
    });
  } catch (err) {
    return failure(err, values);
  }

  await startSession(session);
  redirect(safeNext(formData.get("next"), "/dashboard"));
}

export async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // The cookie is cleared below either way.
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
