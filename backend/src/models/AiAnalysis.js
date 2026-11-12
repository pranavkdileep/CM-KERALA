"use strict";

const mongoose = require("mongoose");
const { PRIORITIES } = require("../config/constants");

// The assistant's output is stored server side so a citizen cannot forge it when submitting.
// It is advisory only: the citizen and the CMO can both override every field.
const aiAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    departmentName: { type: String },
    priority: { type: String, enum: PRIORITIES, required: true },
    summary: { type: String, required: true, maxlength: 600 },
    reasoning: { type: String, maxlength: 600 },
    // "ai" means a model answered. "fallback" means the keyword heuristic was used.
    source: { type: String, enum: ["ai", "fallback"], required: true },
    model: { type: String, required: true },
    duplicates: [
      {
        _id: false,
        grievance: { type: mongoose.Schema.Types.ObjectId, ref: "Grievance" },
        referenceId: String,
        score: Number,
      },
    ],
    // Hash of the description that was analysed. A changed description needs a fresh analysis.
    inputHash: { type: String, required: true },
    // Expires on its own after a day if the citizen never submits.
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
  },
  { versionKey: false },
);

module.exports = mongoose.model("AiAnalysis", aiAnalysisSchema);
