"use strict";

// End to end test of the grievance workflow against a running API and database.
//   RUN_INTEGRATION=1 API_URL=http://localhost:4000 npm test
// It creates one new citizen and one new grievance each run. Turnstile is checked for real:
// use Cloudflare's always-pass test secret on the server (see .env.example).

const test = require("node:test");
const assert = require("node:assert/strict");

const API = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
const skip = process.env.RUN_INTEGRATION ? false : "set RUN_INTEGRATION=1 to run against a live API";
const CAPTCHA = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "Demo@12345";

async function call(method, path, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(`${API}${path}`, { method, headers, body });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function login(email) {
  const res = await call("POST", "/api/auth/login", { json: { email, password: PASSWORD, turnstileToken: CAPTCHA } });
  assert.equal(res.status, 200, `login ${email}: ${JSON.stringify(res.data)}`);
  return res.data.token;
}

// A 1x1 PNG.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

const ctx = {};

test("health and departments are public", { skip }, async () => {
  assert.equal((await call("GET", "/api/health")).status, 200);
  const res = await call("GET", "/api/departments");
  assert.equal(res.status, 200);
  assert.ok(res.data.items.length >= 12);
  ctx.departments = res.data.items;
});

test("captcha is enforced on login and register", { skip }, async () => {
  const noToken = await call("POST", "/api/auth/login", { json: { email: "citizen1@cmkerala-demo.example", password: PASSWORD } });
  assert.equal(noToken.status, 400);
  assert.equal(noToken.data.code, "captcha_missing");
  const wrong = await call("POST", "/api/auth/login", { json: { email: "citizen1@cmkerala-demo.example", password: "wrong-pass-1", turnstileToken: CAPTCHA } });
  assert.equal(wrong.status, 401);
});

test("a citizen registers, and weak input is rejected", { skip }, async () => {
  const bad = await call("POST", "/api/auth/register", { json: { name: "A", email: "nope", mobile: "1", password: "short", turnstileToken: CAPTCHA } });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.errors.email && bad.data.errors.password && bad.data.errors.mobile);

  ctx.email = `tester.${Date.now()}@cmkerala-demo.example`;
  const res = await call("POST", "/api/auth/register", { json: { name: "Test Citizen", email: ctx.email, mobile: "9876543210", password: PASSWORD, turnstileToken: CAPTCHA } });
  assert.equal(res.status, 201);
  assert.equal(res.data.user.role, "citizen");
  ctx.citizen = res.data.token;

  const dupe = await call("POST", "/api/auth/register", { json: { name: "Test Citizen", email: ctx.email, mobile: "9876543210", password: PASSWORD, turnstileToken: CAPTCHA } });
  assert.equal(dupe.status, 409);
});

test("the AI assistant returns reviewable suggestions", { skip }, async () => {
  const description = "The streetlights on the connecting road near the bus stop have been off for three weeks and it is unsafe for women at night.";
  const res = await call("POST", "/api/grievances/analyze", { token: ctx.citizen, json: { description, district: "Kottayam" } });
  assert.equal(res.status, 200);
  assert.ok(["ai", "fallback"].includes(res.data.source));
  assert.ok(["Low", "Medium", "High"].includes(res.data.priority));
  assert.ok(res.data.summary.length > 0);
  assert.ok(res.data.disclaimer);
  ctx.analysis = res.data;
  ctx.description = description;
});

test("a citizen submits a grievance with an attachment", { skip }, async () => {
  const form = new FormData();
  form.set("district", "Kottayam");
  form.set("category", ctx.analysis.category);
  form.set("subject", "Streetlights off on the connecting road");
  form.set("description", ctx.description);
  form.set("analysisId", ctx.analysis.analysisId);
  form.set("turnstileToken", CAPTCHA);
  form.set("attachment", new Blob([PNG], { type: "image/png" }), "photo.png");

  const res = await call("POST", "/api/grievances", { token: ctx.citizen, form });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  assert.match(res.data.referenceId, /^CMK-\d{4}-\d{6}$/);
  assert.equal(res.data.status, "Submitted");
  ctx.id = res.data.id;
  ctx.ref = res.data.referenceId;
});

test("files that are not images or PDFs are refused", { skip }, async () => {
  const form = new FormData();
  form.set("district", "Kottayam");
  form.set("category", "Other");
  form.set("subject", "Bad file test subject");
  form.set("description", ctx.description);
  form.set("turnstileToken", CAPTCHA);
  form.set("attachment", new Blob(["MZ not an image"], { type: "image/png" }), "evil.png");
  const res = await call("POST", "/api/grievances", { token: ctx.citizen, form });
  assert.equal(res.status, 400);
});

