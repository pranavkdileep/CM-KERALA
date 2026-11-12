"use strict";

const { env, assertEnv } = require("./config/env");
const { connectDb, disconnectDb } = require("./config/db");
const { createApp } = require("./app");

async function main() {
  assertEnv();
  await connectDb();

  const server = createApp().listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    if (!env.AI_API_KEY) console.warn("DEEPSEEK_API_KEY is not set: the AI assistant will use the labelled keyword fallback.");
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
