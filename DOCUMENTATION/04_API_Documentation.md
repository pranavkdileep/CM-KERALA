# 04. API Documentation

Base URL in development: `http://localhost:4000`. All endpoints are under `/api`. Requests and responses are JSON unless noted.

## Conventions

**Authentication.** Send `Authorization: Bearer <token>` on every protected endpoint. Get a token from register or login. In the web app the Next.js server does this for the browser.

**Captcha.** Endpoints marked *captcha* need a Cloudflare Turnstile token in the body field `turnstileToken` (or the `X-Turnstile-Token` header). For local testing Cloudflare's always pass secret (`1x0000000000000000000000000000000AA`) accepts any token string.

**Errors.** Every error looks like:

```json
{ "error": "Check the highlighted fields.", "code": "bad_request", "errors": { "email": "Enter an email address like name@example.com." } }
```

| Status | Meaning |
| --- | --- |
| 400 | Validation failed, or the move is not allowed. `errors` maps field names to messages |
| 401 | Missing, invalid or revoked token |
| 403 | Signed in with the wrong role |
| 404 | Not found, or you are not allowed to see it |
| 409 | Conflict, for example an email already registered |
| 413 | Body too large |
| 429 | Rate limit reached |
| 503 | Captcha service or database unavailable |

**Pagination.** Lists accept `page` and `limit` (default 20, maximum 50) and return `{ items, page, limit, total, pages }`.

**Rate limits** (per `X-Forwarded-For` address unless noted; the 429 body explains how long to wait):

| Scope | Limit |
| --- | --- |
| All requests | 600 per 15 minutes |
| Login | 10 per 15 minutes per address and email |
| Register | 8 per hour |
| Contact enquiry | 5 per hour |
| Track by reference | 60 per 15 minutes |
| Submit grievance | 10 per hour per user |
| AI analysis | 20 per 15 minutes per user |
| Write actions (CMO, officer, feedback) | 200 per 15 minutes per user |

## Health and public

### GET /api/health
`200 { "status": "ok" }`, or `503 { "status": "database_unavailable" }`.

### GET /api/departments
```json
{ "items": [ { "id": "6913...", "name": "Public Works", "slug": "public-works", "description": "State roads, bridges..." } ] }
```

### POST /api/enquiries  *captcha*
Body: `name` (2 to 100), `email`, `subject` (3 to 150), `message` (10 to 2000).
`201 { "id": "...", "createdAt": "..." }`

### GET /api/grievances/track/:ref
`ref` looks like `CMK-2026-123456`. Public. Returns progress only, never the subject, description, remarks or personal details.
```json
{
  "referenceId": "CMK-2026-123456",
  "status": "In Progress",
  "district": "Kottayam",
  "category": "Sanitation and Waste",
  "department": "Local Self Government",
  "submittedAt": "2026-11-11T09:14:00.000Z",
  "updatedAt": "2026-11-12T11:02:00.000Z",
  "isOverdue": false,
  "history": [
    { "status": "Submitted", "title": "Submitted", "at": "2026-11-11T09:14:00.000Z" },
    { "status": "In Progress", "title": "Forwarded to a department", "at": "2026-11-12T11:02:00.000Z" }
  ]
}
```
`404` if the reference does not exist.

## Authentication

### POST /api/auth/register  *captcha*
Body: `name`, `email`, `mobile` (10 digit Indian number, `+91` and spaces allowed), `password` (8 to 72 characters with a letter and a number). Creates a citizen.
```json
{ "user": { "id": "...", "name": "Test Citizen", "email": "t@example.com", "mobile": "9876543210", "role": "citizen", "department": null },
  "token": "eyJhbGciOi...", "expiresAt": "2026-11-12T19:00:00.000Z" }
```
`409` if the email is already registered.

### POST /api/auth/login  *captcha*
Body: `email`, `password`. Returns the same shape as register. `401` for a wrong email or password (the message does not say which).

### POST /api/auth/logout
Revokes every token issued to the user so far. `200 { "ok": true }`.

### GET /api/auth/me
`200 { "user": { ... } }` for the token's owner.

## AI Grievance Assistant

### POST /api/grievances/analyze   citizen, CMO
Body: `description` (20 to 4000), `district` (optional).
```json
{
  "analysisId": "6914...",
  "category": "Sanitation and Waste",
  "department": "Local Self Government",
  "priority": "Medium",
  "summary": "Streetlights on the connecting road near the bus stop have been off for three weeks, making it unsafe for women at night.",
  "reasoning": "Streetlights fall under local bodies. No immediate danger to life.",
  "source": "ai",
  "model": "deepseek-flash",
  "note": null,
  "duplicates": [ { "referenceId": "CMK-2026-531244", "score": 0.71 } ],
  "disclaimer": "These are suggestions only. The Chief Minister's Office reviews every grievance and decides where it goes."
}
```
`source` is `"ai"` when a model answered and `"fallback"` when the labelled keyword heuristic was used. `note` is then `"not_configured"` or `"service_error"`. Nothing is saved on any grievance by this call.

## Citizen

