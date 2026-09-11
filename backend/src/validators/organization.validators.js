import { body } from "express-validator";

export const createOrganizationValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
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
    .withMessage("Name cannot be empty"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
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
    .isIn(["approved", "rejected"])
    .withMessage("Decision must be approved or rejected"),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string")
    .bail()
    .trim(),
];
