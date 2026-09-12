import { body, param } from "express-validator";

export const organizationIdValidator = [
  param("id").isMongoId().withMessage("Invalid organization ID format"),
];

export const createOrganizationValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("contactInfo").optional().isObject().withMessage("Contact info must be an object"),
  body("submittedDocuments")
    .optional()
    .isArray({ max: 10 })
    .withMessage("At most 10 submitted documents are allowed"),
  body("submittedDocuments.*")
    .optional()
    .isString()
    .withMessage("Each submitted document must be a string"),
];

export const updateOrganizationValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("contactInfo").optional().isObject().withMessage("Contact info must be an object"),
  body("submittedDocuments")
    .optional()
    .isArray({ max: 10 })
    .withMessage("At most 10 submitted documents are allowed"),
  body("submittedDocuments.*")
    .optional()
    .isString()
    .withMessage("Each submitted document must be a string"),
];

export const verifyOrganizationValidator = [
  body("decision")
    .isIn(["approved", "rejected", "suspended"])
    .withMessage("Decision must be approved, rejected, or suspended"),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string")
    .bail()
    .trim(),
];