test("public tracking shows progress but no personal details", { skip }, async () => {
  const res = await call("GET", `/api/grievances/track/${ctx.ref}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.status, "Submitted");
  assert.equal(res.data.history[0].title, "Submitted");
  const json = JSON.stringify(res.data);
  assert.ok(!json.includes("Test Citizen") && !json.includes(ctx.email) && !json.includes("connecting road"));
  assert.equal((await call("GET", "/api/grievances/track/CMK-2026-000000")).status, 404);
});

test("role checks: citizens cannot use CMO or officer endpoints", { skip }, async () => {
  assert.equal((await call("GET", "/api/cmo/stats", { token: ctx.citizen })).status, 403);
  assert.equal((await call("GET", "/api/officer/grievances", { token: ctx.citizen })).status, 403);
  assert.equal((await call("GET", "/api/cmo/stats")).status, 401);
  const other = await login("citizen2@cmkerala-demo.example");
  assert.equal((await call("GET", `/api/grievances/${ctx.id}`, { token: other })).status, 404);
});

test("the CMO reviews, filters and sees statistics", { skip }, async () => {
  ctx.cmo = await login("cmo@cmkerala-demo.example");
  const stats = await call("GET", "/api/cmo/stats", { token: ctx.cmo });
  assert.equal(stats.status, 200);
  const { total, pending, resolved, overdue } = stats.data.totals;
  assert.ok(total > 0 && pending + resolved === total && overdue >= 0);
  assert.ok(stats.data.byDistrict.length > 0 && stats.data.byDepartment.length > 0);

  const list = await call("GET", `/api/cmo/grievances?district=Kottayam&status=Submitted&q=${encodeURIComponent(ctx.ref)}`, { token: ctx.cmo });
  assert.equal(list.status, 200);
  assert.equal(list.data.items[0].referenceId, ctx.ref);

  const detail = await call("GET", `/api/grievances/${ctx.id}`, { token: ctx.cmo });
  assert.equal(detail.data.grievance.attachments.length, 1);
  assert.ok(detail.data.grievance.ai.summary);

  const download = await fetch(`${API}/api/attachments/${detail.data.grievance.attachments[0].id}`, { headers: { Authorization: `Bearer ${ctx.cmo}` } });
  assert.equal(download.status, 200);
  assert.equal(download.headers.get("content-type"), "image/png");
});

test("the CMO cannot resolve without a department report", { skip }, async () => {
  const res = await call("PATCH", `/api/grievances/${ctx.id}/status`, { token: ctx.cmo, json: { status: "Resolved" } });
  assert.equal(res.status, 400);
  const noAssign = await call("PATCH", `/api/grievances/${ctx.id}/status`, { token: ctx.cmo, json: { status: "In Progress" } });
  assert.equal(noAssign.status, 400);
});

test("the CMO forwards the grievance to a department officer", { skip }, async () => {
  const dept = ctx.departments.find((d) => d.slug === "local-self-government");
  const officers = await call("GET", `/api/cmo/officers?department=${dept.id}`, { token: ctx.cmo });
  assert.equal(officers.data.items.length, 1);
  const res = await call("POST", `/api/cmo/grievances/${ctx.id}/assign`, {
    token: ctx.cmo,
    json: { departmentId: dept.id, officerId: officers.data.items[0].id, instructions: "Inspect and restore the lights." },
  });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  assert.equal(res.data.grievance.status, "In Progress");
  assert.equal(res.data.grievance.department.slug, "local-self-government");

  const wrongOfficer = await call("POST", `/api/cmo/grievances/${ctx.id}/assign`, {
    token: ctx.cmo,
    json: { departmentId: ctx.departments.find((d) => d.slug === "health").id, officerId: officers.data.items[0].id },
  });
  assert.equal(wrongOfficer.status, 400);
});

test("only the assigned department's officer can see and act on it", { skip }, async () => {
  const wrongOfficerToken = await login("officer.health@cmkerala-demo.example");
  assert.equal((await call("GET", `/api/grievances/${ctx.id}`, { token: wrongOfficerToken })).status, 404);

  ctx.officer = await login("officer.local-self-government@cmkerala-demo.example");
  const list = await call("GET", `/api/officer/grievances?q=${encodeURIComponent(ctx.ref)}`, { token: ctx.officer });
  assert.equal(list.data.items.length, 1);

  const progress = await call("PATCH", `/api/grievances/${ctx.id}/status`, { token: ctx.officer, json: { status: "In Progress", remark: "Electrician team visited the site." } });
  assert.equal(progress.status, 200);
  const resolve = await call("PATCH", `/api/grievances/${ctx.id}/status`, { token: ctx.officer, json: { status: "Resolved" } });
  assert.equal(resolve.status, 400);
});

test("the officer files an action taken report with a document", { skip }, async () => {
  const form = new FormData();
  form.set("summary", "All 14 streetlights replaced");
  form.set("details", "Replaced faulty lamps and the control panel on the connecting road. Tested after dark and all lights are working.");
  form.set("attachment", new Blob([Buffer.from("%PDF-1.4 test")], { type: "application/pdf" }), "report.pdf");
  const res = await call("POST", `/api/officer/grievances/${ctx.id}/action-report`, { token: ctx.officer, form });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  assert.equal(res.data.grievance.actionReportStatus, "pending");

  const again = await call("POST", `/api/officer/grievances/${ctx.id}/action-report`, { token: ctx.officer, form: (() => { const f = new FormData(); f.set("summary", "Second report"); f.set("details", "x".repeat(30)); return f; })() });
  assert.equal(again.status, 409);
});

test("the CMO adds remarks, escalates, then accepts the report", { skip }, async () => {
  const remark = await call("POST", `/api/grievances/${ctx.id}/remarks`, { token: ctx.cmo, json: { text: "Checked the report with the engineer.", visibility: "internal" } });
  assert.equal(remark.status, 201);

  const escalate = await call("POST", `/api/cmo/grievances/${ctx.id}/escalate`, { token: ctx.cmo, json: { reason: "Testing the escalation path." } });
  assert.equal(escalate.status, 200);
  assert.equal(escalate.data.grievance.escalationLevel, 1);

  const review = await call("POST", `/api/cmo/grievances/${ctx.id}/review-report`, { token: ctx.cmo, json: { decision: "accept", remark: "Verified.", citizenMessage: "Your streetlights have been repaired." } });
  assert.equal(review.status, 200);
  assert.equal(review.data.grievance.status, "Resolved");
});

test("the citizen sees only public updates and can give feedback once", { skip }, async () => {
  const detail = await call("GET", `/api/grievances/${ctx.id}`, { token: ctx.citizen });
  const g = detail.data.grievance;
  assert.equal(g.status, "Resolved");
  assert.ok(g.history.every((h) => h.visibility === "public"));
  assert.ok(!g.history.some((h) => /Checked the report with the engineer/.test(h.remark || "")));
  assert.ok(g.history.some((h) => h.remark === "Your streetlights have been repaired."));
  assert.equal(g.attachments.every((a) => a.kind === "evidence"), true);
  assert.equal(g.canGiveFeedback, true);

  const fb = await call("POST", `/api/grievances/${ctx.id}/feedback`, { token: ctx.citizen, json: { rating: 5, satisfied: true, comment: "Thanks." } });
  assert.equal(fb.status, 201);
  assert.equal((await call("POST", `/api/grievances/${ctx.id}/feedback`, { token: ctx.citizen, json: { rating: 4, satisfied: true } })).status, 409);

  const mine = await call("GET", "/api/grievances/mine", { token: ctx.citizen });
  assert.equal(mine.data.counts.resolved, 1);
});

test("every status change is stored with a time and the responsible user", { skip }, async () => {
  const detail = await call("GET", `/api/grievances/${ctx.id}`, { token: ctx.cmo });
  const changes = detail.data.grievance.history.filter((h) => h.action === "status_change" || h.action === "submitted");
  assert.deepEqual(changes.map((h) => h.toStatus), ["Submitted", "Under Review", "In Progress", "Resolved"]);
  for (const h of detail.data.grievance.history) {
    assert.ok(h.at && h.actorName && h.actorRole);
  }
  const times = detail.data.grievance.history.map((h) => new Date(h.at).getTime());
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
});

test("logging out revokes the token", { skip }, async () => {
  assert.equal((await call("GET", "/api/auth/me", { token: ctx.citizen })).status, 200);
  assert.equal((await call("POST", "/api/auth/logout", { token: ctx.citizen })).status, 200);
  assert.equal((await call("GET", "/api/auth/me", { token: ctx.citizen })).status, 401);
});

test("contact enquiries are saved", { skip }, async () => {
  const res = await call("POST", "/api/enquiries", { json: { name: "Test Visitor", email: "visitor@example.com", subject: "Question about tracking", message: "How do I find my reference number?", turnstileToken: CAPTCHA } });
  assert.equal(res.status, 201);
  const bad = await call("POST", "/api/enquiries", { json: { name: "", email: "x", subject: "", message: "short", turnstileToken: CAPTCHA } });
  assert.equal(bad.status, 400);
});
