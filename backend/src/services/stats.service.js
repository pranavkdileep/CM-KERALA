"use strict";

const mongoose = require("mongoose");
const { REPORT_STATES, STATUSES } = require("../config/constants");
const { Department, Grievance } = require("../models");

const count = (condition) => ({ $sum: { $cond: [condition, 1, 0] } });
const isResolved = { $eq: ["$status", STATUSES.RESOLVED] };
const isOverdue = { $and: [{ $ne: ["$status", STATUSES.RESOLVED] }, { $lt: ["$dueDate", "$$NOW"] }] };

const breakdown = (field) => [
  {
    $group: {
      _id: field,
      total: { $sum: 1 },
      resolved: count(isResolved),
      pending: count({ $not: [isResolved] }),
      overdue: count(isOverdue),
    },
  },
  { $sort: { total: -1 } },
];

// Figures for the CMO dashboard, computed from stored grievances. `match` narrows
// the set, for example to one department when an officer asks for their own numbers.
async function summarise(match = {}) {
  const [result] = await Grievance.aggregate([
    { $match: match },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              resolved: count(isResolved),
              pending: count({ $not: [isResolved] }),
              overdue: count(isOverdue),
              escalated: count({ $gt: ["$escalation.level", 0] }),
              awaitingReview: count({ $eq: ["$actionReportStatus", REPORT_STATES.PENDING] }),
              reopenRequested: count({ $eq: ["$reopenRequested", true] }),
              unassigned: count({ $eq: ["$department", null] }),
            },
          },
        ],
        byStatus: [{ $group: { _id: "$status", total: { $sum: 1 } } }],
        byDistrict: breakdown("$district"),
        byCategory: breakdown("$category"),
        byDepartment: breakdown("$department"),
        byPriority: [{ $group: { _id: "$priority", total: { $sum: 1 } } }],
        resolution: [
          { $match: { status: STATUSES.RESOLVED, resolvedAt: { $exists: true } } },
          { $group: { _id: null, avgMs: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } } } },
        ],
      },
    },
  ]);

  const totals = result.totals[0] || { total: 0, resolved: 0, pending: 0, overdue: 0, escalated: 0, awaitingReview: 0, reopenRequested: 0, unassigned: 0 };
  delete totals._id;

  const departmentIds = result.byDepartment.map((d) => d._id).filter(Boolean);
  const departments = await Department.find({ _id: { $in: departmentIds.map((id) => new mongoose.Types.ObjectId(id)) } }).select("name");
  const nameOf = new Map(departments.map((d) => [String(d._id), d.name]));

  const statusCounts = Object.fromEntries(Object.values(STATUSES).map((s) => [s, 0]));
  for (const row of result.byStatus) statusCounts[row._id] = row.total;

  const rows = (list) => list.map(({ _id, ...rest }) => ({ name: _id, ...rest }));

  return {
    totals,
    byStatus: statusCounts,
    byPriority: Object.fromEntries(result.byPriority.map((p) => [p._id, p.total])),
    byDistrict: rows(result.byDistrict),
    byCategory: rows(result.byCategory),
    byDepartment: result.byDepartment
      .filter((d) => d._id)
      .map(({ _id, ...rest }) => ({ id: String(_id), name: nameOf.get(String(_id)) || "Unknown department", ...rest })),
    averageResolutionDays: result.resolution[0] ? Math.round((result.resolution[0].avgMs / 86400000) * 10) / 10 : null,
    generatedAt: new Date(),
  };
}

module.exports = { summarise };
