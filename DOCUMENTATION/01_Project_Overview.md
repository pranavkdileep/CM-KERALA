# 01. Project Overview

## Recruitment prototype notice

CM Kerala Grievance Portal is a **recruitment prototype** built for the WhiteMatrix Software Solutions machine test. It is not affiliated with, authorised by or endorsed by the Government of Kerala or the Chief Minister's Office. All grievances, people, departments, figures and contact details in it are fictional. Do not enter real personal data.

## Problem statement

Citizens face problems with roads, healthcare, education, water, power and other public services. Today there is no single place where they can raise a problem with the Chief Minister's Office (CMO), see that someone is acting on it, and read the outcome. The CMO, in turn, needs a way to review what comes in, send each grievance to the department responsible, chase delays and confirm that the work was done.

## Objectives

1. Let any citizen submit a grievance, with an optional photo or document, and get a unique reference number straight away.
2. Let the CMO review every grievance, correct its category and priority, forward it to a department and officer, and escalate delays.
3. Let department officers see only the grievances forwarded to their department, record progress and file an action taken report.
4. Keep the CMO in control of the outcome: a grievance is resolved only when the CMO accepts the report.
5. Record every status change with its time and the responsible user, so each grievance can be traced for its whole life.
6. Use an AI assistant to suggest a category, department, priority and summary, while leaving every decision to people.
7. Give citizens and the public a way to follow progress by reference number.

## Scope

In scope:

| Area | What is built |
| --- | --- |
| Public website | Home, About, How it works, Departments, Contact (saved to the database), FAQ, Track a grievance |
| Citizen portal | Register, log in, log out, submit a grievance, reference number, tracking, dashboard, remarks, feedback |
| CMO dashboard | Totals, filters, grievance records and attachments, forwarding, remarks, escalation, report review, district and department statistics |
| Officer dashboard | Secure login, grievances forwarded to the department, status updates and remarks, action taken report with optional file, submission to the CMO |
| Workflow | Submitted, Under Review, In Progress, Resolved, Reopened, with a stored history |
| AI | Complaint analysis, department and category suggestion, priority, CMO summary, duplicate flagging |
| Security | JWT sessions, role based access, Cloudflare Turnstile on public forms, rate limits, validation |

Out of scope for this prototype: email or SMS notifications, payments, multilingual content, real government integrations, and virus scanning of uploads.

## Feature list

**Public**
- Six content pages plus a track page, with page titles, descriptions, canonical links, Open Graph tags, a sitemap, robots rules, a web manifest and structured data (FAQ, department list, website).
- Contact form saved to MongoDB, protected by Turnstile and a rate limit.

**Citizen**
- Register with name, email, mobile number and password. Log in and out.
- Submit a grievance with district, category, subject, description and an optional JPG, PNG or PDF up to 5 MB.
- AI assistant suggestions reviewed before submitting. Possible duplicates are flagged.
- Reference number such as `CMK-2026-123456`.
- Dashboard with submitted, pending and resolved counts, and a list of earlier grievances.
- Grievance page with public updates from the CMO and officers, attachments and feedback after resolution.

**CMO administrator**
- Total, pending, resolved and overdue counts, plus shortcuts for reports waiting for review, escalated grievances, reopen requests and unassigned grievances.
- Filters for district, category, priority, status, department, overdue and free text search.
- Grievance page: details, citizen contact, attachments, AI review, assignment history, full history including internal entries.
- Forward to a department and officer with instructions. Edit category and priority. Change status. Add internal remarks or public updates. Escalate. Accept or send back an action taken report.
- District table, department chart and status chart built from stored data.

**Department officer**
- Dashboard limited to the officer's own department.
- Progress updates, visible to the citizen or kept internal.
- Action taken report with an optional supporting file.

## Workflow

```
Citizen submits grievance
  -> System generates reference ID
  -> CMO reviews (Under Review)
  -> CMO forwards to department (In Progress)
  -> Officer investigates and updates progress
  -> Department submits action taken report
  -> CMO reviews the response
       accept: Resolved, citizen is told the outcome
       send back, or citizen is not satisfied: Reopened, back to the department
```

Rules the backend enforces:

- Only the CMO can move a grievance to Under Review or Reopened.
- A grievance becomes **Resolved** only when the CMO accepts an action taken report. There is no way to resolve it by editing the status.
- Officers can record progress and file reports, but only on grievances assigned to their department.
- A reopened grievance gets a new 30 day deadline.
- A grievance that is open past 30 days is marked overdue and can be escalated.

## Roles

| Role | Can do |
| --- | --- |
| Citizen | Register, submit, track, read public updates on own grievances, give feedback |
| CMO administrator | Everything on all grievances, except that Resolved needs an accepted report |
| Department officer | See and act on grievances forwarded to their own department |
| Public visitor | Read the website, track by reference number (status and department only), send a contact message |
