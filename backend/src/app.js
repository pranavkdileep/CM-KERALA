"use strict";

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { env } = require("./config/env");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimit");
const routes = require("./routes");

function createApp() {
  const app = express();

  // The Next.js server sits in front of this API and forwards the visitor's address.
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(globalLimiter);
  app.use(express.json({ limit: "20kb" }));

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
