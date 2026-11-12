"use strict";

const crypto = require("node:crypto");
const { env } = require("../config/env");
const {
  HISTORY_ACTIONS,
  OPEN_STATUSES,
  REPORT_STATES,
  ROLES,
  STATUSES,
  CMO_TRANSITIONS,
  OFFICER_TRANSITIONS,
  VISIBILITY,
} = require("../config/constants");
const { AiAnalysis, Attachment, Department, DepartmentAssignment, Feedback, Grievance, GrievanceHistory, User } = require("../models");
const AppError = require("../utils/AppError");
const { parsePagination, pageResult } = require("../utils/pagination");
const serialize = require("../utils/serializers");
const { escapeRegex, hashText } = require("../utils/text");
const { analyzeComplaint } = require("./ai.service");

const DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function generateReferenceId(date = new Date()) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const referenceId = `CMK-${date.getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
    if (!(await Grievance.exists({ referenceId }))) return referenceId;
  }
  throw new Error("Could not generate a unique reference number.");
}

const entry = (actor, fields) => ({ actor: actor._id, actorName: actor.name, actorRole: actor.role, ...fields });

// Saves the grievance and appends its history rows together. Rows get consecutive
// timestamps so they always sort in the order they happened.
async function commit(grievance, entries) {
  await grievance.save();
  if (entries.length === 0) return;
  const base = Date.now();
  await GrievanceHistory.insertMany(entries.map((e, i) => ({ ...e, grievance: grievance._id, createdAt: new Date(base + i) })));
}

// Mutates the grievance and returns the history row for the move.
function moveStatus(grievance, to, actor, { remark, visibility = VISIBILITY.PUBLIC, action = HISTORY_ACTIONS.STATUS_CHANGE } = {}) {
  const from = grievance.status;
  grievance.status = to;
  if (to === STATUSES.RESOLVED) grievance.resolvedAt = new Date();
  if (from === STATUSES.RESOLVED && to !== STATUSES.RESOLVED) {
    grievance.resolvedAt = undefined;
    // A reopened grievance gets a fresh deadline.
    grievance.dueDate = new Date(Date.now() + env.SLA_DAYS * DAY);
  }
  if (to === STATUSES.REOPENED) grievance.reopenRequested = false;
  return entry(actor, { action, fromStatus: from, toStatus: to, remark, visibility });
}

const POPULATE = [
  { path: "department", select: "name slug" },
  { path: "officer", select: "name designation" },
  { path: "citizen", select: "name email mobile" },
];

// Loads a grievance by id or reference number and enforces who may see it.
// Anyone without access gets "not found" so references cannot be probed.
async function loadForUser(user, idOrRef, { populate = true } = {}) {
  const lookup = /^[a-f\d]{24}$/i.test(idOrRef) ? { _id: idOrRef } : { referenceId: String(idOrRef).toUpperCase() };
  let query = Grievance.findOne(lookup);
  if (populate) query = query.populate(POPULATE);
  const grievance = await query;
  if (!grievance) throw AppError.notFound("Grievance not found.");

  const citizenId = serialize.idOf(grievance.citizen);
  const departmentId = serialize.idOf(grievance.department);
  if (user.role === ROLES.CITIZEN && citizenId !== String(user._id)) throw AppError.notFound("Grievance not found.");
  if (user.role === ROLES.OFFICER && (!departmentId || departmentId !== String(user.department))) {
    throw AppError.notFound("Grievance not found.");
  }
  return grievance;
}

// ---------------------------------------------------------------------------
// Citizen
// ---------------------------------------------------------------------------

async function createGrievance({ user, body, file }) {
  let analysis = null;
  if (body.analysisId) {
    analysis = await AiAnalysis.findOne({ _id: body.analysisId, user: user._id });
  }
  // The assistant always runs. If the citizen skipped it, or edited the text afterwards, run it again.
  if (!analysis || analysis.inputHash !== hashText(body.description)) {
    ({ doc: analysis } = await analyzeComplaint({ user, description: body.description, district: body.district }));
  }

  const now = new Date();
  const grievance = await Grievance.create({
    referenceId: await generateReferenceId(now),
    citizen: user._id,
    district: body.district,
    category: body.category,
    subject: body.subject,
    description: body.description,
    priority: analysis.priority,
    status: STATUSES.SUBMITTED,
    dueDate: new Date(now.getTime() + env.SLA_DAYS * DAY),
    ai: {
      analysis: analysis._id,
      source: analysis.source,
      model: analysis.model,
      category: analysis.category,
      departmentName: analysis.departmentName,
      priority: analysis.priority,
      summary: analysis.summary,
      duplicates: analysis.duplicates,
      citizenOverrode: body.category !== analysis.category,
    },
  });

  if (file) {
    await Attachment.create({
      grievance: grievance._id,
      uploadedBy: user._id,
      kind: "evidence",
      originalName: file.originalname.slice(0, 200),
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
    });
  }

  await GrievanceHistory.create({
    ...entry(user, { action: HISTORY_ACTIONS.SUBMITTED, toStatus: STATUSES.SUBMITTED, remark: "Grievance submitted.", visibility: VISIBILITY.PUBLIC }),
    grievance: grievance._id,
  });

  return grievance;
}

async function listForCitizen(user) {
  const items = await Grievance.find({ citizen: user._id }).populate("department", "name slug").sort({ createdAt: -1 }).limit(200);
  const counts = { total: items.length, pending: 0, resolved: 0 };
  for (const g of items) {
    if (g.status === STATUSES.RESOLVED) counts.resolved += 1;
    else counts.pending += 1;
  }
  return { counts, items: items.map((g) => serialize.grievanceItem(g)) };
}

const TRACK_ACTIONS = [HISTORY_ACTIONS.SUBMITTED, HISTORY_ACTIONS.STATUS_CHANGE, HISTORY_ACTIONS.ASSIGNED];

// Public lookup by reference number. Shows progress only: no name, contact, subject or remarks.
async function track(referenceId) {
  const grievance = await Grievance.findOne({ referenceId }).populate("department", "name");
  if (!grievance) throw AppError.notFound("No grievance found with that reference number.");

  const rows = await GrievanceHistory.find({ grievance: grievance._id, action: { $in: TRACK_ACTIONS }, visibility: VISIBILITY.PUBLIC }).sort({ createdAt: 1, _id: 1 });
  const history = rows.map((h) => ({
    status: h.toStatus,
    title: h.action === HISTORY_ACTIONS.ASSIGNED ? "Forwarded to a department" : h.action === HISTORY_ACTIONS.SUBMITTED ? "Submitted" : `Status changed to ${h.toStatus}`,
    at: h.createdAt,
  }));

  return {
    referenceId: grievance.referenceId,
    status: grievance.status,
    district: grievance.district,
    category: grievance.category,
    department: grievance.department ? grievance.department.name : null,
    submittedAt: grievance.createdAt,
    updatedAt: grievance.updatedAt,
    isOverdue: serialize.isOverdue(grievance),
    history,
  };
}

async function submitFeedback(user, idOrRef, { rating, satisfied, comment }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (grievance.status !== STATUSES.RESOLVED) throw AppError.badRequest("Feedback opens once the grievance is resolved.");
  const existing = await Feedback.exists({ grievance: grievance._id, createdAt: { $gte: grievance.resolvedAt } });
  if (existing) throw AppError.conflict("You have already left feedback on this resolution.");

  const fb = await Feedback.create({ grievance: grievance._id, citizen: user._id, rating, satisfied, comment });
  if (!satisfied) grievance.reopenRequested = true;
  await commit(grievance, [
    entry(user, {
      action: HISTORY_ACTIONS.FEEDBACK,
      remark: `Rated the resolution ${rating} of 5. ${satisfied ? "Satisfied." : "Not satisfied, asked for the grievance to be reopened."}${comment ? ` ${comment}` : ""}`,
      visibility: VISIBILITY.PUBLIC,
    }),
  ]);
  return fb;
}

// ---------------------------------------------------------------------------
// Detail view (all roles)
// ---------------------------------------------------------------------------

async function getDetail(user, idOrRef) {
  const grievance = await loadForUser(user, idOrRef);
  const isCitizen = user.role === ROLES.CITIZEN;
  const staff = !isCitizen;

  const historyFilter = isCitizen ? { grievance: grievance._id, visibility: VISIBILITY.PUBLIC } : { grievance: grievance._id };
  const attachmentFilter = isCitizen ? { grievance: grievance._id, kind: "evidence" } : { grievance: grievance._id };

  const [history, attachments, assignments, feedback] = await Promise.all([
    GrievanceHistory.find(historyFilter).sort({ createdAt: 1, _id: 1 }),
    Attachment.find(attachmentFilter).select("-data").sort({ createdAt: 1 }),
    staff
      ? DepartmentAssignment.find({ grievance: grievance._id })
          .populate("department", "name")
          .populate("officer", "name")
          .populate("assignedBy", "name")
          .sort({ createdAt: 1 })
      : Promise.resolve([]),
    Feedback.find({ grievance: grievance._id }).sort({ createdAt: 1 }),
  ]);

  const item = serialize.grievanceItem(grievance, { forCmo: user.role === ROLES.CMO });
  const lastFeedback = feedback[feedback.length - 1];
  const canGiveFeedback =
    isCitizen && grievance.status === STATUSES.RESOLVED && !(lastFeedback && grievance.resolvedAt && lastFeedback.createdAt >= grievance.resolvedAt);

  const accepted = assignments.find((a) => a.actionReport?.reviewStatus === REPORT_STATES.ACCEPTED);
  const currentAssignment = assignments.find((a) => a.state === "active");

  // Moves the viewer may make with the status endpoint. Resolved is only reached through report review.
  const rules = user.role === ROLES.CMO ? CMO_TRANSITIONS : user.role === ROLES.OFFICER ? OFFICER_TRANSITIONS : {};
  const allowedStatuses = (rules[grievance.status] || []).filter(
    (s) => s !== STATUSES.RESOLVED && (s !== STATUSES.IN_PROGRESS || grievance.currentAssignment),
  );

  return {
    ...item,
    description: grievance.description,
    ai: grievance.ai
      ? {
          source: grievance.ai.source,
          model: grievance.ai.model,
          category: grievance.ai.category,
          departmentName: grievance.ai.departmentName,
          priority: grievance.ai.priority,
          summary: grievance.ai.summary,
          duplicates: staff ? grievance.ai.duplicates : [],
          citizenOverrode: grievance.ai.citizenOverrode,
        }
      : null,
    citizen: user.role === ROLES.CMO ? { name: grievance.citizen.name, email: grievance.citizen.email, mobile: grievance.citizen.mobile } : undefined,
    escalation: staff && grievance.escalation?.level ? { level: grievance.escalation.level, reason: grievance.escalation.reason, at: grievance.escalation.escalatedAt } : undefined,
    resolution: grievance.status === STATUSES.RESOLVED && accepted ? { summary: accepted.actionReport.summary, resolvedAt: grievance.resolvedAt } : null,
    currentAssignmentId: currentAssignment ? serialize.idOf(currentAssignment) : null,
    history: history.map((h) => serialize.historyEntry(h, user)),
    attachments: attachments.map(serialize.attachment),
    assignments: assignments.map(serialize.assignment),
    feedback: feedback.map(serialize.feedback),
    canGiveFeedback,
    allowedStatuses,
  };
}

// ---------------------------------------------------------------------------
// Lists and filters (CMO and officer)
// ---------------------------------------------------------------------------

function buildFilter(q) {
  const filter = {};
  for (const key of ["district", "category", "priority", "status", "department"]) {
    if (q[key]) filter[key] = q[key];
  }
  if (q.overdue === true) {
    filter.status = { $ne: STATUSES.RESOLVED };
    filter.dueDate = { $lt: new Date() };
  }
  if (q.escalated === true) filter["escalation.level"] = { $gt: 0 };
  if (q.awaitingReview === true) filter.actionReportStatus = REPORT_STATES.PENDING;
  if (q.reopenRequested === true) filter.reopenRequested = true;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), "i");
    filter.$or = [{ referenceId: rx }, { subject: rx }];
  }
  return filter;
}

async function list(user, query) {
  const paging = parsePagination(query);
  const filter = buildFilter(query);
  // Officers only ever see their own department, whatever the query asks for.
  if (user.role === ROLES.OFFICER) filter.department = user.department;

  const [items, total] = await Promise.all([
    Grievance.find(filter).populate(POPULATE).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit),
    Grievance.countDocuments(filter),
  ]);
  return pageResult(items.map((g) => serialize.grievanceItem(g, { forCmo: user.role === ROLES.CMO })), total, paging);
}

// ---------------------------------------------------------------------------
// Workflow actions
// ---------------------------------------------------------------------------

async function updateStatus(user, idOrRef, { status, remark, visibility }) {
  const grievance = await loadForUser(user, idOrRef);
  const from = grievance.status;
  const rules = user.role === ROLES.CMO ? CMO_TRANSITIONS : OFFICER_TRANSITIONS;

  if (status === STATUSES.RESOLVED) {
    throw AppError.badRequest("A grievance is resolved by accepting the department's action taken report.");
  }
  if (!(rules[from] || []).includes(status)) {
    throw AppError.badRequest(`A grievance that is ${from} cannot be moved to ${status}.`);
  }
  if (status === STATUSES.IN_PROGRESS && !grievance.currentAssignment) {
    throw AppError.badRequest("Forward the grievance to a department first.");
  }

  // An officer posting another In Progress update is a progress note, not a status change.
  if (from === status) {
    if (!remark) throw AppError.badRequest("Write the progress update.", { remark: "Write the progress update." });
    await commit(grievance, [entry(user, { action: HISTORY_ACTIONS.REMARK, fromStatus: from, toStatus: status, remark, visibility })]);
  } else {
    await commit(grievance, [moveStatus(grievance, status, user, { remark, visibility })]);
  }
  return grievance;
}

async function addRemark(user, idOrRef, { text, visibility }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  await commit(grievance, [entry(user, { action: HISTORY_ACTIONS.REMARK, remark: text, visibility })]);
  return grievance;
}

async function triage(user, idOrRef, { category, priority }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (grievance.status === STATUSES.RESOLVED) throw AppError.badRequest("Reopen the grievance before editing it.");

  const changes = [];
  if (category && category !== grievance.category) {
    changes.push(`category ${grievance.category} to ${category}`);
    grievance.category = category;
  }
  if (priority && priority !== grievance.priority) {
    changes.push(`priority ${grievance.priority} to ${priority}`);
    grievance.priority = priority;
  }
  if (changes.length === 0) throw AppError.badRequest("Nothing to change.");
  if (grievance.ai) grievance.ai.cmoReviewedAt = new Date();

  await commit(grievance, [entry(user, { action: HISTORY_ACTIONS.TRIAGE, remark: `Reviewed AI suggestion. Changed ${changes.join(", ")}.`, visibility: VISIBILITY.INTERNAL })]);
  return grievance;
}

async function assign(user, idOrRef, { departmentId, officerId, instructions }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (grievance.status === STATUSES.RESOLVED) throw AppError.badRequest("Reopen the grievance before forwarding it again.");

  const department = await Department.findOne({ _id: departmentId, isActive: true });
  if (!department) throw AppError.badRequest("Choose a department.", { departmentId: "Choose a department." });

  let officer = null;
  if (officerId) {
    officer = await User.findOne({ _id: officerId, role: ROLES.OFFICER, department: department._id, isActive: true });
    if (!officer) throw AppError.badRequest("That officer does not belong to the department.", { officerId: "Choose an officer from this department." });
  }

  const entries = [];
  if (grievance.status === STATUSES.SUBMITTED) {
    entries.push(moveStatus(grievance, STATUSES.UNDER_REVIEW, user, { remark: "Reviewed by the Chief Minister's Office." }));
  }

  await DepartmentAssignment.updateMany({ grievance: grievance._id, state: "active" }, { state: "superseded" });
  const assignment = await DepartmentAssignment.create({
    grievance: grievance._id,
    department: department._id,
    officer: officer?._id ?? null,
    assignedBy: user._id,
    instructions,
  });

  grievance.department = department._id;
  grievance.officer = officer?._id ?? null;
  grievance.currentAssignment = assignment._id;
  grievance.actionReportStatus = REPORT_STATES.NONE;

  entries.push(
    entry(user, {
      action: HISTORY_ACTIONS.ASSIGNED,
      remark: `Forwarded to ${department.name}${officer ? ` (${officer.name})` : ""}.${instructions ? ` Instructions: ${instructions}` : ""}`,
      visibility: VISIBILITY.PUBLIC,
      meta: { departmentId: department.id, officerId: officer?.id },
    }),
  );
  if (grievance.status !== STATUSES.IN_PROGRESS) {
    entries.push(moveStatus(grievance, STATUSES.IN_PROGRESS, user, { remark: "A department is now working on this grievance." }));
  }

  await commit(grievance, entries);
  return grievance;
}

async function escalate(user, idOrRef, { reason }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (!OPEN_STATUSES.includes(grievance.status)) throw AppError.badRequest("Only open grievances can be escalated.");

  grievance.escalation = {
    level: (grievance.escalation?.level ?? 0) + 1,
    reason,
    escalatedAt: new Date(),
    escalatedBy: user._id,
  };
  await commit(grievance, [
    entry(user, { action: HISTORY_ACTIONS.ESCALATED, remark: `Escalated to level ${grievance.escalation.level}: ${reason}`, visibility: VISIBILITY.INTERNAL }),
    entry(user, { action: HISTORY_ACTIONS.ESCALATED, remark: "The Chief Minister's Office escalated this grievance for urgent action.", visibility: VISIBILITY.PUBLIC }),
  ]);
  return grievance;
}

async function submitActionReport(user, idOrRef, { summary, details }, file) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (![STATUSES.IN_PROGRESS, STATUSES.REOPENED].includes(grievance.status)) {
    throw AppError.badRequest("An action taken report can only be filed on grievances in progress.");
  }
  if (grievance.actionReportStatus === REPORT_STATES.PENDING) {
    throw AppError.conflict("A report is already waiting for CMO review.");
  }
  const assignment = await DepartmentAssignment.findOne({ _id: grievance.currentAssignment, state: "active" });
  if (!assignment) throw AppError.badRequest("This grievance has no active assignment.");

  let attachmentId;
  if (file) {
    const attachment = await Attachment.create({
      grievance: grievance._id,
      uploadedBy: user._id,
      kind: "action_report",
      originalName: file.originalname.slice(0, 200),
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
    });
    attachmentId = attachment._id;
  }

  assignment.actionReport = { summary, details, attachment: attachmentId, submittedBy: user._id, submittedAt: new Date(), reviewStatus: REPORT_STATES.PENDING };
  await assignment.save();

  const entries = [];
  if (grievance.status === STATUSES.REOPENED) entries.push(moveStatus(grievance, STATUSES.IN_PROGRESS, user, { remark: "Department resumed work." }));
  grievance.actionReportStatus = REPORT_STATES.PENDING;
  entries.push(entry(user, { action: HISTORY_ACTIONS.ACTION_REPORT, remark: `Action taken report submitted for CMO review: ${summary}`, visibility: VISIBILITY.INTERNAL }));
  await commit(grievance, entries);
  return grievance;
}

async function reviewReport(user, idOrRef, { decision, remark, citizenMessage }) {
  const grievance = await loadForUser(user, idOrRef, { populate: false });
  if (grievance.actionReportStatus !== REPORT_STATES.PENDING) throw AppError.badRequest("There is no action taken report waiting for review.");
  const assignment = await DepartmentAssignment.findOne({ _id: grievance.currentAssignment, state: "active" });
  if (!assignment?.actionReport) throw AppError.badRequest("There is no action taken report waiting for review.");

  const accepted = decision === "accept";
  assignment.actionReport.reviewStatus = accepted ? REPORT_STATES.ACCEPTED : REPORT_STATES.REJECTED;
  assignment.actionReport.reviewedBy = user._id;
  assignment.actionReport.reviewedAt = new Date();
  assignment.actionReport.reviewRemark = remark;
  if (accepted) assignment.state = "completed";
  await assignment.save();

  grievance.actionReportStatus = accepted ? REPORT_STATES.ACCEPTED : REPORT_STATES.REJECTED;
  const entries = [
    entry(user, {
      action: HISTORY_ACTIONS.REPORT_REVIEW,
      remark: `${accepted ? "Accepted" : "Sent back"} the action taken report.${remark ? ` ${remark}` : ""}`,
      visibility: VISIBILITY.INTERNAL,
    }),
  ];
  entries.push(
    accepted
      ? moveStatus(grievance, STATUSES.RESOLVED, user, { remark: citizenMessage || `Resolved. ${assignment.actionReport.summary}` })
      : moveStatus(grievance, STATUSES.REOPENED, user, { remark: citizenMessage || "Sent back to the department for further action." }),
  );
  await commit(grievance, entries);
  return grievance;
}

module.exports = {
  generateReferenceId,
  loadForUser,
  createGrievance,
  listForCitizen,
  track,
  submitFeedback,
  getDetail,
  list,
  updateStatus,
  addRemark,
  triage,
  assign,
  escalate,
  submitActionReport,
  reviewReport,
};
