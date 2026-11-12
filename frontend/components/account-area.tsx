import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { getCurrentUser, homeFor } from "@/lib/dal";
import { button } from "@/lib/ui";

// Reads the session, so the header renders it inside a Suspense boundary.
export async function AccountArea() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className={button("ghost", "md")}>
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Link href={homeFor(user.role)} className={button("ghost", "md")}>
        Dashboard
      </Link>
      <form action={logout}>
        <button type="submit" className={button("ghost", "md")}>
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AccountFallback() {
  return <span className="inline-block h-[42px] w-20" aria-hidden="true" />;
}
