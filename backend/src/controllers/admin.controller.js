import User from "../models/User.js";

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: users });
  } catch (error) { return next(error); }
}

async function setStatus(req, res, next, status) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found." } });
    return res.json({ success: true, data: user });
  } catch (error) { return next(error); }
}

export const suspendUser = (req, res, next) => setStatus(req, res, next, "suspended");
export const reactivateUser = (req, res, next) => setStatus(req, res, next, "active");