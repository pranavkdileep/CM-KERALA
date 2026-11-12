"use strict";

const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/constants");
const { User } = require("../models");
const { signToken } = require("../services/token.service");
const AppError = require("../utils/AppError");
const serialize = require("../utils/serializers");

const BCRYPT_ROUNDS = 10;
// Compared against when the email is unknown, so a miss takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

async function register(req, res) {
  const { name, email, mobile, password } = req.valid.body;
  if (await User.exists({ email })) {
    throw AppError.conflict("An account with this email already exists. Sign in instead.");
  }

  const user = await User.create({
    name,
    email,
    mobile,
    role: ROLES.CITIZEN,
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
  });

  const session = signToken({ ...user.toObject(), tokenVersion: 0 });
  res.status(201).json({ user: serialize.user(user), token: session.token, expiresAt: session.expiresAt });
}

async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select("+passwordHash +tokenVersion").populate("department", "name slug");

  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid || !user.isActive) throw AppError.unauthorized("The email or password is not correct.");

  user.lastLoginAt = new Date();
  await user.save();

  const session = signToken(user);
  res.json({ user: serialize.user(user), token: session.token, expiresAt: session.expiresAt });
}

// Bumping tokenVersion invalidates every token issued before, on every device.
async function logout(req, res) {
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  res.json({ ok: true });
}

async function me(req, res) {
  await req.user.populate("department", "name slug");
  res.json({ user: serialize.user(req.user) });
}

module.exports = { register, login, logout, me };
