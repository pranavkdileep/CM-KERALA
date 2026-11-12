export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export const idle: FormState = { status: "idle" };

/** Reads the text fields of a form into a plain object, so they can be put back after an error. */
export function textValues(formData: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((n) => [n, String(formData.get(n) ?? "").trim()]));
}

/** Only allows redirects to a path on this site. */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback: string) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;
}
