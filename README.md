# CM Kerala Grievance Portal

> **Recruitment prototype.** Built for the WhiteMatrix Software Solutions machine test (AI Full Stack Engineer). It is **not** affiliated with or endorsed by the Government of Kerala or the Chief Minister's Office. All data is fictional. Do not enter real grievances or personal details.

A working grievance redressal system: citizens submit and track grievances, the Chief Minister's Office (CMO) reviews them and forwards them to departments, officers act and report back, and the CMO closes each case. An AI assistant suggests the category, department, priority and a summary, and people make every decision.

## Links

| | |
| --- | --- |
| Hosted application | [_add the deployed URL here_](https://cm.pranavkd.dev/) |
| Documentation | [DOCUMENTATION/](DOCUMENTATION/) |

## Demo accounts

All use the password **`Demo@12345`**. These are test accounts with fictional data.

| Role | Email |
| --- | --- |
| Citizen | `citizen1@cmkerala-demo.example` (up to `citizen5`) |
| CMO administrator | `cmo@cmkerala-demo.example` |
| Department officer | `officer.local-self-government@cmkerala-demo.example` (any department: `officer.<slug>@cmkerala-demo.example`) |

Department slugs: `public-works`, `health`, `local-self-government`, `water-resources`, `general-education`, `revenue`, `power`, `home`, `agriculture`, `civil-supplies`, `transport`, `social-justice`.

## What is in it

- **Public website:** Home, About, How it works, Departments, Contact (saved to the database), FAQ, Track a grievance. Basic SEO: titles, descriptions, canonical links, Open Graph, sitemap, robots, manifest and structured data.
- **Citizen portal:** register, log in and out, submit with an optional photo or document, reference number, tracking by number, dashboard with counts, CMO and officer remarks, feedback after resolution.
- **CMO dashboard:** total, pending, resolved and overdue counts, filters, attachments, forwarding to a department and officer, internal remarks, escalation, action taken report review, district and department statistics.
- **Officer dashboard:** secure login, grievances forwarded to the department, status updates and remarks, action taken report with an optional file, submission to the CMO.
- **Workflow:** Submitted, Under Review, In Progress, Resolved, Reopened. Every change is stored with its time and the responsible user.
- **AI Grievance Assistant:** DeepSeek through an OpenAI compatible API. Suggests department, category, priority and a CMO summary, flags possible duplicates, and is reviewable by the citizen and the CMO. Without an API key it uses a clearly labelled keyword fallback.
- **Security:** JWT sessions in an `httpOnly` cookie, role based access, Cloudflare Turnstile on register, login, submit and contact, rate limiting, Zod validation, upload checks, `helmet`.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, lucide-react |
| Backend | Node.js 24, Express 5, CommonJS |
| Database | MongoDB with Mongoose |
| Auth | JWT (HS256), bcrypt, role based access |
| Captcha | Cloudflare Turnstile |
| AI | DeepSeek (OpenAI compatible chat completions) |
| Validation | Zod |
| Files | Multer, stored in MongoDB |

## Project structure

```
.
├── DOCUMENTATION/        01 to 07 markdown files and diagrams
├── backend/
│   ├── src/
│   │   ├── config/       env, database, constants
│   │   ├── models/       Mongoose schemas (CommonJS), one per collection
│   │   ├── middleware/   auth, rate limit, Turnstile, validation, upload, errors
│   │   ├── validators/   Zod schemas
│   │   ├── services/     workflow, AI, statistics, tokens
│   │   ├── controllers/  request handlers
│   │   ├── routes/       route tables
│   │   ├── utils/        errors, pagination, text, serialisers
│   │   └── scripts/      seed.js
│   └── test/             unit and integration tests
├── frontend/
│   ├── app/              pages, server actions, route handlers
│   ├── components/       UI components
│   └── lib/              API client, session, types, SEO
└── .env.example          every setting, no secrets
```

## Quick start

Requires **Node 24** (`nvm use` reads `.nvmrc`) and a MongoDB database.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # set MONGODB_URI and JWT_SECRET (openssl rand -hex 48)
npm run seed                # departments, demo accounts, 48 sample grievances
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_TURNSTILE_SITE_KEY and API_URL
npm run dev                 # http://localhost:3000
```

Cloudflare publishes test keys for local work: site key `1x00000000000000000000AA` and secret `1x0000000000000000000000000000000AA` always pass. For real keys, add every hostname you use (including `localhost`) to the widget in the Cloudflare dashboard.

To turn on the AI model, set `DEEPSEEK_API_KEY` in `backend/.env`. See [05_AI_Integration.md](DOCUMENTATION/05_AI_Integration.md).

## Tests

```bash
cd backend && npm test                                              # 12 unit tests
cd backend && RUN_INTEGRATION=1 API_URL=http://localhost:4000 npm test   # plus 18 end to end API tests
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```

Test cases are listed in [06_Setup_and_Testing.md](DOCUMENTATION/06_Setup_and_Testing.md).

## Documentation

1. [Project overview](DOCUMENTATION/01_Project_Overview.md)
2. [System architecture](DOCUMENTATION/02_System_Architecture.md), with the [architecture diagram](DOCUMENTATION/diagrams/system-architecture.md)
3. [Database design](DOCUMENTATION/03_Database_Design.md), with the [ER diagram](DOCUMENTATION/diagrams/database-er-diagram.md)
4. [API documentation](DOCUMENTATION/04_API_Documentation.md)
5. [AI integration](DOCUMENTATION/05_AI_Integration.md)
6. [Setup and testing](DOCUMENTATION/06_Setup_and_Testing.md)
7. [User guide](DOCUMENTATION/07_User_Guide.md)

## Tools and services used

- **AI coding assistant:** this project was built with Claude Code (Anthropic).
- **Third party services:** MongoDB, Cloudflare Turnstile, DeepSeek API, Google Fonts (Plus Jakarta Sans, DM Sans, Fira Code via `next/font`).
- **Open source libraries:** Next.js, React, Tailwind CSS, lucide-react, Express, Mongoose, Zod, jsonwebtoken, bcryptjs, multer, helmet, express-rate-limit, cors.

## Known limitations

- No email or SMS notifications. Citizens see updates when they sign in.
- Uploads are not virus scanned. They are limited to JPG, PNG and PDF, checked by type and leading bytes.
- Attachments live in MongoDB. Object storage would suit larger files.
- Contact enquiries are saved and readable through the CMO API (`GET /api/cmo/enquiries`) but have no screen in the CMO dashboard yet.
- The keyword fallback for the AI assistant is crude. It exists so the portal keeps working when the AI service is unavailable, and it is always labelled.
