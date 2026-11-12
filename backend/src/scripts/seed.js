"use strict";

// Fills the database with fictional demo data.
//   npm run seed            adds departments and demo accounts, and grievances if there are none
//   npm run seed -- --reset deletes grievances, history, assignments, files, feedback and AI notes first
// Citizen, CMO and officer accounts are never deleted by this script.

const bcrypt = require("bcryptjs");
const { env, assertEnv } = require("../config/env");
const { connectDb, disconnectDb } = require("../config/db");
const { CATEGORIES, DISTRICTS, HISTORY_ACTIONS, REPORT_STATES, ROLES, STATUSES, VISIBILITY } = require("../config/constants");
const models = require("../models");
const { fallbackAnalysis } = require("../services/ai.service");
const { generateReferenceId } = require("../services/grievance.service");
const { hashText } = require("../utils/text");

const { Department, User, Grievance, GrievanceHistory, DepartmentAssignment, Attachment, Feedback, AiAnalysis } = models;

const DEMO_PASSWORD = "Demo@12345";
const DAY = 24 * 60 * 60 * 1000;

const DEPARTMENTS = [
  { slug: "public-works", name: "Public Works", description: "State roads, bridges and government buildings, from potholes to stalled construction." },
  { slug: "health", name: "Health and Family Welfare", description: "Government hospitals, primary health centres, medicine supply and public health drives." },
  { slug: "local-self-government", name: "Local Self Government", description: "Panchayats, municipalities and corporations: streetlights, waste collection, building permits and certificates." },
  { slug: "water-resources", name: "Water Resources", description: "Drinking water supply, pipeline leaks, irrigation canals and flood protection works." },
  { slug: "general-education", name: "General Education", description: "Government and aided schools, scholarships, mid day meals and school infrastructure." },
  { slug: "revenue", name: "Revenue", description: "Land records, village office services, disaster relief payments and revenue certificates." },
  { slug: "power", name: "Power", description: "Electricity supply, new connections, billing disputes and dangerous lines or poles." },
  { slug: "home", name: "Home", description: "Police services, public safety and delays in complaint registration or action." },
  { slug: "agriculture", name: "Agriculture and Farmers' Welfare", description: "Crop insurance, subsidies, seed and fertiliser supply and procurement payments." },
  { slug: "civil-supplies", name: "Food and Civil Supplies", description: "Ration cards, ration shop service and the public distribution system." },
  { slug: "transport", name: "Transport", description: "Public bus services, driving licences, vehicle registration and road safety." },
  { slug: "social-justice", name: "Social Justice", description: "Welfare pensions, support for persons with disabilities, senior citizens and transgender persons." },
];

const OFFICERS = {
  "public-works": ["Anil Varghese", "Executive Engineer"],
  health: ["Dr. Meera Nair", "District Medical Officer"],
  "local-self-government": ["Suresh Pillai", "Joint Director"],
  "water-resources": ["Rajeev Menon", "Assistant Executive Engineer"],
  "general-education": ["Lakshmi Devi", "Deputy Director"],
  revenue: ["Joseph Mathew", "Deputy Collector"],
  power: ["Biju Kurian", "Divisional Engineer"],
  home: ["Sajan Thomas", "Superintendent of Police (nodal)"],
  agriculture: ["Preethi Nambiar", "Principal Agricultural Officer"],
  "civil-supplies": ["Haridas Kumar", "District Supply Officer"],
  transport: ["Nisha Rahman", "Regional Transport Officer"],
  "social-justice": ["Anitha George", "District Social Justice Officer"],
};

const CITIZENS = [
  ["Arun Krishnan", "9876500001"],
  ["Divya Menon", "9876500002"],
  ["Faisal Rahman", "9876500003"],
  ["Gopika Das", "9876500004"],
  ["Mohammed Basheer", "9876500005"],
];

