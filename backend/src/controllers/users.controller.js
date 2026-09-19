import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

export async function getMe(req, res, next) {
  try {
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    if (mongoose.connection?.readyState === 1) {
      try {
        const org = await Organization.findOne({ ownerUserId: req.user._id }).select("_id verificationStatus name");
        if (org) {
          userObj.organizationId = org._id;
          userObj.organizationVerificationStatus = org.verificationStatus;
        }
      } catch {
        // Non-blocking in decoupled/mocked environments
      }
    }
    return res.json({ success: true, data: userObj });
  } catch (error) { return next(error); }
}

export async function updateMe(req, res, next) {
  try {
    const changes = {};
    for (const field of ["name", "location", "address", "contactInfo"]) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: changes }, { returnDocument: "after", runValidators: true });
    return res.json({ success: true, data: user });
  } catch (error) { return next(error); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Current and new password are required." }
      });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "New password must be at least 8 characters long." }
      });
    }
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found." } });
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Current password is incorrect." }
      });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) { return next(error); }
}