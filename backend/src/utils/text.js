"use strict";

const crypto = require("node:crypto");

const STOP_WORDS = new Set(
  "the and for are but not you all can had her was one our out has have this that with from they been were will would there their what about which when your into than them then some could other these also just very much more only over such here after before because while where being does did doing its still any too near since".split(
    " ",
  ),
);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t)),
  );
}

// Dice coefficient on word sets: 0 means nothing in common, 1 means identical.
function similarity(a, b) {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return { score: 0, shared: 0 };
  let shared = 0;
  for (const token of setA) if (setB.has(token)) shared += 1;
  return { score: (2 * shared) / (setA.size + setB.size), shared };
}

function hashText(text) {
  return crypto.createHash("sha256").update(String(text).trim().toLowerCase().replace(/\s+/g, " ")).digest("hex");
}

function truncate(text, max) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 3).trimEnd()}...`;
}

module.exports = { escapeRegex, tokenize, similarity, hashText, truncate };
