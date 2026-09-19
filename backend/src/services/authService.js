import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return process.env.JWT_SECRET;
};
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const serviceError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

const withoutPassword = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.passwordHash;
  return data;
};

export const signToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const register = async ({
  name,
  email,
  password,
  location,
  address,
  contactInfo,
}) => {
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
  const userData = withoutPassword(user);
  if (mongoose.connection?.readyState === 1) {
    try {
      const org = await Organization.findOne({ ownerUserId: user._id });
      if (org) {
        userData.organizationId = String(org._id);
      }
    } catch {
      // Non-blocking in decoupled/mocked environments
    }
  }
  return { user: userData, token: signToken(user) };
};

export const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  let resetToken;
  if (user && user.status !== "suspended") {
    resetToken = jwt.sign(
      { sub: String(user._id), type: "password_reset" },
      getJwtSecret(),
      { expiresIn: "15m" }
    );
  }

  const response = {
    message: "If that email address is in our database, we will send you an email to reset your password.",
  };

  if (process.env.NODE_ENV !== "production" && resetToken) {
    response.resetToken = resetToken;
  }

  return response;
};

export const resetPassword = async (token, password) => {
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw serviceError(400, "INVALID_TOKEN", "The password reset link is invalid or has expired.");
  }

  if (payload.type !== "password_reset" || !payload.sub) {
    throw serviceError(400, "INVALID_TOKEN", "The password reset link is invalid or has expired.");
  }

  const user = await User.findById(payload.sub).select("+passwordHash");
  if (!user) {
    throw serviceError(404, "USER_NOT_FOUND", "User associated with this reset link was not found.");
  }

  if (user.status === "suspended") {
    throw serviceError(403, "ACCOUNT_SUSPENDED", "Your account is suspended.");
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();

  return { message: "Password has been reset successfully." };
};
