"use strict";

const mongoose = require("mongoose");
const {
  CATEGORY_LIST,
  DISTRICTS,
  PRIORITIES,
  REPORT_STATES,
  STATUS_LIST,
  STATUSES,
} = require("../config/constants");

const { ObjectId } = mongoose.Schema.Types;

const grievanceSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    citizen: { type: ObjectId, ref: "User", required: true, index: true },

    district: { type: String, enum: DISTRICTS, required: true, index: true },
    category: { type: String, enum: CATEGORY_LIST, required: true, index: true },
    subject: { type: String, required: true, trim: true, minlength: 5, maxlength: 150 },
    description: { type: String, required: true, trim: true, minlength: 20, maxlength: 4000 },

    priority: { type: String, enum: PRIORITIES, default: "Medium", index: true },
    status: { type: String, enum: STATUS_LIST, default: STATUSES.SUBMITTED, index: true },

    // Current routing. Full routing history lives in DepartmentAssignment.
    department: { type: ObjectId, ref: "Department", default: null, index: true },
    officer: { type: ObjectId, ref: "User", default: null, index: true },
    currentAssignment: { type: ObjectId, ref: "DepartmentAssignment", default: null },
    // Copy of the latest action taken report state, kept here so the CMO can filter on it.
    actionReportStatus: { type: String, enum: Object.values(REPORT_STATES), default: REPORT_STATES.NONE, index: true },

    // Advisory output of the AI Grievance Assistant, kept for review.
    ai: {
      analysis: { type: ObjectId, ref: "AiAnalysis" },
      source: { type: String, enum: ["ai", "fallback"] },
      model: String,
      category: String,
      departmentName: String,
      priority: { type: String, enum: PRIORITIES },
      summary: String,
      duplicates: [{ _id: false, grievance: { type: ObjectId, ref: "Grievance" }, referenceId: String, score: Number }],
      // True when the citizen or CMO chose something different from the suggestion.
      citizenOverrode: { type: Boolean, default: false },
      cmoReviewedAt: Date,
    },

    escalation: {
      level: { type: Number, default: 0 },
      reason: String,
      escalatedAt: Date,
      escalatedBy: { type: ObjectId, ref: "User" },
    },

    reopenRequested: { type: Boolean, default: false, index: true },
    dueDate: { type: Date, required: true, index: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

grievanceSchema.index({ createdAt: -1 });
grievanceSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model("Grievance", grievanceSchema);
