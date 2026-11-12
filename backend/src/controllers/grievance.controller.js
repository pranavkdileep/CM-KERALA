"use strict";

const grievances = require("../services/grievance.service");
const { summarise } = require("../services/stats.service");
const { Attachment, Department, User } = require("../models");
const { ROLES } = require("../config/constants");
const AppError = require("../utils/AppError");
const serialize = require("../utils/serializers");

// --- Citizen -----------------------------------------------------------------

async function create(req, res) {
  const grievance = await grievances.createGrievance({ user: req.user, body: req.valid.body, file: req.file });
  res.status(201).json({ id: grievance.id, referenceId: grievance.referenceId, status: grievance.status, dueDate: grievance.dueDate });
}

async function mine(req, res) {
  res.json(await grievances.listForCitizen(req.user));
}

async function feedback(req, res) {
  const fb = await grievances.submitFeedback(req.user, req.params.id, req.valid.body);
  res.status(201).json({ feedback: serialize.feedback(fb) });
}

// --- Public ------------------------------------------------------------------

async function track(req, res) {
  res.json(await grievances.track(req.valid.params.ref));
}

// --- Shared ------------------------------------------------------------------

async function detail(req, res) {
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function updateStatus(req, res) {
  await grievances.updateStatus(req.user, req.params.id, req.valid.body);
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function addRemark(req, res) {
  await grievances.addRemark(req.user, req.params.id, req.valid.body);
  res.status(201).json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function download(req, res) {
  const attachment = await Attachment.findById(req.params.id).select("+data");
  if (!attachment) throw AppError.notFound("File not found.");
  // loadForUser applies the same access rules as the grievance itself.
  await grievances.loadForUser(req.user, String(attachment.grievance), { populate: false });
  if (attachment.kind === "action_report" && req.user.role === ROLES.CITIZEN) throw AppError.notFound("File not found.");

  res.set({
    "Content-Type": attachment.mimeType,
    "Content-Length": attachment.size,
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
    "Cache-Control": "private, max-age=0, no-store",
  });
  res.send(attachment.data);
}

// --- CMO ---------------------------------------------------------------------

async function cmoList(req, res) {
  res.json(await grievances.list(req.user, req.valid.query));
}

async function cmoStats(_req, res) {
  res.json(await summarise());
}

async function triage(req, res) {
  await grievances.triage(req.user, req.params.id, req.valid.body);
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function assign(req, res) {
  await grievances.assign(req.user, req.params.id, req.valid.body);
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function escalate(req, res) {
  await grievances.escalate(req.user, req.params.id, req.valid.body);
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function reviewReport(req, res) {
  await grievances.reviewReport(req.user, req.params.id, req.valid.body);
  res.json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

async function officers(req, res) {
  const filter = { role: ROLES.OFFICER, isActive: true };
  if (req.valid.query.department) filter.department = req.valid.query.department;
  const items = await User.find(filter).populate("department", "name slug").sort({ name: 1 });
  res.json({ items: items.map(serialize.user) });
}

// --- Officer -----------------------------------------------------------------

async function officerList(req, res) {
  res.json(await grievances.list(req.user, req.valid.query));
}

async function officerStats(req, res) {
  const department = await Department.findById(req.user.department).select("name slug");
  const stats = await summarise({ department: req.user.department });
  res.json({ department: serialize.department(department), ...stats });
}

async function submitActionReport(req, res) {
  await grievances.submitActionReport(req.user, req.params.id, req.valid.body, req.file);
  res.status(201).json({ grievance: await grievances.getDetail(req.user, req.params.id) });
}

module.exports = {
  create,
  mine,
  feedback,
  track,
  detail,
  updateStatus,
  addRemark,
  download,
  cmoList,
  cmoStats,
  triage,
  assign,
  escalate,
  reviewReport,
  officers,
  officerList,
  officerStats,
  submitActionReport,
};
