# 06. Setup and Testing

## Requirements

- **Node.js 24** (22 or 24 work, see `.nvmrc`). Next.js 16 does not run on Node 27 alpha builds, where it fails with `headers.hasOwnProperty is not a function`.
- A MongoDB database (local or hosted).
- A Cloudflare Turnstile widget (site key and secret key).
- Optional: a DeepSeek API key for the AI model.

```bash
nvm use        # reads .nvmrc
```

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run seed              # departments, demo accounts, 48 sample grievances
npm run dev               # http://localhost:4000
```

Generate a JWT secret with `openssl rand -hex 48`.

### Backend environment variables (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no | `development` or `production` |
| `PORT` | no | API port, default 4000 |
| `MONGODB_URI` | yes | MongoDB connection string |
| `MONGODB_DB` | no | Database name, default `cm-kerala` |
| `JWT_SECRET` | yes | 32 or more random characters |
| `JWT_EXPIRES_IN_SECONDS` | no | Session length, default 28800 (8 hours) |
| `CORS_ORIGIN` | no | Allowed browser origins, comma separated |
| `TRUST_PROXY` | no | Proxy hops in front of the API, default 1 |
| `TURNSTILE_SECRET_KEY` | yes in production | Cloudflare secret. Locally, `1x0000000000000000000000000000000AA` always passes |
| `AI_BASE_URL`, `AI_MODEL` | no | LLM endpoint and model |
| `DEEPSEEK_API_KEY` | no | Enables the AI model. Empty means the labelled fallback |
| `UPLOAD_MAX_MB` | no | Upload limit, default 5 |
| `SLA_DAYS` | no | Days before a grievance is overdue, default 30 |

The API refuses to start if `MONGODB_URI` is missing, `JWT_SECRET` is shorter than 32 characters, or (in production) `TURNSTILE_SECRET_KEY` is missing.

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

### Frontend environment variables (`frontend/.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for canonical links, sitemap and Open Graph |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile **site** key (public). `1x00000000000000000000AA` is Cloudflare's always pass test key |
| `API_URL` | Address of the Express API, read on the server only |

`NEXT_PUBLIC_` values are compiled into the build, so rebuild after changing them.

In the Cloudflare dashboard, add every hostname the site runs on (for example `localhost` and the deployed domain) to the widget's hostname list.

## 3. Production build

```bash
cd frontend && npm run build && npm start
cd backend  && NODE_ENV=production npm start
```

## Demo accounts

All demo accounts use the password **`Demo@12345`**. The data is fictional.

| Role | Email |
| --- | --- |
| CMO administrator | `cmo@cmkerala-demo.example` |
| Department officer | `officer.<department-slug>@cmkerala-demo.example`, for example `officer.local-self-government@cmkerala-demo.example` |
| Citizen | `citizen1@cmkerala-demo.example` to `citizen5@cmkerala-demo.example` |

Department slugs: `public-works`, `health`, `local-self-government`, `water-resources`, `general-education`, `revenue`, `power`, `home`, `agriculture`, `civil-supplies`, `transport`, `social-justice`.

## Automated tests

```bash
cd backend
npm test                                   # 12 unit tests, no database needed

# 18 end to end API tests against a running API and database
RUN_INTEGRATION=1 API_URL=http://localhost:4000 npm test
```

The integration run creates one new citizen and one new grievance each time. It checks Turnstile for real, so the API needs `TURNSTILE_SECRET_KEY` set (the Cloudflare test secret is fine).

Frontend checks:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Test cases

### Unit tests (`backend/test/units.test.js`)

| # | Case | Expected |
| --- | --- | --- |
| 1 | CMO status transitions | No transition leads straight to Resolved |
| 2 | Officer status transitions | Officers can only record In Progress |
| 3 | Category mapping | Every category maps to a department slug |
| 4 | Fallback, pole near a school | High priority, Electricity, `power` |
| 5 | Fallback, nothing matches | Category Other |
| 6 | Model reply wrapped in code fences | Still parses |
| 7 | Text similarity | High for near identical text, low for different text |
| 8 | JWT | Carries role and version, a tampered token is rejected |
| 9 | Registration validation | Weak password and bad mobile rejected, email lowercased, mobile normalised |
| 10 | Grievance validation | Bad district rejected, unknown fields dropped |
| 11 | Report review | Rejecting needs a reason |
| 12 | Reference parsing | Normalised, path traversal rejected |

