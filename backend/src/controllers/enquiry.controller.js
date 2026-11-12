"use strict";

const { ContactEnquiry } = require("../models");
const { parsePagination, pageResult } = require("../utils/pagination");

async function create(req, res) {
  const enquiry = await ContactEnquiry.create(req.valid.body);
  res.status(201).json({ id: enquiry.id, createdAt: enquiry.createdAt });
}

// CMO only: read the enquiries that came in through the contact form.
async function list(req, res) {
  const paging = parsePagination(req.query);
  const [items, total] = await Promise.all([
    ContactEnquiry.find().sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit),
    ContactEnquiry.countDocuments(),
  ]);
  res.json(
    pageResult(
      items.map((e) => ({ id: e.id, name: e.name, email: e.email, subject: e.subject, message: e.message, status: e.status, createdAt: e.createdAt })),
      total,
      paging,
    ),
  );
}

module.exports = { create, list };
