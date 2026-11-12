import Form from "next/form";
import { Search } from "lucide-react";
import { routes } from "@/lib/site";
import { button } from "@/lib/ui";

export function TrackForm({ id = "track-ref" }: { id?: string }) {
  return (
    <Form action={routes.track} className="w-full max-w-md">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        Already submitted? Track it with your reference number
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            id={id}
            name="ref"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="CMK-2026-004817"
            className="h-12 w-full rounded-lg border border-line bg-surface pr-3.5 pl-10 font-mono text-[15px] text-navy uppercase placeholder:text-mist placeholder:normal-case hover:border-navy focus:border-2 focus:border-navy focus:pl-[39px] focus:shadow-[0_0_0_3px_rgb(15_23_42/0.09)] focus:outline-none"
          />
        </div>
        <button type="submit" className={button("secondary", "lg")}>
          Track
        </button>
      </div>
    </Form>
  );
}
