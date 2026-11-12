"use strict";

const { Department } = require("../models");
const serialize = require("../utils/serializers");

async function list(_req, res) {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });
  res.json({ items: departments.map(serialize.department) });
}

module.exports = { list };
