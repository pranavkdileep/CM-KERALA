"use strict";

const mongoose = require("mongoose");
const { HISTORY_ACTIONS, ROLES, STATUS_LIST, VISIBILITY } = require("../config/constants");

const { ObjectId } = mongoose.Schema.Types;

// Append only log. Every status change, assignment, remark and review is a row here with
// the time and the responsible user, so a grievance can be traced through its whole life.
const grievanceHistorySchema = new mongoose.Schema(
  {
    grievance: { type: ObjectId, ref: "Grievance", required: true, index: true },
    action: { type: String, enum: Object.values(HISTORY_ACTIONS), required: true },
    fromStatus: { type: String, enum: [...STATUS_LIST, null], default: null },
    toStatus: { type: String, enum: [...STATUS_LIST, null], default: null },
    remark: { type: String, trim: true, maxlength: 2000 },
    // Public entries are shown to the citizen. Internal entries are for the CMO and officers.
    visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PUBLIC },
    actor: { type: ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: Object.values(ROLES), required: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

grievanceHistorySchema.index({ grievance: 1, createdAt: 1 });

module.exports = mongoose.model("GrievanceHistory", grievanceHistorySchema);
