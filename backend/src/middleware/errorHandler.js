"use strict";

const AppError = require("../utils/AppError");

function notFound(_req, _res, next) {
  next(AppError.notFound("Endpoint not found."));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, code: err.code, errors: err.errors });
  }
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body.", code: "bad_json" });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Request body is too large.", code: "too_large" });
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid identifier.", code: "bad_request" });
  if (err.code === 11000) return res.status(409).json({ error: "That record already exists.", code: "conflict" });
  if (err.name === "ValidationError") return res.status(400).json({ error: "Invalid data.", code: "bad_request" });

  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Try again.", code: "server_error" });
}

module.exports = { notFound, errorHandler };
