"use strict";

const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const AppError = require("../utils/AppError");

function signToken(user) {
  const token = jwt.sign({ role: user.role, tv: user.tokenVersion ?? 0 }, env.JWT_SECRET, {
    algorithm: "HS256",
    subject: String(user._id),
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  return { token, expiresAt: new Date(Date.now() + env.JWT_EXPIRES_IN_SECONDS * 1000) };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
  } catch {
    throw AppError.unauthorized("Your session has expired. Sign in again.");
  }
}

module.exports = { signToken, verifyToken };
