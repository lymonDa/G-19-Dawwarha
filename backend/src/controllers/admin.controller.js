import User from "../models/User.js";
import { buildPagination, getPagination } from "../utils/pagination.js";

export async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.search && typeof req.query.search === "string" && req.query.search.trim()) {
      const sanitized = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: sanitized, $options: "i" } },
        { email: { $regex: sanitized, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return res.json({ success: true, data: users, pagination: buildPagination({ page, limit, total }) });
  } catch (error) { return next(error); }
}

async function setStatus(req, res, next, status) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { status } }, { returnDocument: "after" });
    if (!user) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found." } });
    return res.json({ success: true, data: user });
  } catch (error) { return next(error); }
}

export const suspendUser = (req, res, next) => setStatus(req, res, next, "suspended");
export const reactivateUser = (req, res, next) => setStatus(req, res, next, "active");