// Fictional complaints. {d} is replaced with the district.
const TEMPLATES = [
  ["Roads and Infrastructure", "Large potholes on the main road near the bus stand", "The main road near the bus stand in {d} has developed deep potholes after the rains. Two wheelers skid every day and an elderly man fell last week. The road has not been repaired for over two months despite repeated requests to the local office.", "High"],
  ["Roads and Infrastructure", "Footpath collapsed beside the market road", "A stretch of the footpath beside the market road in {d} has collapsed into the drain. Pedestrians have to walk on the carriageway and it is unsafe for school children in the morning.", "Medium"],
  ["Healthcare", "No doctor available at the primary health centre", "The primary health centre in {d} has had no doctor on duty for three weeks. Patients with fever are sent away and have to travel 20 km to the taluk hospital. Please post a doctor urgently.", "High"],
  ["Healthcare", "Medicine shortage at the government hospital", "The pharmacy at the government hospital in {d} keeps running out of blood pressure and diabetes tablets. Patients are asked to buy them from private shops, which many cannot afford.", "Medium"],
  ["Education", "Government school building leaks during rain", "The roof of the government upper primary school in {d} leaks in three classrooms. Students sit on benches covered with plastic sheets during monsoon and textbooks get wet.", "Medium"],
  ["Education", "Scholarship amount not received for two years", "My daughter's post matric scholarship from the department has not been credited for two years although the application was approved. The school office says the file is pending at the district level in {d}.", "Medium"],
  ["Water Supply", "No drinking water supply for ten days", "Our ward in {d} has not received piped drinking water for ten days. The tanker supply is irregular and about sixty families, including many elderly people, are struggling. Please restore the supply.", "High"],
  ["Water Supply", "Pipeline leak wasting water near the junction", "A main pipeline is leaking at the junction in {d} and water has been flowing onto the road for a week. The road surface is damaged and the leak should be fixed soon.", "Low"],
  ["Electricity", "Frequent power cuts every evening", "For the last month there have been power cuts every evening in our area of {d}, lasting two to three hours. Students cannot study and small shops are losing business. The transformer seems overloaded.", "Medium"],
  ["Electricity", "Electric pole leaning dangerously near the school", "An electric pole near the school gate in {d} is leaning heavily after the storm and the lines are close to the ground. There is a risk of electrocution for children. Please act before an accident happens.", "High"],
  ["Sanitation and Waste", "Garbage not collected for three weeks", "Door to door waste collection has stopped in our locality in {d}. Garbage is piling up at the corner and there is a bad smell and mosquitoes. The residents association has complained to the office twice.", "Medium"],
  ["Sanitation and Waste", "Streetlights not working on the connecting road", "About fourteen streetlights on the connecting road in {d} have not been working for three weeks. The road is dark and women returning from work feel unsafe at night.", "Medium"],
  ["Land and Revenue", "Land tax receipt refused at the village office", "The village office in {d} is refusing to accept my land tax and says the survey record shows a different owner. I have the sale deed and old receipts. This has gone on for four months.", "Medium"],
  ["Law and Order", "Illegal sale of drugs near the school", "Residents have noticed regular illegal drug sales near the school ground in {d} during evenings. We informed the local police station but no action has been taken. Please look into this.", "High"],
  ["Agriculture", "Crop loss compensation pending after flood", "Our paddy field in {d} was damaged in the flood last season. The agriculture office assessed it but the compensation has not been paid for eight months.", "Medium"],
  ["Ration and Food Supplies", "Ration shop not giving full quota of rice", "The ration shop in {d} gives only part of the rice quota every month and says stock is short. Card holders are not told when the remaining quantity will come.", "Low"],
  ["Transport", "Bus service on the rural route stopped", "The only bus service on our rural route in {d} was stopped two months ago. Students and elderly people now depend on expensive autos. Please restore at least two trips a day.", "Medium"],
  ["Welfare and Pensions", "Old age pension not received for five months", "My mother's old age pension has not been credited for five months. The bank says there is no payment from the department. She depends on this amount. We live in {d}.", "Medium"],
];