### POST /api/grievances   citizen, *captcha*, multipart/form-data
Fields: `district`, `category`, `subject` (5 to 150), `description` (20 to 4000), `analysisId` (optional), `attachment` (optional JPG, PNG or PDF, 5 MB), `turnstileToken`.
If `analysisId` is missing, or the description changed after the analysis, the assistant runs again on the server. The assistant's priority is stored as the grievance priority. The CMO makes the final call.
```json
{ "id": "6915...", "referenceId": "CMK-2026-123456", "status": "Submitted", "dueDate": "2026-12-12T09:14:00.000Z" }
```

### GET /api/grievances/mine   citizen
```json
{ "counts": { "total": 4, "pending": 3, "resolved": 1 }, "items": [ { "id": "...", "referenceId": "...", "subject": "...", "status": "In Progress", "priority": "High", "department": { "id": "...", "name": "Power", "slug": "power" }, "dueDate": "...", "isOverdue": false } ] }
```

### POST /api/grievances/:id/feedback   citizen
Only when the grievance is Resolved. Body: `rating` (1 to 5), `satisfied` (true or false), `comment` (optional). `satisfied: false` flags the grievance for the CMO to reopen. `409` if feedback was already left on this resolution.

## Any signed in role

### GET /api/grievances/:id
`:id` is the database id or the reference number. Access rules apply (see architecture). Returns `{ "grievance": { ... } }` with:

- the list fields (reference, status, priority, department, officer, dates, `isOverdue`, `escalationLevel`)
- `description`, `ai` (suggestion and source), `history[]`, `attachments[]`, `feedback[]`, `resolution`
- for staff: `assignments[]` with action reports, `escalation`, `allowedStatuses` (the moves the caller may make)
- for the CMO: `citizen` contact details
- for citizens: only `public` history entries and `evidence` attachments, plus `canGiveFeedback`

### PATCH /api/grievances/:id/status   CMO, officer
Body: `status`, `remark` (optional), `visibility` (`public` or `internal`, default `public`).
Allowed moves are in `allowedStatuses`. `Resolved` is rejected here, it needs an accepted report. An officer posting `In Progress` on an In Progress grievance records a progress note and needs a `remark`.
Returns `{ "grievance": { ... } }`.

### POST /api/grievances/:id/remarks   CMO, officer
Body: `text` (2 to 2000), `visibility` (`internal` by default). `201`.

### GET /api/attachments/:id
Streams the file with its content type. The same access rules as the grievance apply. Citizens cannot read action report files.

## CMO administrator

### GET /api/cmo/stats
```json
{
  "totals": { "total": 53, "resolved": 20, "pending": 33, "overdue": 12, "escalated": 8, "awaitingReview": 3, "reopenRequested": 3, "unassigned": 15 },
  "byStatus": { "Submitted": 8, "Under Review": 7, "In Progress": 12, "Resolved": 20, "Reopened": 6 },
  "byPriority": { "High": 20, "Medium": 24, "Low": 9 },
  "byDistrict": [ { "name": "Kottayam", "total": 9, "resolved": 3, "pending": 6, "overdue": 2 } ],
  "byCategory": [ ... ],
  "byDepartment": [ { "id": "...", "name": "Local Self Government", "total": 8, "resolved": 2, "pending": 6, "overdue": 3 } ],
  "averageResolutionDays": 9.6
}
```

### GET /api/cmo/grievances
Query filters: `district`, `category`, `priority`, `status`, `department` (id), `overdue=true`, `escalated=true`, `awaitingReview=true`, `reopenRequested=true`, `q` (reference or subject), `page`, `limit`. Returns a page of list items including `citizenName`.

### GET /api/cmo/officers?department=:id
`{ "items": [ { "id": "...", "name": "...", "designation": "...", "department": { ... } } ] }`

### GET /api/cmo/enquiries
Page of contact enquiries.

### PATCH /api/cmo/grievances/:id/triage
Body: `category` and/or `priority`. Records a "CMO review" history entry. Used to correct the assistant.

### POST /api/cmo/grievances/:id/assign
Body: `departmentId`, `officerId` (optional, must belong to that department), `instructions` (optional).
Moves Submitted to Under Review if needed, supersedes the previous assignment, creates a new one, and sets the status to In Progress. The citizen sees the department name.

### POST /api/cmo/grievances/:id/escalate
Body: `reason` (5 to 1000). Increases the escalation level. Adds an internal entry with the reason and a public entry saying the CMO escalated it.

### POST /api/cmo/grievances/:id/review-report
Body: `decision` (`accept` or `reject`), `remark` (required for `reject`), `citizenMessage` (optional).
- `accept`: status becomes **Resolved**, the citizen sees `citizenMessage`.
- `reject`: status becomes **Reopened** and the report goes back to the department.
`400` if no report is waiting.

## Department officer

### GET /api/officer/stats
Same shape as the CMO statistics, limited to the officer's department, with a `department` object.

### GET /api/officer/grievances
Same filters as the CMO list. The department filter is forced to the officer's own department.

### POST /api/officer/grievances/:id/action-report   multipart/form-data
Fields: `summary` (5 to 300), `details` (20 to 4000), `attachment` (optional). Only on In Progress or Reopened grievances. `409` if a report is already waiting. Sets `actionReportStatus` to `pending` for the CMO to review.

## Example session with curl

```bash
API=http://localhost:4000
TOKEN=$(curl -s $API/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"citizen1@cmkerala-demo.example","password":"Demo@12345","turnstileToken":"test"}' | jq -r .token)

curl -s $API/api/grievances/mine -H "authorization: Bearer $TOKEN"
```
