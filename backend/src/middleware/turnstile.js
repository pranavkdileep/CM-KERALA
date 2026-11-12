"use strict";

const { env } = require("../config/env");
const AppError = require("../utils/AppError");

let warned = false;

// Verifies the Cloudflare Turnstile token sent with a public or sensitive form.
// The token is single use and is checked against Cloudflare on every request.
async function verifyTurnstile(req, _res, next) {
  if (!env.TURNSTILE_SECRET_KEY) {
    // assertEnv() blocks this in production. In development it is skipped with a warning.
    if (!warned) {
      console.warn("TURNSTILE_SECRET_KEY is not set: captcha verification is being skipped.");
      warned = true;
    }
    return next();
  }

  const token = (req.body && req.body.turnstileToken) || req.get("x-turnstile-token");
  if (!token || typeof token !== "string" || token.length > 2048) {
    throw new AppError(400, "Complete the verification check and try again.", { code: "captcha_missing" });
  }

  const params = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (req.ip) params.set("remoteip", req.ip);

  let result;
  try {
    const res = await fetch(env.TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(8000),
    });
    result = await res.json();
  } catch (err) {
    console.error("Turnstile verification request failed:", err.message);
    // Fail closed: if the check cannot run, the request does not go through.
    throw new AppError(503, "Verification is unavailable right now. Try again in a minute.", { code: "captcha_unavailable" });
  }

  if (!result.success) {
    console.warn("Turnstile rejected a token:", (result["error-codes"] || []).join(", "));
    throw new AppError(400, "Verification failed. Reload the check and try again.", { code: "captcha_failed" });
  }

  if (req.body) delete req.body.turnstileToken;
  next();
}

module.exports = { verifyTurnstile };
