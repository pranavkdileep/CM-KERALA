"use strict";

const ROLES = Object.freeze({ CITIZEN: "citizen", CMO: "cmo", OFFICER: "officer" });

const STATUSES = Object.freeze({
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REOPENED: "Reopened",
});
const STATUS_LIST = Object.values(STATUSES);

// Statuses that still need work. Resolved is the only closed state.
const OPEN_STATUSES = [STATUSES.SUBMITTED, STATUSES.UNDER_REVIEW, STATUSES.IN_PROGRESS, STATUSES.REOPENED];

const PRIORITIES = Object.freeze(["Low", "Medium", "High"]);

const DISTRICTS = Object.freeze([
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
]);

// Category name -> slug of the department that normally handles it.
const CATEGORIES = Object.freeze({
  "Roads and Infrastructure": "public-works",
  Healthcare: "health",
  Education: "general-education",
  "Water Supply": "water-resources",
  Electricity: "power",
  "Sanitation and Waste": "local-self-government",
  "Land and Revenue": "revenue",
  "Law and Order": "home",
  Agriculture: "agriculture",
  "Ration and Food Supplies": "civil-supplies",
  Transport: "transport",
  "Welfare and Pensions": "social-justice",
  Other: "local-self-government",
});
const CATEGORY_LIST = Object.freeze(Object.keys(CATEGORIES));

const HISTORY_ACTIONS = Object.freeze({
  SUBMITTED: "submitted",
  STATUS_CHANGE: "status_change",
  ASSIGNED: "assigned",
  REMARK: "remark",
  ESCALATED: "escalated",
  ACTION_REPORT: "action_report",
  REPORT_REVIEW: "report_review",
  FEEDBACK: "feedback",
  TRIAGE: "triage",
});

const VISIBILITY = Object.freeze({ PUBLIC: "public", INTERNAL: "internal" });

const REPORT_STATES = Object.freeze({ NONE: "none", PENDING: "pending", ACCEPTED: "accepted", REJECTED: "rejected" });

// Which status moves the CMO may make with the plain status endpoint.
// Resolved is deliberately missing: it is only reachable by accepting an action taken report.
const CMO_TRANSITIONS = Object.freeze({
  [STATUSES.SUBMITTED]: [STATUSES.UNDER_REVIEW],
  [STATUSES.UNDER_REVIEW]: [STATUSES.IN_PROGRESS],
  [STATUSES.IN_PROGRESS]: [STATUSES.UNDER_REVIEW, STATUSES.REOPENED],
  [STATUSES.RESOLVED]: [STATUSES.REOPENED],
  [STATUSES.REOPENED]: [STATUSES.UNDER_REVIEW, STATUSES.IN_PROGRESS],
});

// Officers can only record progress on work assigned to their department.
const OFFICER_TRANSITIONS = Object.freeze({
  [STATUSES.IN_PROGRESS]: [STATUSES.IN_PROGRESS],
  [STATUSES.REOPENED]: [STATUSES.IN_PROGRESS],
});

const ALLOWED_UPLOAD_TYPES = Object.freeze({
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
});

module.exports = {
  ROLES,
  STATUSES,
  STATUS_LIST,
  OPEN_STATUSES,
  PRIORITIES,
  DISTRICTS,
  CATEGORIES,
  CATEGORY_LIST,
  HISTORY_ACTIONS,
  VISIBILITY,
  REPORT_STATES,
  CMO_TRANSITIONS,
  OFFICER_TRANSITIONS,
  ALLOWED_UPLOAD_TYPES,
};
