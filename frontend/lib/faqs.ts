export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "submitting",
    title: "Submitting a grievance",
    items: [
      {
        q: "Who can submit a grievance?",
        a: "Any resident of Kerala, or anyone with a complaint about a public service in Kerala, can register and submit a grievance. You need a working email address and mobile number.",
      },
      {
        q: "What do I need to submit?",
        a: "Your district, a category, a short subject and a clear description of the problem: what happened, where, since when and whom you have already contacted. You can attach one photo or document as supporting evidence.",
      },
      {
        q: "What kinds of files can I attach?",
        a: "JPG, PNG or PDF files up to 5 MB. A photo of the problem or a copy of an earlier application or receipt is usually the most useful.",
      },
      {
        q: "What does the AI assistant do with my complaint?",
        a: "As you type your description, the assistant suggests a department, a category and a priority, and writes a short summary for the CMO. These are suggestions only. You can change them before you submit, and CMO staff review every grievance before it is assigned.",
      },
      {
        q: "Can I submit a grievance about a court case or a private dispute?",
        a: "No. Matters pending before a court, disputes between private parties and service matters of government employees are outside the scope of this portal.",
      },
    ],
  },
  {
    id: "tracking",
    title: "Tracking a grievance",
    items: [
      {
        q: "How do I get a reference number?",
        a: "A reference number such as CMK-2026-004817 is created the moment your grievance is submitted. It is shown on screen and listed in your dashboard. Keep it for all follow ups.",
      },
      {
        q: "How do I check the status?",
        a: "Enter your reference number on the Track grievance page. You will see the current status, the department it is assigned to and every status change with its date.",
      },
      {
        q: "What do the statuses mean?",
        a: "Submitted means it has been received. Under Review means CMO staff are reading it. In Progress means a department officer is acting on it. Resolved means the CMO has accepted the department's action report. Reopened means it has been sent back for further action.",
      },
      {
        q: "How long does it take?",
        a: "CMO staff aim to review every grievance within 3 working days. Grievances not resolved within 30 days are flagged as overdue and escalated.",
      },
    ],
  },
  {
    id: "after-resolution",
    title: "After resolution",
    items: [
      {
        q: "What if I am not satisfied with the resolution?",
        a: "Open the grievance from your dashboard and leave feedback explaining what is still unresolved. CMO staff can reopen it and send it back to the department.",
      },
      {
        q: "Will I be told what action was taken?",
        a: "Yes. Remarks from the CMO and the department officer, including the action taken report summary, appear on your grievance page.",
      },
    ],
  },
  {
    id: "account-privacy",
    title: "Account and privacy",
    items: [
      {
        q: "Who can see my grievance?",
        a: "Only you, CMO administrators and officers of the department it is assigned to. Tracking by reference number shows status and department, not your personal details.",
      },
      {
        q: "Is this an official government service?",
        a: "No. This portal is a recruitment prototype built for an engineering assessment. It is not affiliated with the Government of Kerala or the Chief Minister's Office, and all data on it is fictional. Do not submit real grievances here.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