### Integration tests (`backend/test/workflow.integration.test.js`)

| # | Case | Expected |
| --- | --- | --- |
| 1 | Health and departments | 200, at least 12 departments |
| 2 | Login without a captcha token | 400 `captcha_missing`. Wrong password gives 401 |
| 3 | Register with bad input, then valid, then again | 400 with field errors, 201, 409 |
| 4 | AI analyse | Category, priority, summary, source and disclaimer returned |
| 5 | Submit with a PNG | 201, reference `CMK-YYYY-NNNNNN` |
| 6 | Submit a fake PNG (executable bytes) | 400 |
| 7 | Public tracking | Status and history, no name, email or subject. Unknown reference gives 404 |
| 8 | Role checks | Citizen gets 403 on CMO and officer endpoints, 401 without a token, 404 on another citizen's grievance |
| 9 | CMO statistics, filter, detail, download | Counts add up, filter finds the grievance, attachment downloads |
| 10 | CMO cannot resolve directly or move to In Progress unassigned | 400 |
| 11 | CMO forwards to department and officer | In Progress, wrong department's officer rejected |
| 12 | Officer scope | Other department's officer gets 404, own officer sees it, cannot set Resolved |
| 13 | Officer action report with a PDF | 201, `pending`. A second report gives 409 |
| 14 | CMO remark, escalation, accept report | Escalation level 1, status Resolved |
| 15 | Citizen view | Only public history, no internal remarks, feedback accepted once, second gives 409 |
| 16 | History | Submitted, Under Review, In Progress, Resolved in order, every row has time and actor |
| 17 | Logout | Same token then gets 401 |
| 18 | Contact enquiry | Saved with 201, invalid input gives 400 |

### Browser walk through (verified with an automated browser)

1. Citizen signs in, opens Submit, picks a district, writes a description and selects **Get AI suggestions**. The panel shows the suggestion with its source label and the category is pre-filled.
2. Submit with a too short subject: the field error appears and every typed value is kept.
3. Submit correctly with a photo: the grievance page opens with the reference number and the attachment.
4. A signed out visitor tracks the reference: status shown, subject not shown.
5. A signed out visitor opens `/cmo`: redirected to sign in.
6. CMO filters by the reference, opens it, forwards it to Local Self Government with an officer and instructions.
7. Officer opens it, posts a public progress note, files an action taken report with a PDF.
8. CMO accepts the report with a message to the citizen: the status becomes Resolved.
9. Citizen sees the public updates but no internal ones, downloads the attachment, sends feedback.
10. Sign out, then open `/dashboard`: redirected to sign in.

### Security checks

- Citizens cannot read other citizens' grievances or any staff endpoint.
- Officers cannot read grievances outside their department.
- Tokens stop working after logout.
- Public tracking exposes no personal data.
- Files are checked by extension, MIME type and leading bytes.
- All writes are validated server side.
- Passwords are hashed and never returned. No secrets are in the repository.

## Deployment checklist

1. Create a MongoDB database and put its URI in the API's `MONGODB_URI`.
2. Deploy `backend/` to a Node host. Set the variables above, `NODE_ENV=production` and a real `TURNSTILE_SECRET_KEY`. Run `npm run seed` once.
3. Deploy `frontend/`. Set `API_URL` to the API's address, `NEXT_PUBLIC_SITE_URL` to the public URL and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the real site key.
4. Add the public hostname to the Turnstile widget.
5. Open the hosted site, sign in with each demo account and run through the walk through above.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `headers.hasOwnProperty is not a function` | Running on Node 27. Use Node 24 (`nvm use`) |
| "Complete the verification check" | The Turnstile widget has not finished. Wait for the tick, or check the hostname list in Cloudflare |
| Turnstile shows error 110200 | The hostname is not allowed for the widget. Add it in the Cloudflare dashboard |
| 503 "Verification is unavailable" | The API could not reach Cloudflare |
| Everyone gets rate limited together | `X-Forwarded-For` is not reaching the API. Check `TRUST_PROXY` |
| AI suggestions say "Keyword suggestion" | No `DEEPSEEK_API_KEY`, or the AI call failed. Check the API log |
