# 03. Database Design

MongoDB, accessed through Mongoose. The schemas are CommonJS modules in `backend/src/models/`, one file per collection, all exported together from `models/index.js`. The ER diagram is in [diagrams/database-er-diagram.md](diagrams/database-er-diagram.md).

## Collections

### users
Citizens, CMO administrators and department officers in one collection, told apart by `role`.

| Field | Type | Notes |
| --- | --- | --- |
| name | String | 2 to 100 characters |
| email | String | lowercase, **unique** |
| mobile | String | 10 digit Indian number, validated |
| passwordHash | String | bcrypt, `select: false` |
| role | String | `citizen`, `cmo` or `officer`, indexed |
| department | ObjectId to departments | set only for officers, indexed |
| designation | String | for staff |
| isActive | Boolean | deactivated users cannot sign in |
| tokenVersion | Number | `select: false`. Incremented on logout to revoke tokens |
| lastLoginAt | Date | |
| createdAt, updatedAt | Date | timestamps |

### departments
| Field | Type | Notes |
| --- | --- | --- |
| name | String | |
| slug | String | **unique**, for example `public-works` |
| description | String | |
| isActive | Boolean | only active departments can receive grievances |

### grievances
The main record.

| Field | Type | Notes |
| --- | --- | --- |
| referenceId | String | **unique**, `CMK-YYYY-NNNNNN`, six random digits so references cannot be guessed in order |
| citizen | ObjectId to users | indexed |
| district | String | one of the 14 districts, indexed |
| category | String | one of 13 categories, indexed |
| subject, description | String | 5 to 150 and 20 to 4000 characters |
| priority | String | `Low`, `Medium`, `High`, indexed |
| status | String | `Submitted`, `Under Review`, `In Progress`, `Resolved`, `Reopened`, indexed |
| department, officer | ObjectId | current routing, indexed |
| currentAssignment | ObjectId to departmentassignments | |
| actionReportStatus | String | `none`, `pending`, `accepted`, `rejected`. A copy kept here so the CMO can filter on it |
| ai | Object | copy of the assistant's suggestion (source, model, category, department, priority, summary, duplicates, whether the citizen chose a different category) |
| escalation | Object | level, reason, time, user |
| reopenRequested | Boolean | set when a citizen is not satisfied |
| dueDate | Date | created time plus 30 days, reset when reopened |
| resolvedAt | Date | |

Compound indexes: `(createdAt desc)` and `(department, status)`.

### grievancehistories
An append only log. One row for every submission, status change, assignment, remark, escalation, report, report review, feedback and triage edit.

| Field | Type | Notes |
| --- | --- | --- |
| grievance | ObjectId | indexed with `createdAt` |
| action | String | `submitted`, `status_change`, `assigned`, `remark`, `escalated`, `action_report`, `report_review`, `feedback`, `triage` |
| fromStatus, toStatus | String | for status changes |
| remark | String | |
| visibility | String | `public` is shown to the citizen, `internal` only to staff |
| actor, actorName, actorRole | | **who** made the change, kept even if the user is renamed later |
| createdAt | Date | **when** |

This is what makes each grievance traceable for its whole life.

### departmentassignments
One row each time the CMO forwards a grievance. Reassigning marks older rows `superseded`.

| Field | Type | Notes |
| --- | --- | --- |
| grievance, department | ObjectId | |
| officer | ObjectId | optional |
| assignedBy | ObjectId | the CMO user |
| instructions | String | |
| state | String | `active`, `superseded`, `completed` |
| actionReport | Object | summary, details, attachment, submittedBy, submittedAt, reviewStatus, reviewedBy, reviewedAt, reviewRemark |

### attachments
| Field | Type | Notes |
| --- | --- | --- |
| grievance, uploadedBy | ObjectId | |
| kind | String | `evidence` (citizen) or `action_report` (officer) |
| originalName, mimeType, size | | |
| data | Buffer | file bytes, `select: false` so lists never load them |

### feedbacks
`grievance`, `citizen`, `rating` (1 to 5), `satisfied` (Boolean), `comment`. One entry per resolution.

### contactenquiries
`name`, `email`, `subject`, `message`, `status` (`new`, `read`, `closed`), timestamps. Written by the public contact form.

### aianalyses
The assistant's stored answer: `user`, `category`, `department`, `departmentName`, `priority`, `summary`, `reasoning`, `source` (`ai` or `fallback`), `model`, `duplicates`, `inputHash` (hash of the analysed text). It expires automatically after 24 hours (TTL index on `createdAt`) if the citizen never submits.

## Relationships

- A citizen has many grievances. A grievance belongs to one citizen.
- An officer belongs to one department. A department has many officers and, over time, many grievances.
- A grievance has many history rows, assignments, attachments and feedback rows.
- A grievance has exactly one **current** assignment and any number of older ones.
- An action taken report lives inside its assignment and may point to one attachment.

## Design decisions

- **One users collection with roles** keeps login and token handling simple. Role specific data (department, designation) is optional.
- **History is separate and append only** so it cannot be lost by editing a grievance, and so public and internal entries can be filtered with one query.
- **Assignments are separate rows** so reassignment keeps the earlier routing and its reports.
- **Denormalised copies** (`actionReportStatus`, `ai`, `actorName`) avoid joins in the dashboards and keep history readable if records change later.
- **Attachments in MongoDB** keep the app stateless for hosting. For large files a move to object storage would be the next step.
- **Sensitive fields** (`passwordHash`, `tokenVersion`, attachment `data`) are `select: false`.

## Sample data

`npm run seed` in `backend/` creates 12 departments, 12 officers (one per department), 1 CMO account, 5 citizens and 48 grievances spread over all districts, categories and statuses, with histories, assignments, action reports and feedback. Everything is fictional. `npm run seed -- --reset` rebuilds the grievances. Accounts are never deleted by the script.