// mulberry32: small seeded generator so the demo data is the same on every run.
function prng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function upsertUser({ name, email, mobile, role, department, designation }) {
  let user = await User.findOne({ email });
  if (user) return user;
  user = await User.create({ name, email, mobile, role, department, designation, passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) });
  return user;
}

async function seedAccounts() {
  const departments = {};
  for (const d of DEPARTMENTS) {
    departments[d.slug] = await Department.findOneAndUpdate({ slug: d.slug }, { $set: d }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  }

  const cmo = await upsertUser({ name: "CMO Desk Administrator", email: "cmo@cmkerala-demo.example", role: ROLES.CMO, designation: "Public Grievance Cell" });

  const officers = {};
  for (const [slug, [name, designation]] of Object.entries(OFFICERS)) {
    officers[slug] = await upsertUser({
      name,
      designation,
      email: `officer.${slug}@cmkerala-demo.example`,
      role: ROLES.OFFICER,
      department: departments[slug]._id,
    });
  }

  const citizens = [];
  for (const [i, [name, mobile]] of CITIZENS.entries()) {
    citizens.push(await upsertUser({ name, mobile, email: `citizen${i + 1}@cmkerala-demo.example`, role: ROLES.CITIZEN }));
  }
  return { departments, cmo, officers, citizens };
}

const row = (actor, fields) => ({ actor: actor._id, actorName: actor.name, actorRole: actor.role, ...fields });

async function seedGrievance({ index, status, ageDays }, ctx, rand) {
  const [category, subject, descriptionTemplate, priorityHint] = TEMPLATES[index % TEMPLATES.length];
  const district = DISTRICTS[Math.floor(rand() * DISTRICTS.length)];
  const description = descriptionTemplate.replaceAll("{d}", district);
  const citizen = ctx.citizens[Math.floor(rand() * ctx.citizens.length)];
  const department = ctx.departments[CATEGORIES[category]];
  const officer = ctx.officers[department.slug];

  const created = new Date(Date.now() - ageDays * DAY);
  let cursor = created.getTime();
  const step = (min, max) => {
    cursor += Math.round((min + rand() * (max - min)) * DAY);
    return new Date(Math.min(cursor, Date.now() - 60 * 1000));
  };

  const ai = fallbackAnalysis({ description });
  const analysis = await AiAnalysis.create({
    user: citizen._id,
    category: ai.category,
    department: ctx.departments[ai.departmentSlug]?._id,
    departmentName: ctx.departments[ai.departmentSlug]?.name,
    priority: ai.priority,
    summary: ai.summary,
    reasoning: ai.reasoning,
    source: "fallback",
    model: "keyword-heuristic",
    inputHash: hashText(description),
  });

  const grievance = new Grievance({
    referenceId: await generateReferenceId(created),
    citizen: citizen._id,
    district,
    category,
    subject: `${subject}`,
    description,
    priority: priorityHint,
    status: STATUSES.SUBMITTED,
    dueDate: new Date(created.getTime() + env.SLA_DAYS * DAY),
    createdAt: created,
    updatedAt: created,
    ai: {
      analysis: analysis._id,
      source: "fallback",
      model: "keyword-heuristic",
      category: ai.category,
      departmentName: ctx.departments[ai.departmentSlug]?.name,
      priority: ai.priority,
      summary: ai.summary,
      citizenOverrode: ai.category !== category,
    },
  });

  const history = [row(citizen, { action: HISTORY_ACTIONS.SUBMITTED, toStatus: STATUSES.SUBMITTED, remark: "Grievance submitted.", visibility: VISIBILITY.PUBLIC, createdAt: created })];
  const move = (to, actor, remark, at, visibility = VISIBILITY.PUBLIC) => {
    history.push(row(actor, { action: HISTORY_ACTIONS.STATUS_CHANGE, fromStatus: grievance.status, toStatus: to, remark, visibility, createdAt: at }));
    grievance.status = to;
  };

  let assignment = null;
  if (status !== STATUSES.SUBMITTED) {
    move(STATUSES.UNDER_REVIEW, ctx.cmo, "Reviewed by the Chief Minister's Office.", step(0.3, 1.5));
  }
  if ([STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.REOPENED].includes(status)) {
    const assignedAt = step(0.2, 1);
    grievance.department = department._id;
    grievance.officer = officer._id;
    assignment = new DepartmentAssignment({
      grievance: grievance._id,
      department: department._id,
      officer: officer._id,
      assignedBy: ctx.cmo._id,
      instructions: "Inspect the site, act within the deadline and file an action taken report.",
      createdAt: assignedAt,
      updatedAt: assignedAt,
    });
    grievance.currentAssignment = assignment._id;
    history.push(row(ctx.cmo, { action: HISTORY_ACTIONS.ASSIGNED, remark: `Forwarded to ${department.name} (${officer.name}).`, visibility: VISIBILITY.PUBLIC, createdAt: assignedAt }));
    move(STATUSES.IN_PROGRESS, ctx.cmo, "A department is now working on this grievance.", new Date(assignedAt.getTime() + 1000));
    history.push(row(officer, { action: HISTORY_ACTIONS.REMARK, remark: "Site inspection completed. Work order issued.", visibility: VISIBILITY.PUBLIC, createdAt: step(1, 4) }));
  }

  const reportSummary = "Issue inspected and fixed by the department.";
  const reportDetails = "The team visited the location, verified the complaint and completed the repair. Photographs and the work order are attached to the department file.";

  if (status === STATUSES.RESOLVED || status === STATUSES.REOPENED || (status === STATUSES.IN_PROGRESS && rand() < 0.25)) {
    const submittedAt = step(2, 8);
    assignment.actionReport = { summary: reportSummary, details: reportDetails, submittedBy: officer._id, submittedAt, reviewStatus: REPORT_STATES.PENDING };
    history.push(row(officer, { action: HISTORY_ACTIONS.ACTION_REPORT, remark: `Action taken report submitted for CMO review: ${reportSummary}`, visibility: VISIBILITY.INTERNAL, createdAt: submittedAt }));
    grievance.actionReportStatus = REPORT_STATES.PENDING;

    if (status === STATUSES.RESOLVED || status === STATUSES.REOPENED) {
      const reviewedAt = step(0.5, 3);
      const accepted = status === STATUSES.RESOLVED;
      assignment.actionReport.reviewStatus = accepted ? REPORT_STATES.ACCEPTED : REPORT_STATES.REJECTED;
      assignment.actionReport.reviewedBy = ctx.cmo._id;
      assignment.actionReport.reviewedAt = reviewedAt;
      assignment.actionReport.reviewRemark = accepted ? "Report is complete." : "No photographic proof of the repair. Please inspect again and resubmit.";
      grievance.actionReportStatus = assignment.actionReport.reviewStatus;
      if (accepted) assignment.state = "completed";
      history.push(row(ctx.cmo, { action: HISTORY_ACTIONS.REPORT_REVIEW, remark: `${accepted ? "Accepted" : "Sent back"} the action taken report. ${assignment.actionReport.reviewRemark}`, visibility: VISIBILITY.INTERNAL, createdAt: reviewedAt }));
      move(
        accepted ? STATUSES.RESOLVED : STATUSES.REOPENED,
        ctx.cmo,
        accepted ? `Resolved. ${reportSummary}` : "Sent back to the department for further action.",
        new Date(reviewedAt.getTime() + 1000),
      );
      if (accepted) grievance.resolvedAt = history[history.length - 1].createdAt;
    }
  }

  // Older open grievances are past their deadline. Some of those were escalated.
  const open = grievance.status !== STATUSES.RESOLVED;
  if (open && grievance.dueDate < new Date() && rand() < 0.5) {
    const at = step(0.5, 3);
    grievance.escalation = { level: 1, reason: "Past the 30 day deadline with no resolution.", escalatedAt: at, escalatedBy: ctx.cmo._id };
    history.push(row(ctx.cmo, { action: HISTORY_ACTIONS.ESCALATED, remark: "Escalated to level 1: Past the 30 day deadline with no resolution.", visibility: VISIBILITY.INTERNAL, createdAt: at }));
    history.push(row(ctx.cmo, { action: HISTORY_ACTIONS.ESCALATED, remark: "The Chief Minister's Office escalated this grievance for urgent action.", visibility: VISIBILITY.PUBLIC, createdAt: new Date(at.getTime() + 1000) }));
  }

  grievance.updatedAt = history[history.length - 1].createdAt;
  await grievance.save({ timestamps: false });
  if (assignment) await assignment.save({ timestamps: false });

  let feedback = null;
  if (grievance.status === STATUSES.RESOLVED && rand() < 0.6) {
    const satisfied = rand() < 0.8;
    const at = new Date(grievance.resolvedAt.getTime() + DAY);
    feedback = { grievance: grievance._id, citizen: citizen._id, rating: satisfied ? 4 + Math.round(rand()) : 2, satisfied, comment: satisfied ? "Thank you for the quick action." : "The work is only partly done.", createdAt: at };
    history.push(row(citizen, { action: HISTORY_ACTIONS.FEEDBACK, remark: `Rated the resolution ${feedback.rating} of 5. ${satisfied ? "Satisfied." : "Not satisfied, asked for the grievance to be reopened."}`, visibility: VISIBILITY.PUBLIC, createdAt: at }));
    if (!satisfied) {
      grievance.reopenRequested = true;
      await grievance.save({ timestamps: false });
    }
    await Feedback.collection.insertOne({ ...feedback, createdAt: at });
  }

  await GrievanceHistory.insertMany(history.map((h) => ({ ...h, grievance: grievance._id })), { timestamps: false });
  return grievance;
}

async function main() {
  assertEnv();
  await connectDb();

  const reset = process.argv.includes("--reset");
  if (reset) {
    await Promise.all([Grievance, GrievanceHistory, DepartmentAssignment, Attachment, Feedback, AiAnalysis].map((m) => m.deleteMany({})));
    console.log("Cleared grievances, history, assignments, files, feedback and AI notes.");
  }

  const ctx = await seedAccounts();
  console.log(`Departments: ${Object.keys(ctx.departments).length}, officers: ${Object.keys(ctx.officers).length}, citizens: ${ctx.citizens.length}, CMO accounts: 1`);

  if ((await Grievance.estimatedDocumentCount()) > 0) {
    console.log("Grievances already exist, so none were added. Use --reset to rebuild them.");
  } else {
    const rand = prng(2026);
    // Status mix and age of each demo grievance.
    const plan = [];
    for (let i = 0; i < 48; i += 1) {
      const roll = rand();
      let status;
      let ageDays;
      if (roll < 0.4) [status, ageDays] = [STATUSES.RESOLVED, 40 + rand() * 240];
      else if (roll < 0.66) [status, ageDays] = [STATUSES.IN_PROGRESS, 4 + rand() * 60];
      else if (roll < 0.78) [status, ageDays] = [STATUSES.UNDER_REVIEW, 2 + rand() * 25];
      else if (roll < 0.92) [status, ageDays] = [STATUSES.SUBMITTED, 0.2 + rand() * 7];
      else [status, ageDays] = [STATUSES.REOPENED, 20 + rand() * 90];
      plan.push({ index: i, status, ageDays });
    }
    plan.sort((a, b) => b.ageDays - a.ageDays); // oldest first
    for (const spec of plan) await seedGrievance(spec, ctx, rand);
    console.log(`Added ${plan.length} demo grievances.`);
  }

  console.log("\nDemo accounts (password for all: Demo@12345)");
  console.log("  CMO       cmo@cmkerala-demo.example");
  console.log("  Officer   officer.<department-slug>@cmkerala-demo.example, e.g. officer.public-works@cmkerala-demo.example");
  console.log("  Citizen   citizen1@cmkerala-demo.example to citizen5@cmkerala-demo.example");
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
