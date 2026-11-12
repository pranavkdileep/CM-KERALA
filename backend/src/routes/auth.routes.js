"use strict";

const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");
const { verifyTurnstile } = require("../middleware/turnstile");
const { validate } = require("../middleware/validate");
const v = require("../validators/auth.validators");

const router = Router();

router.post("/register", registerLimiter, verifyTurnstile, validate({ body: v.register }), controller.register);
router.post("/login", loginLimiter, verifyTurnstile, validate({ body: v.login }), controller.login);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.me);

module.exports = router;
