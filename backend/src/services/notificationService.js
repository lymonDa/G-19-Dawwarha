import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { isValidObjectId } from "../utils/objectId.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

export const ALLOWED_NOTIFICATION_TYPES = [
  "match_created",
  "match_accepted",
  "report_resolved",
  "org_verification_decided",
];

/**
 * Creates and persists a user-facing notification.
 * Domain-agnostic and reusable across matching, reports, and other domains.
 *
 * Supports both positional arguments:
 * notify(recipientId, type, title, message, relatedEntity)
 * and an options object:
 * notify({ recipientId, type, title, message, relatedEntity })
 *
 * @param {string|mongoose.Types.ObjectId|Object} recipientIdOrOptions
 * @param {string} [typeArg]
 * @param {string} [titleArg]
 * @param {string} [messageArg]
 * @param {Object} [relatedEntityArg]
 * @returns {Promise<Object>} Created Notification document
 */
export async function notify(
  recipientIdOrOptions,
  typeArg,
  titleArg,
  messageArg,
  relatedEntityArg
) {
  let recipientId;
  let type;
  let title;
  let message;
  let relatedEntity;

  if (
    typeof recipientIdOrOptions === "object" &&
    recipientIdOrOptions !== null &&
    !isValidObjectId(recipientIdOrOptions) &&
    !(recipientIdOrOptions instanceof mongoose.Types.ObjectId)
  ) {
    ({ recipientId, type, title, message, relatedEntity } = recipientIdOrOptions);
  } else {
    recipientId = recipientIdOrOptions;
    type = typeArg;
    title = titleArg;
    message = messageArg;
    relatedEntity = relatedEntityArg;
  }

  // 1. Validate recipient ID
  if (!recipientId || !isValidObjectId(recipientId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid or missing recipient ID.");
  }

  // 2. Validate notification type
  if (!type || !ALLOWED_NOTIFICATION_TYPES.includes(type)) {
    throw makeError(
      400,
      "VALIDATION_ERROR",
      `Invalid or unsupported notification type. Allowed types: ${ALLOWED_NOTIFICATION_TYPES.join(", ")}`
    );
  }

  // 3. Validate title
  if (!title || typeof title !== "string" || !title.trim()) {
    throw makeError(400, "VALIDATION_ERROR", "Notification title is required.");
  }

  // 4. Validate message
  if (!message || typeof message !== "string" || !message.trim()) {
    throw makeError(400, "VALIDATION_ERROR", "Notification message is required.");
  }

  // 5. Validate relatedEntity if supplied
  let cleanRelatedEntity = null;
  if (relatedEntity && typeof relatedEntity === "object") {
    if (relatedEntity.id) {
      if (!isValidObjectId(relatedEntity.id)) {
        throw makeError(400, "VALIDATION_ERROR", "Invalid relatedEntity ID.");
      }
    }
    cleanRelatedEntity = {
      type: relatedEntity.type ? String(relatedEntity.type).trim() : undefined,
      id: relatedEntity.id ? new mongoose.Types.ObjectId(String(relatedEntity.id)) : undefined,
    };
  }

  // 6. Explicitly whitelist payload to prevent operator injection or field pollution
  const notification = await Notification.create({
    recipientId: new mongoose.Types.ObjectId(String(recipientId)),
    type,
    title: title.trim(),
    message: message.trim(),
    relatedEntity: cleanRelatedEntity,
    readAt: null,
    createdAt: new Date(),
  });

  return notification;
}

/**
 * Retrieves paginated notifications for a specific recipient.
 * Strictly scoped to recipientId to prevent user data leakage.
 *
 * @param {string|mongoose.Types.ObjectId} recipientId
 * @param {Object} [options]
 * @param {number|string} [options.page=1]
 * @param {number|string} [options.limit=20]
 * @param {boolean} [options.unreadOnly=false]
 * @returns {Promise<{ notifications: Array, pagination: Object }>}
 */
export async function getUserNotifications(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  if (!recipientId || !isValidObjectId(recipientId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid recipient ID.");
  }

  const query = {
    recipientId: new mongoose.Types.ObjectId(String(recipientId)),
  };

  if (unreadOnly) {
    query.readAt = null;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ readAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Marks a notification as read if owned by the recipient.
 *
 * @param {string|mongoose.Types.ObjectId} notificationId
 * @param {string|mongoose.Types.ObjectId} recipientId
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(notificationId, recipientId) {
  if (!notificationId || !isValidObjectId(notificationId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid notification ID.");
  }

  if (!recipientId || !isValidObjectId(recipientId)) {
    throw makeError(400, "VALIDATION_ERROR", "Invalid recipient ID.");
  }

  const notification = await Notification.findOne({
    _id: new mongoose.Types.ObjectId(String(notificationId)),
    recipientId: new mongoose.Types.ObjectId(String(recipientId)),
  });

  if (!notification) {
    throw makeError(404, "NOT_FOUND", "Notification not found.");
  }

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
}

const notificationService = {
  notify,
  getUserNotifications,
  markAsRead,
  ALLOWED_NOTIFICATION_TYPES,
};

export default notificationService;

