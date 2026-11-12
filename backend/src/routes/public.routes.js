"use strict";

const { Router } = require("express");
const departments = require("../controllers/department.controller");
const enquiries = require("../controllers/enquiry.controller");
const { enquiryLimiter } = require("../middleware/rateLimit");
const { verifyTurnstile } = require("../middleware/turnstile");
const { validate } = require("../middleware/validate");
const v = require("../validators/enquiry.validators");

const router = Router();

router.get("/departments", departments.list);
router.post("/enquiries", enquiryLimiter, verifyTurnstile, validate({ body: v.create }), enquiries.create);

module.exports = router;
