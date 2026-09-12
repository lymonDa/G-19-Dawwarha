import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return process.env.JWT_SECRET;
};
const serviceError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });
const withoutPassword = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.passwordHash;
  return data;
};

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const register = async ({ name, email, password, location, address, contactInfo }) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    throw serviceError(409, "DUPLICATE_EMAIL", "An account with this email already exists.");
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: "user",
    status: "active",
    location,
    address,
    contactInfo,
  });
  return { user: withoutPassword(user), token: signToken(user) };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw serviceError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }
  if (user.status === "suspended") {
    throw serviceError(403, "ACCOUNT_SUSPENDED", "Your account is suspended.");
  }
  return { user: withoutPassword(user), token: signToken(user) };
};
