"use strict";

const { z, email } = require("./common");

const password = z
  .string()
  .min(8, { message: "Use at least 8 characters." })
  .max(72, { message: "Use 72 characters or fewer." })
  .regex(/[A-Za-z]/, { message: "Include at least one letter." })
  .regex(/\d/, { message: "Include at least one number." });

const mobile = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, { message: "Enter a 10 digit Indian mobile number." }));

const register = z.object({
  name: z.string().trim().min(2, { message: "Enter your full name." }).max(100),
  email,
  mobile,
  password,
});

const login = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password." }).max(72),
});

module.exports = { register, login };
