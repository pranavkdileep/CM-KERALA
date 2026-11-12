"use strict";

const { ROLES, STATUSES, VISIBILITY } = require("../config/constants");

const idOf = (doc) => (doc ? String(doc._id ?? doc) : null);

function user(u) {
  return {
    id: idOf(u),
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    role: u.role,
    designation: u.designation,
    department: u.department ? { id: idOf(u.department), name: u.department.name, slug: u.department.slug } : null,
  };
}

function department(d) {
  if (!d) return null;
  return { id: idOf(d), name: d.name, slug: d.slug, description: d.description };
}

function isOverdue(g, now = new Date()) {
  return g.status !== STATUSES.RESOLVED && g.dueDate < now;
}

// One row in a list. Citizen details are only included for the CMO.
function grievanceItem(g, { forCmo = false } = {}) {
  return {
    id: idOf(g),
    referenceId: g.referenceId,
    district: g.district,
    category: g.category,
    subject: g.subject,
    priority: g.priority,
    status: g.status,
    department: g.department && g.department.name ? { id: idOf(g.department), name: g.department.name, slug: g.department.slug } : null,
    officer: g.officer && g.officer.name ? { id: idOf(g.officer), name: g.officer.name } : null,
    citizenName: forCmo && g.citizen && g.citizen.name ? g.citizen.name : undefined,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    dueDate: g.dueDate,
    isOverdue: isOverdue(g),
    escalationLevel: g.escalation?.level ?? 0,
    actionReportStatus: g.actionReportStatus,
    reopenRequested: g.reopenRequested,
    aiSource: g.ai?.source,
  };
}

const ROLE_LABEL = { [ROLES.CMO]: "Chief Minister's Office", [ROLES.OFFICER]: "Department officer", [ROLES.CITIZEN]: "Citizen" };

function historyEntry(h, viewer) {
  const staff = viewer.role !== ROLES.CITIZEN;
  return {
    id: idOf(h),
    action: h.action,
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    remark: h.remark,
    visibility: h.visibility,
    // Citizens see who acted by office, not by name.
    actorName: staff ? h.actorName : h.actorRole === ROLES.CITIZEN ? "You" : ROLE_LABEL[h.actorRole],
    actorRole: h.actorRole,
    at: h.createdAt,
  };
}

function attachment(a) {
  return { id: idOf(a), kind: a.kind, name: a.originalName, mimeType: a.mimeType, size: a.size, createdAt: a.createdAt };
}

function assignment(a) {
  return {
    id: idOf(a),
    state: a.state,
    department: a.department?.name ? { id: idOf(a.department), name: a.department.name } : null,
    officer: a.officer?.name ? { id: idOf(a.officer), name: a.officer.name } : null,
    assignedBy: a.assignedBy?.name,
    instructions: a.instructions,
    assignedAt: a.createdAt,
    actionReport: a.actionReport
      ? {
          summary: a.actionReport.summary,
          details: a.actionReport.details,
          attachmentId: idOf(a.actionReport.attachment),
          submittedAt: a.actionReport.submittedAt,
          reviewStatus: a.actionReport.reviewStatus,
          reviewedAt: a.actionReport.reviewedAt,
          reviewRemark: a.actionReport.reviewRemark,
        }
      : null,
  };
}

function feedback(f) {
  return { id: idOf(f), rating: f.rating, satisfied: f.satisfied, comment: f.comment, createdAt: f.createdAt };
}

const isPublic = (h) => h.visibility === VISIBILITY.PUBLIC;

module.exports = { idOf, user, department, grievanceItem, historyEntry, attachment, assignment, feedback, isOverdue, isPublic };
