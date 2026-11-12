"use strict";

const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

// Files are kept in MongoDB so they survive redeploys on hosts with a disposable disk.
// Uploads are capped at a few MB, far below the 16 MB document limit.
const attachmentSchema = new mongoose.Schema(
  {
    grievance: { type: ObjectId, ref: "Grievance", required: true, index: true },
    uploadedBy: { type: ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["evidence", "action_report"], default: "evidence" },
    originalName: { type: String, required: true, maxlength: 200 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

module.exports = mongoose.model("Attachment", attachmentSchema);
