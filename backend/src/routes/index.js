"use strict";

const { Router } = require("express");
const mongoose = require("mongoose");

const router = Router();

router.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "database_unavailable" });
});

router.use("/auth", require("./auth.routes"));
router.use("/", require("./public.routes"));
router.use("/grievances", require("./grievance.routes"));
router.use("/attachments", require("./attachment.routes"));
router.use("/cmo", require("./cmo.routes"));
router.use("/officer", require("./officer.routes"));

module.exports = router;
