"use strict";

const { z, email } = require("./common");

const create = z.object({
  name: z.string().trim().min(2, { message: "Enter your name." }).max(100, { message: "Keep your name under 100 characters." }),
  email,
  subject: z.string().trim().min(3, { message: "Enter a subject." }).max(150, { message: "Keep the subject under 150 characters." }),
  message: z.string().trim().min(10, { message: "Write at least 10 characters so we can help." }).max(2000, { message: "Keep the message under 2000 characters." }),
});

module.exports = { create };
