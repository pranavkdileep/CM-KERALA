"use strict";

const { User } = require("../models");
const { verifyToken } = require("../services/token.service");
const AppError = require("../utils/AppError");

// Verifies the Bearer token, then loads the user so deactivated accounts and
// tokens revoked by logout (tokenVersion) are rejected straight away.
async function authenticate(req, _res, next) {
  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) throw AppError.unauthorized();

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).select("+tokenVersion");
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
    throw AppError.unauthorized("Your session has expired. Sign in again.");
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) throw AppError.forbidden();
    next();
  };
}

module.exports = { authenticate, requireRole };
