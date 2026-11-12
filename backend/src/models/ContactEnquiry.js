"use strict";

const mongoose = require("mongoose");

const contactEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, enum: ["new", "read", "closed"], default: "new", index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContactEnquiry", contactEnquirySchema);
