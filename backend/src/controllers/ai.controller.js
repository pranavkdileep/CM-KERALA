"use strict";

const { analyzeComplaint } = require("../services/ai.service");

// Returns suggestions the citizen can accept or change. Nothing is saved on a grievance here.
async function analyze(req, res) {
  const { description, district } = req.valid.body;
  const { doc, note } = await analyzeComplaint({ user: req.user, description, district });
  res.json({
    analysisId: doc.id,
    category: doc.category,
    department: doc.departmentName || null,
    priority: doc.priority,
    summary: doc.summary,
    reasoning: doc.reasoning,
    source: doc.source,
    model: doc.model,
    note,
    duplicates: doc.duplicates.map((d) => ({ referenceId: d.referenceId, score: d.score })),
    disclaimer: "These are suggestions only. The Chief Minister's Office reviews every grievance and decides where it goes.",
  });
}

module.exports = { analyze };
