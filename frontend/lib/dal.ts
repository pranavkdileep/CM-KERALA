import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, SESSION_COOKIE } from "@/lib/api";
import type { Role, SessionUser } from "@/lib/types";

export const homeFor = (role: Role) => (role === "cmo" ? "/cmo" : role === "officer" ? "/officer" : "/dashboard");

// Data access layer. Every protected page asks here, and the API checks the token again on each call.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { user } = await api<{ user: SessionUser }>("/api/auth/me");
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});

export async function requireUser(role: Role, next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

// Pages call this to turn an expired token into a trip back to the sign in page.
export function handleAuthError(err: unknown, next?: string): never {
  if (err instanceof ApiError && err.status === 401) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  throw err;
}
