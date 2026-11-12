"use strict";

const { Router } = require("express");
const controller = require("../controllers/grievance.controller");
const enquiries = require("../controllers/enquiry.controller");
const { ROLES } = require("../config/constants");
const { authenticate, requireRole } = require("../middleware/auth");
const { writeLimiter } = require("../middleware/rateLimit");
const { validate } = require("../middleware/validate");
const { idParam } = require("../validators/common");
const v = require("../validators/grievance.validators");

const router = Router();
router.use(authenticate, requireRole(ROLES.CMO));

router.get("/stats", controller.cmoStats);
router.get("/grievances", validate({ query: v.listQuery }), controller.cmoList);
router.get("/officers", validate({ query: v.officersQuery }), controller.officers);
router.get("/enquiries", enquiries.list);

router.patch("/grievances/:id/triage", writeLimiter, validate({ params: idParam, body: v.triage }), controller.triage);
router.post("/grievances/:id/assign", writeLimiter, validate({ params: idParam, body: v.assign }), controller.assign);
router.post("/grievances/:id/escalate", writeLimiter, validate({ params: idParam, body: v.escalate }), controller.escalate);
router.post("/grievances/:id/review-report", writeLimiter, validate({ params: idParam, body: v.reviewReport }), controller.reviewReport);

module.exports = router;
