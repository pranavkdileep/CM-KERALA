"use strict";

const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid identifier." });

// Multipart forms send empty fields as "". Treat them as missing.
const emptyToUndefined = (schema) => z.preprocess((v) => (v === "" || v === null ? undefined : v), schema);

const boolFromString = z.enum(["true", "false"]).transform((v) => v === "true");

const paging = {
  page: z.coerce.number().int().min(1).max(10000).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
};

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, { message: "Use an email address under 254 characters." })
  .pipe(z.email({ message: "Enter an email address like name@example.com." }));

const idParam = z.object({ id: z.string().min(6).max(40).regex(/^[A-Za-z0-9-]+$/, { message: "Invalid identifier." }) });

module.exports = { z, email, objectId, emptyToUndefined, boolFromString, paging, idParam };
