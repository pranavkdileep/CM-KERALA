import { apiRaw } from "@/lib/api";

// Streams an attachment from the API using the signed in user's session.
// The API decides who may see it, so a link shared with someone else returns "not found".
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return new Response("File not found.", { status: 404 });

  const res = await apiRaw(`/api/attachments/${id}`);
  if (res.status === 401) return new Response("Sign in to view this file.", { status: 401 });
  if (!res.ok || !res.body) return new Response("File not found.", { status: 404 });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
