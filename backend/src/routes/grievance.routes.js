"use strict";

const { Router } = require("express");
const ai = require("../controllers/ai.controller");
const controller = require("../controllers/grievance.controller");
const { ROLES } = require("../config/constants");
const { authenticate, requireRole } = require("../middleware/auth");
const { aiLimiter, submitLimiter, trackLimiter, writeLimiter } = require("../middleware/rateLimit");
const { uploadSingle } = require("../middleware/upload");
const { verifyTurnstile } = require("../middleware/turnstile");
const { validate } = require("../middleware/validate");
const { idParam } = require("../validators/common");
const v = require("../validators/grievance.validators");

const router = Router();
const { CITIZEN, CMO, OFFICER } = ROLES;

// Public tracking by reference number. Declared before "/:id" so "track" is not read as an id.
router.get("/track/:ref", trackLimiter, validate({ params: v.trackParam }), controller.track);

// AI Grievance Assistant: suggestions the citizen reviews before submitting.
router.post("/analyze", authenticate, requireRole(CITIZEN, CMO), aiLimiter, validate({ body: v.analyze }), ai.analyze);

// Citizen
router.post(
  "/",
  authenticate,
  requireRole(CITIZEN),
  submitLimiter,
  uploadSingle("attachment"),
  verifyTurnstile,
  validate({ body: v.create }),
  controller.create,
);
router.get("/mine", authenticate, requireRole(CITIZEN), controller.mine);
router.post("/:id/feedback", authenticate, requireRole(CITIZEN), writeLimiter, validate({ params: idParam, body: v.feedback }), controller.feedback);

// Any signed in role. Access rules are applied inside the service.
router.get("/:id", authenticate, validate({ params: idParam }), controller.detail);

// CMO and officers
router.patch("/:id/status", authenticate, requireRole(CMO, OFFICER), writeLimiter, validate({ params: idParam, body: v.status }), controller.updateStatus);
router.post("/:id/remarks", authenticate, requireRole(CMO, OFFICER), writeLimiter, validate({ params: idParam, body: v.remark }), controller.addRemark);

module.exports = router;
