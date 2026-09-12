import { body, param } from "express-validator";

export const createReportValidator = [
  body("targetType")
    .isIn(["resource", "request", "user"])
    .withMessage("Target type must be one of: resource, request, user"),
  body("targetId")
    .isMongoId()
    .withMessage("Invalid target ID format"),
  body("reason")
    .isIn(["spam", "fraud", "inappropriate", "safety", "other"])
    .withMessage("Reason must be one of: spam, fraud, inappropriate, safety, other"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

export const resolveReportValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid report ID format"),
  body("resolution")
    .isString()
    .withMessage("Resolution must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Resolution notes cannot be empty"),
  body("status")
    .optional()
    .isIn(["reviewed", "resolved"])
    .withMessage("Status must be either 'reviewed' or 'resolved'"),
];
