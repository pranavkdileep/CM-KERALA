"use strict";

// Unit tests: no database or network needed.
const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "x".repeat(40);
process.env.MONGODB_URI = "mongodb://localhost/test";

const { CMO_TRANSITIONS, OFFICER_TRANSITIONS, STATUSES, CATEGORIES, CATEGORY_LIST } = require("../src/config/constants");
const { fallbackAnalysis, parseJsonReply } = require("../src/services/ai.service");
const { signToken, verifyToken } = require("../src/services/token.service");
const { similarity, hashText } = require("../src/utils/text");
const auth = require("../src/validators/auth.validators");
const grievance = require("../src/validators/grievance.validators");

test("the CMO can never jump straight to Resolved", () => {
  for (const targets of Object.values(CMO_TRANSITIONS)) assert.ok(!targets.includes(STATUSES.RESOLVED));
});

test("officers can only record In Progress", () => {
  for (const targets of Object.values(OFFICER_TRANSITIONS)) assert.deepEqual(targets, [STATUSES.IN_PROGRESS]);
});

test("every category maps to a department slug", () => {
  for (const category of CATEGORY_LIST) assert.ok(CATEGORIES[category]);
});

test("fallback analysis labels urgent safety complaints High priority", () => {
  const r = fallbackAnalysis({ description: "An electric pole near the school is leaning and there is a risk of electrocution for children." });
  assert.equal(r.priority, "High");
  assert.equal(r.category, "Electricity");
  assert.equal(r.departmentSlug, "power");
});

test("fallback analysis falls back to Other when nothing matches", () => {
  const r = fallbackAnalysis({ description: "Something unusual happened in my area yesterday and nobody explained it to me properly." });
  assert.equal(r.category, "Other");
});

test("model replies wrapped in code fences still parse", () => {
  assert.deepEqual(parseJsonReply('```json\n{"a":1}\n```'), { a: 1 });
});

test("similarity is high for near identical text and low for different text", () => {
  const a = "Streetlights on the connecting road have not been working for three weeks near the market";
  const b = "Streetlights on the connecting road not working three weeks near market junction";
  assert.ok(similarity(a, b).score > 0.6);
  assert.ok(similarity(a, "Pension not credited for five months to my mother").score < 0.2);
  assert.equal(hashText(" Hello  World "), hashText("hello world"));
});

test("tokens carry the role and are rejected when tampered with", () => {
  const { token } = signToken({ _id: "64b000000000000000000001", role: "cmo", tokenVersion: 2 });
  const payload = verifyToken(token);
  assert.equal(payload.role, "cmo");
  assert.equal(payload.tv, 2);
  assert.throws(() => verifyToken(`${token}x`), /expired|Sign in/);
});

test("registration rejects weak passwords and bad mobile numbers", () => {
  const base = { name: "Test User", email: "T@Example.com", mobile: "98765 43210", password: "abcd1234" };
  const ok = auth.register.parse(base);
  assert.equal(ok.email, "t@example.com");
  assert.equal(ok.mobile, "9876543210");
  assert.equal(auth.register.safeParse({ ...base, password: "short1" }).success, false);
  assert.equal(auth.register.safeParse({ ...base, password: "onlyletters" }).success, false);
  assert.equal(auth.register.safeParse({ ...base, mobile: "12345" }).success, false);
});

test("grievance input is validated and unknown fields are dropped", () => {
  const input = { district: "Kottayam", category: "Healthcare", subject: "No doctor at PHC", description: "There has been no doctor at the health centre for three weeks.", status: "Resolved" };
  const parsed = grievance.create.parse(input);
  assert.equal(parsed.status, undefined);
  assert.equal(grievance.create.safeParse({ ...input, district: "Atlantis" }).success, false);
});

test("rejecting an action report requires a reason", () => {
  assert.equal(grievance.reviewReport.safeParse({ decision: "reject" }).success, false);
  assert.equal(grievance.reviewReport.safeParse({ decision: "accept" }).success, true);
});

test("tracking references are normalised", () => {
  assert.equal(grievance.trackParam.parse({ ref: " cmk-2026-123456 " }).ref, "CMK-2026-123456");
  assert.equal(grievance.trackParam.safeParse({ ref: "../etc/passwd" }).success, false);
});
