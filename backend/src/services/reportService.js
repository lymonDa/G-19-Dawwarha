import mongoose from "mongoose";
import Report from "../models/Report.js";
import User from "../models/User.js";
import notificationService from "./notificationService.js";
import { isValidObjectId } from "../utils/objectId.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

const ALLOWED_TARGET_TYPES = ["resource", "request", "user"];
const ALLOWED_STATUS_FILTERS = ["open", "reviewed", "resolved"];

/**
 * Validates polymorphic target existence against real collections.
 * Allowed target types: 'resource', 'request', 'user'.
 *
 * @param {string} targetType
 * @param {string|mongoose.Types.ObjectId} targetId
 * @returns {Promise<boolean>}
 */
export async function validateReportTarget(targetType, targetId) {
  if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
    return false;
  }

  if (!targetId || !isValidObjectId(targetId)) {
    return false;
  }

  const objectId = new mongoose.Types.ObjectId(targetId);

  try {
    if (targetType === "user") {
      const user = await User.findById(objectId).lean();
      return Boolean(user);
    }

    if (targetType === "resource") {
      if (mongoose.models.Resource) {
        const doc = await mongoose.models.Resource.findById(objectId).lean();
        return Boolean(doc);
      }
      const doc = await mongoose.connection.collection("resources").findOne({ _id: objectId });
      return Boolean(doc);
    }

    if (targetType === "request") {
      if (mongoose.models.Request) {
        const doc = await mongoose.models.Request.findById(objectId).lean();
        return Boolean(doc);
      }
      const doc = await mongoose.connection.collection("requests").findOne({ _id: objectId });
      return Boolean(doc);
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Creates a report after validating polymorphic target existence.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.reporterId
 * @param {string} params.targetType
 * @param {string|mongoose.Types.ObjectId} params.targetId
 * @param {string} params.reason
 * @param {string} [params.description]
 * @returns {Promise<Report>}
 */
export async function createReport({ reporterId, targetType, targetId, reason, description }) {
  const targetExists = await validateReportTarget(targetType, targetId);
  if (!targetExists) {
    throw makeError(400, "TARGET_NOT_FOUND", "The reported target does not exist or targetType is invalid.");
  }

  const report = await Report.create({
    reporterId,
    targetType,
    targetId,
    reason,
    description: description || null,
  });

  return report;
}

/**
 * Lists reports with pagination and whitelisted filtering (Admin only).
 *
 * @param {Object} query
 * @param {string} [query.status]
 * @param {string} [query.targetType]
 * @param {number|string} [query.page=1]
 * @param {number|string} [query.limit=20]
 * @returns {Promise<{ reports: Array, pagination: Object }>}
 */
export async function listReports({ status, targetType, page = 1, limit = 20 } = {}) {
  const filter = {};

  if (status && ALLOWED_STATUS_FILTERS.includes(status)) {
    filter.status = status;
  }

  if (targetType && ALLOWED_TARGET_TYPES.includes(targetType)) {
    filter.targetType = targetType;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Resolves a report with admin resolution notes.
 *
 * @param {string|mongoose.Types.ObjectId} reportId
 * @param {Object} params
 * @param {string} [params.status="resolved"]
 * @param {string} params.resolution
 * @param {string|mongoose.Types.ObjectId} params.adminId
 * @returns {Promise<Report>}
 */
export async function resolveReport(reportId, { status = "resolved", resolution, adminId }) {
  if (!reportId || !isValidObjectId(reportId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid report ID.");
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw makeError(404, "REPORT_NOT_FOUND", "Report not found.");
  }

  if (!["reviewed", "resolved"].includes(status)) {
    throw makeError(400, "VALIDATION_ERROR", "Status must be either 'reviewed' or 'resolved'.");
  }

  if (!resolution || typeof resolution !== "string" || !resolution.trim()) {
    throw makeError(400, "VALIDATION_ERROR", "Resolution notes are required.");
  }

  report.status = status;
  report.resolution = resolution.trim();
  report.reviewedBy = adminId;

  await report.save();

  // Task 4.C: Create notification for the reporter upon report resolution
  await notificationService.notify({
    recipientId: report.reporterId,
    type: "report_resolved",
    title: "Report Resolved",
    message: `Your report has been resolved with resolution: ${report.resolution}`,
    relatedEntity: {
      type: "report",
      id: report._id,
    },
  });

  return report;
}

<<<<<<< HEAD
=======
/**
 * Retrieves reports submitted by a specific user (reporter).
 * Strictly filters by reporterId and projects only reporter-safe fields.
 * Omits admin notes, internal resolution details, and internal reviewer metadata per privacy rules.
 *
 * @param {string|mongoose.Types.ObjectId} reporterId
 * @param {Object} [options]
 * @param {number|string} [options.page=1]
 * @param {number|string} [options.limit=20]
 * @returns {Promise<{ reports: Array, pagination: Object }>}
 */
export async function getUserReports(reporterId, { page = 1, limit = 20 } = {}) {
  if (!reporterId || !isValidObjectId(reporterId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid or missing user ID.");
  }

  const objectId = new mongoose.Types.ObjectId(String(reporterId));
  const filter = { reporterId: objectId };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Select only reporter-facing fields. Exclude reviewedBy and resolution per privacy rules.
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .select("_id targetType targetId reason description status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
const reportService = {
  validateReportTarget,
  createReport,
  listReports,
<<<<<<< HEAD
=======
  getUserReports,
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  resolveReport,
};

export default reportService;
