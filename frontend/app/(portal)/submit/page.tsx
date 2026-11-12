import type { Metadata } from "next";
import { PortalHeader, PortalPage } from "@/components/portal";
import { requireUser } from "@/lib/dal";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a grievance",
  description: "Describe a problem with a public service and send it to the Chief Minister's Office.",
  robots: { index: false },
};

export default async function SubmitPage() {
  await requireUser("citizen", "/submit");
  return (
    <PortalPage>
      <PortalHeader
        title="Submit a grievance"
        description="Describe the problem in your own words. The AI assistant can suggest a category, a department and a priority. You review its suggestions before anything is sent."
      />
      <SubmitForm />
    </PortalPage>
  );
}
