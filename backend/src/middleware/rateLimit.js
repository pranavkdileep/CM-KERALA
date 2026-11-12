"use strict";

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const AppError = require("../utils/AppError");

const MINUTE = 60 * 1000;

function limiter({ windowMs, limit, message, key }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: key || ((req) => ipKeyGenerator(req.ip)),
    handler: (_req, _res, next) => next(AppError.tooMany(message)),
  });
}

const byUser = (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip));

// Applied to every request.
const globalLimiter = limiter({ windowMs: 15 * MINUTE, limit: 600 });

// Slows password guessing: counted per address and per email together.
const loginLimiter = limiter({
  windowMs: 15 * MINUTE,
  limit: 10,
  message: "Too many sign in attempts. Try again in 15 minutes.",
  key: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "").toLowerCase()}`,
});

const registerLimiter = limiter({
  windowMs: 60 * MINUTE,
  limit: 8,
  message: "Too many accounts created from this network. Try again later.",
});

const enquiryLimiter = limiter({
  windowMs: 60 * MINUTE,
  limit: 5,
  message: "You have sent several messages already. Try again in an hour.",
});

const trackLimiter = limiter({
  windowMs: 15 * MINUTE,
  limit: 60,
  message: "Too many lookups. Try again in a few minutes.",
});

const submitLimiter = limiter({
  windowMs: 60 * MINUTE,
  limit: 10,
  message: "You have submitted several grievances already. Try again in an hour.",
  key: byUser,
});

const aiLimiter = limiter({
  windowMs: 15 * MINUTE,
  limit: 20,
  message: "Too many analysis requests. Wait a few minutes and try again.",
  key: byUser,
});

// Generic cap on write actions by signed in staff and citizens.
const writeLimiter = limiter({ windowMs: 15 * MINUTE, limit: 200, key: byUser });

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  enquiryLimiter,
  trackLimiter,
  submitLimiter,
  aiLimiter,
  writeLimiter,
};
