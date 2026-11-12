import "server-only";
import { cookies, headers } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session-cookie";

export { SESSION_COOKIE };

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string>;

  constructor(status: number, message: string, code?: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  /** Send the signed in user's token. On by default. */
  auth?: boolean;
};

// The visitor's address, forwarded so the API's rate limits and captcha check see the real client.
async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

export async function api<T>(path: string, { method = "GET", json, form, auth = true }: Options = {}): Promise<T> {
  const reqHeaders: Record<string, string> = {};

  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) reqHeaders.Authorization = `Bearer ${token}`;
  }
  const ip = await clientIp();
  if (ip) reqHeaders["X-Forwarded-For"] = ip;

  let body: BodyInit | undefined;
  if (json !== undefined) {
    reqHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers: reqHeaders, body, cache: "no-store" });
  } catch {
    throw new ApiError(503, "The service is unavailable right now. Try again in a few minutes.", "unavailable");
  }

  const data = (await res.json().catch(() => null)) as { error?: string; code?: string; errors?: Record<string, string> } | null;
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? "Something went wrong. Try again.", data?.code, data?.errors);
  }
  return data as T;
}

/** Streams a file from the API, for the download proxy. */
export async function apiRaw(path: string): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
}
