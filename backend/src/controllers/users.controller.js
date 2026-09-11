import User from "../models/User.js";

export function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}
export async function updateMe(req, res, next) {
  try {
    const changes = {};
    for (const field of ["name", "location"]) if (req.body[field] !== undefined) changes[field] = req.body[field];
    const user = await User.findByIdAndUpdate(req.user._id, { $set: changes }, { new: true, runValidators: true });
    return res.json({ success: true, data: user });
  } catch (error) { return next(error); }
}