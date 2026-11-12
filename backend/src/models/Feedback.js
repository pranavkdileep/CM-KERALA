"use strict";

const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const feedbackSchema = new mongoose.Schema(
  {
    grievance: { type: ObjectId, ref: "Grievance", required: true, index: true },
    citizen: { type: ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    satisfied: { type: Boolean, required: true },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
