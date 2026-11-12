"use strict";

const multer = require("multer");
const path = require("node:path");
const { env } = require("../config/env");
const { ALLOWED_UPLOAD_TYPES } = require("../config/constants");
const AppError = require("../utils/AppError");

const maxBytes = env.UPLOAD_MAX_MB * 1024 * 1024;

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1, fields: 20, fieldSize: 20 * 1024 },
  fileFilter(_req, file, cb) {
    const extensions = ALLOWED_UPLOAD_TYPES[file.mimetype];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!extensions || !extensions.includes(ext)) {
      return cb(AppError.badRequest("Attach a JPG, PNG or PDF file.", { attachment: "Attach a JPG, PNG or PDF file." }));
    }
    cb(null, true);
  },
});

// First bytes of each allowed type. Stops a renamed executable passing as an image.
const SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

function matchesSignature(file) {
  const sig = SIGNATURES[file.mimetype];
  return Boolean(sig) && sig.every((byte, i) => file.buffer[i] === byte);
}

// Accepts one optional file in the given form field and puts it on req.file.
function uploadSingle(field) {
  const handler = uploader.single(field);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === "LIMIT_FILE_SIZE" ? `The file is larger than ${env.UPLOAD_MAX_MB} MB.` : "The upload could not be read.";
        return next(AppError.badRequest(message, { [field]: message }));
      }
      if (err) return next(err);
      if (req.file && !matchesSignature(req.file)) {
        const message = "The file content does not match its type.";
        return next(AppError.badRequest(message, { [field]: message }));
      }
      next();
    });
  };
}

module.exports = { uploadSingle };
