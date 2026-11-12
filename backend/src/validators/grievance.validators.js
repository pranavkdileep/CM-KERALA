"use strict";

const { CATEGORY_LIST, DISTRICTS, PRIORITIES, STATUS_LIST, VISIBILITY } = require("../config/constants");
const { z, objectId, emptyToUndefined, boolFromString, paging } = require("./common");

const description = z
  .string()
  .trim()
  .min(20, { message: "Describe the problem in at least 20 characters." })
  .max(4000, { message: "Keep the description under 4000 characters." });

const district = z.enum(DISTRICTS, { message: "Choose a district." });
const category = z.enum(CATEGORY_LIST, { message: "Choose a category." });

const create = z.object({
  district,
  category,
  subject: z.string().trim().min(5, { message: "Enter a subject of at least 5 characters." }).max(150, { message: "Keep the subject under 150 characters." }),
  description,
  analysisId: emptyToUndefined(objectId.optional()),
});

const analyze = z.object({
  description,
  district: emptyToUndefined(district.optional()),
});

const trackParam = z.object({
  ref: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^CMK-\d{4}-\d{6}$/, { message: "Reference numbers look like CMK-2026-123456." }),
});

const status = z.object({
  status: z.enum(STATUS_LIST, { message: "Choose a valid status." }),
  remark: emptyToUndefined(z.string().trim().max(2000).optional()),
  visibility: z.enum(Object.values(VISIBILITY)).default(VISIBILITY.PUBLIC),
});

const remark = z.object({
  text: z.string().trim().min(2, { message: "Write a remark." }).max(2000),
  visibility: z.enum(Object.values(VISIBILITY)).default(VISIBILITY.INTERNAL),
});

const feedback = z.object({
  rating: z.coerce.number().int().min(1, { message: "Choose a rating." }).max(5),
  satisfied: z.union([z.boolean(), boolFromString]),
  comment: emptyToUndefined(z.string().trim().max(1000).optional()),
});

// Query string filters for the CMO and officer lists.
const listQuery = z.object({
  district: emptyToUndefined(district.optional()),
  category: emptyToUndefined(category.optional()),
  priority: emptyToUndefined(z.enum(PRIORITIES).optional()),
  status: emptyToUndefined(z.enum(STATUS_LIST).optional()),
  department: emptyToUndefined(objectId.optional()),
  overdue: emptyToUndefined(boolFromString.optional()),
  escalated: emptyToUndefined(boolFromString.optional()),
  awaitingReview: emptyToUndefined(boolFromString.optional()),
  reopenRequested: emptyToUndefined(boolFromString.optional()),
  q: emptyToUndefined(z.string().trim().max(100).optional()),
  ...paging,
});

const triage = z
  .object({
    category: emptyToUndefined(category.optional()),
    priority: emptyToUndefined(z.enum(PRIORITIES).optional()),
  })
  .refine((v) => v.category || v.priority, { message: "Change the category or the priority.", path: ["category"] });

const assign = z.object({
  departmentId: objectId,
  officerId: emptyToUndefined(objectId.optional()),
  instructions: emptyToUndefined(z.string().trim().max(2000).optional()),
});

const escalate = z.object({
  reason: z.string().trim().min(5, { message: "Give a reason of at least 5 characters." }).max(1000),
});

const reviewReport = z
  .object({
    decision: z.enum(["accept", "reject"], { message: "Choose accept or send back." }),
    remark: emptyToUndefined(z.string().trim().max(2000).optional()),
    citizenMessage: emptyToUndefined(z.string().trim().max(1000).optional()),
  })
  .refine((v) => v.decision === "accept" || (v.remark && v.remark.length >= 3), {
    message: "Say what the department needs to fix.",
    path: ["remark"],
  });

const actionReport = z.object({
  summary: z.string().trim().min(5, { message: "Summarise the action in at least 5 characters." }).max(300),
  details: z.string().trim().min(20, { message: "Describe the action taken in at least 20 characters." }).max(4000),
});

const officersQuery = z.object({ department: emptyToUndefined(objectId.optional()) });

module.exports = {
  create,
  analyze,
  trackParam,
  status,
  remark,
  feedback,
  listQuery,
  triage,
  assign,
  escalate,
  reviewReport,
  actionReport,
  officersQuery,
};
