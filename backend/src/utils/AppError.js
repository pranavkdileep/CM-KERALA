"use strict";

class AppError extends Error {
  constructor(status, message, { code, errors } = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new AppError(400, message, { code: "bad_request", errors });
  }
  static unauthorized(message = "Sign in to continue.") {
    return new AppError(401, message, { code: "unauthorized" });
  }
  static forbidden(message = "You do not have access to this.") {
    return new AppError(403, message, { code: "forbidden" });
  }
  static notFound(message = "Not found.") {
    return new AppError(404, message, { code: "not_found" });
  }
  static conflict(message) {
    return new AppError(409, message, { code: "conflict" });
  }
  static tooMany(message = "Too many requests. Try again later.") {
    return new AppError(429, message, { code: "rate_limited" });
  }
}

module.exports = AppError;
