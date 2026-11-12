"use strict";

const mongoose = require("mongoose");
const { ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
    mobile: { type: String, trim: true, match: /^[6-9]\d{9}$/ },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CITIZEN, index: true },
    // Only officers belong to a department.
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null, index: true },
    designation: { type: String, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
    // Incremented on logout and password change. Tokens carrying an older value stop working.
    tokenVersion: { type: Number, default: 0, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
