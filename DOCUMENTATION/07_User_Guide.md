# 07. User Guide

This portal is a recruitment prototype. Use the demo accounts in [06_Setup_and_Testing.md](06_Setup_and_Testing.md) and fictional text only.

## For citizens

### Create an account and sign in
1. Select **Sign in**, then **Create a citizen account**.
2. Enter your name, email, a 10 digit mobile number and a password (8 or more characters with a letter and a number).
3. Complete the Cloudflare check and select **Create account**. You are signed in straight away.

To leave, select **Sign out** in the top bar.

### Submit a grievance
1. Select **Submit grievance**.
2. Choose your **district**, enter a short **subject**, and describe the problem in **What happened?**. Say what is wrong, where, since when and who you have already told.
3. Select **Get AI suggestions**. The panel on the right shows a suggested category, the department likely to handle it, a priority and a short summary. It says whether it was written by the AI model or by simple keyword matching.
4. Check the suggestion. The **Category** field is filled in for you. Change it if it is wrong. These are suggestions only, the Chief Minister's Office decides.
5. If similar grievances were reported recently, their reference numbers are shown. You can still submit yours.
6. Optionally attach a photo or document (JPG, PNG or PDF, up to 5 MB).
7. Complete the Cloudflare check and select **Submit grievance**.

You land on your grievance page with a **reference number** such as `CMK-2026-123456`. Keep it.

If the form comes back with an error, your text is kept. Attach the file again, because browsers do not allow a form to refill a file.

### Track a grievance
- **Anyone:** open **Track grievance**, enter the reference number. You see the status, the department handling it and each status change. Remarks and personal details are not shown.
- **You, signed in:** open **Dashboard**. You see counts of submitted, pending and resolved grievances and a list of earlier ones. Select a reference number for the full page.

### Read updates and give feedback
Your grievance page lists every update: status changes and any remarks the CMO or the department chose to share with you. When it is resolved you see the resolution summary and a feedback form.

- Choose **Yes, it is fixed** or **No, it is not fixed**, give a rating from 1 to 5 and add a comment.
- If you choose **No**, the CMO is told you want it reopened.

### Statuses
| Status | Meaning |
| --- | --- |
| Submitted | Received, waiting for CMO review |
| Under Review | CMO staff are checking it |
| In Progress | A department is acting on it |
| Resolved | The CMO accepted the department's report |
| Reopened | Sent back for further action |

A grievance still open after 30 days is marked **Overdue** and the CMO can escalate it.

## For CMO administrators

Sign in with a CMO account. You land on the **Chief Minister's Office dashboard**.

### Read the dashboard
- **Four counts:** total, pending, resolved, overdue.
- **Needs attention:** shortcuts to reports waiting for review, overdue grievances, citizens asking to reopen, grievances not yet assigned, and escalated grievances.
- **By status** and **By department** charts and a **By district** table, all from stored data. Select a district name to filter the list.

### Find grievances
Under **All grievances**, filter by status, priority, district, category and department, tick **Overdue only**, or search by reference number or words in the subject. Select **Apply filters**.

### Work on a grievance
Open a reference number. On the left you see the details, the citizen's contact information, the AI review, the department assignments and action taken reports, and the full history (internal entries are labelled). Attachments are on the right and open in a new tab. The right column holds the actions:

1. **Review the suggestion.** Correct the category or priority if the assistant was wrong, then **Save changes**.
2. **Forward to a department.** Choose the department (the assistant's suggestion is shown), optionally an officer, and add instructions. Select **Forward grievance**. The status becomes In Progress and the citizen sees the department's name.
3. **Add a remark.** Choose **Internal only** for staff notes or **Visible to the citizen** for an update they should read.
4. **Change status.** Only the moves the rules allow are offered.
5. **Escalate.** Give a reason. Use it for grievances that are overdue or urgent.
6. **Review the action taken report.** When a department submits its report a panel appears at the top of the right column. Read it, then:
   - **Accept and resolve:** the status becomes Resolved and the citizen sees your message, or the department's summary if you leave it blank.
   - **Send back:** add a remark saying what to fix. The status becomes Reopened and the department sees your remark.

A resolved grievance can be **reopened** with **Change status**, for example after a citizen says it is not fixed.

## For department officers

Sign in with an officer account. You land on your department's dashboard.

1. The four counts show what was forwarded to your department, what needs action, what is with the CMO for review, and what is resolved. Grievances past 30 days are highlighted.
2. Filter or search the list. Open a reference number.
3. Read the **CMO instructions**, the complaint and the attachments.
4. **Post a progress update:** write an investigation remark and choose who can see it. Choose **Visible to the citizen** for updates such as a site visit date.
5. When the work is done, fill in **Submit the action taken report**: a one sentence summary, what was done, and an optional supporting file. Select **Send report to the CMO**.
6. Wait for the CMO's decision. If the report is sent back, read the CMO's remark in the history and file a new report.

You can only see grievances forwarded to your department. You cannot mark a grievance Resolved. Only the CMO can, by accepting your report.

## Contact the grievance cell
Use **Contact** for questions about using the portal. Enter your name, email, subject and message and complete the Cloudflare check. Messages are saved for the CMO to read. For a new complaint, use **Submit grievance** instead so it gets a reference number.
