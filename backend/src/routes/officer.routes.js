"use strict";

const { Router } = require("express");
const controller = require("../controllers/grievance.controller");
const { ROLES } = require("../config/constants");
const { authenticate, requireRole } = require("../middleware/auth");
const { writeLimiter } = require("../middleware/rateLimit");
const { uploadSingle } = require("../middleware/upload");
const { validate } = require("../middleware/validate");
const { idParam } = require("../validators/common");
const v = require("../validators/grievance.validators");

const router = Router();
router.use(authenticate, requireRole(ROLES.OFFICER));

router.get("/stats", controller.officerStats);
router.get("/grievances", validate({ query: v.listQuery }), controller.officerList);
router.post(
  "/grievances/:id/action-report",
  writeLimiter,
  uploadSingle("attachment"),
  validate({ params: idParam, body: v.actionReport }),
  controller.submitActionReport,
);

module.exports = router;
