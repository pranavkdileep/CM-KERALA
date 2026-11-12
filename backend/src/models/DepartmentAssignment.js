"use strict";

const mongoose = require("mongoose");
const { REPORT_STATES } = require("../config/constants");

const { ObjectId } = mongoose.Schema.Types;

const actionReportSchema = new mongoose.Schema(
  {
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    details: { type: String, required: true, trim: true, maxlength: 4000 },
    attachment: { type: ObjectId, ref: "Attachment" },
    submittedBy: { type: ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
    reviewStatus: { type: String, enum: Object.values(REPORT_STATES), default: REPORT_STATES.PENDING },
    reviewedBy: { type: ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewRemark: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

// One row per time the CMO forwards a grievance. Reassigning supersedes the older row.
const departmentAssignmentSchema = new mongoose.Schema(
  {
    grievance: { type: ObjectId, ref: "Grievance", required: true, index: true },
    department: { type: ObjectId, ref: "Department", required: true, index: true },
    officer: { type: ObjectId, ref: "User", default: null },
    assignedBy: { type: ObjectId, ref: "User", required: true },
    instructions: { type: String, trim: true, maxlength: 2000 },
    state: { type: String, enum: ["active", "superseded", "completed"], default: "active", index: true },
    actionReport: { type: actionReportSchema, default: undefined },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DepartmentAssignment", departmentAssignmentSchema);
