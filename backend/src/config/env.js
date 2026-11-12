"use strict";

// Single place where environment variables are read, validated and given defaults.
// Values come from backend/.env (loaded with `node --env-file`) or the host environment.

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

function int(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) throw new Error(`Environment variable ${name} must be a number.`);
  return value;
}

const env = {
  NODE_ENV,
  isProduction,
  PORT: int("PORT", 4000),

  MONGODB_URI: process.env.MONGODB_URI || "",
  MONGODB_DB: process.env.MONGODB_DB || "cm-kerala",

  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN_SECONDS: int("JWT_EXPIRES_IN_SECONDS", 60 * 60 * 8),
  JWT_ISSUER: "cm-kerala-grievance-portal",
  JWT_AUDIENCE: "cm-kerala-users",

  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  // Number of reverse proxies in front of the API. The Next.js server counts as one.
  TRUST_PROXY: int("TRUST_PROXY", 1),

  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || "",
  TURNSTILE_VERIFY_URL: "https://challenges.cloudflare.com/turnstile/v0/siteverify",

  AI_API_KEY: process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY || "",
  AI_BASE_URL: (process.env.AI_BASE_URL || "https://api.deepseek.com").replace(/\/$/, ""),
  AI_MODEL: process.env.AI_MODEL || "deepseek-flash",
  AI_TIMEOUT_MS: int("AI_TIMEOUT_MS", 20000),

  UPLOAD_MAX_MB: int("UPLOAD_MAX_MB", 5),
  SLA_DAYS: int("SLA_DAYS", 30),
};

// Fails fast on settings the API cannot run safely without.
function assertEnv() {
  const problems = [];
  if (!env.MONGODB_URI) problems.push("MONGODB_URI is not set.");
  if (env.JWT_SECRET.length < 32) problems.push("JWT_SECRET must be at least 32 characters.");
  if (isProduction && !env.TURNSTILE_SECRET_KEY) {
    problems.push("TURNSTILE_SECRET_KEY is required in production.");
  }
  if (problems.length > 0) {
    throw new Error(`Invalid configuration:\n - ${problems.join("\n - ")}\nCopy .env.example to .env and fill it in.`);
  }
}

module.exports = { env, assertEnv };
