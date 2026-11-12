import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import type { FormState } from "@/lib/form";

/** Turns an API error into form state. Anything unexpected is rethrown so it reaches the error page. */
export function failure(err: unknown, values?: Record<string, string>): FormState {
  if (!(err instanceof ApiError)) throw err;
  if (err.status === 401 && err.code === "unauthorized") redirect("/login?expired=1");
  return {
    status: "error",
    message: err.errors && Object.keys(err.errors).length > 0 ? "Check the highlighted fields." : err.message,
    errors: err.errors,
    values,
  };
}

/** Runs one API call for a form, then refreshes the page that shows the result. */
export async function run(path: string, success: string, task: () => Promise<unknown>, values?: Record<string, string>): Promise<FormState> {
  try {
    await task();
  } catch (err) {
    return failure(err, values);
  }
  revalidatePath(path);
  return { status: "success", message: success };
}
