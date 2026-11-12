"use strict";

const { Router } = require("express");
const controller = require("../controllers/grievance.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { idParam } = require("../validators/common");

const router = Router();

router.get("/:id", authenticate, validate({ params: idParam }), controller.download);

module.exports = router;
