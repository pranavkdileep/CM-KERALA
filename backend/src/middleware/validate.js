"use strict";

const AppError = require("../utils/AppError");

function fieldErrors(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

// validate({ body, query, params }) with zod schemas. Parsed values land on req.valid,
// because req.query is read only in Express 5. Unknown fields are stripped.
function validate(schemas) {
  return (req, _res, next) => {
    req.valid = {};
    for (const part of ["params", "query", "body"]) {
      if (!schemas[part]) continue;
      const parsed = schemas[part].safeParse(req[part] ?? {});
      if (!parsed.success) throw AppError.badRequest("Check the highlighted fields.", fieldErrors(parsed.error));
      req.valid[part] = parsed.data;
    }
    next();
  };
}

module.exports = { validate };
