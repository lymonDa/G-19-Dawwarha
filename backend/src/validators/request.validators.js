import { body, param } from "express-validator";

export const createRequestValidation = [
  body("categoryId")
    .notEmpty()
    .withMessage("categoryId is required"),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isNumeric()
    .withMessage("quantity must be a number")
    .custom((value) => value > 0)
    .withMessage("quantity must be greater than 0"),

  body("urgency")
    .notEmpty()
    .withMessage("urgency is required")
    .isIn(["low", "medium", "high"])
    .withMessage("urgency must be low, medium, or high"),

  body("location.city")
    .notEmpty()
    .withMessage("city is required"),

  body("location.area")
    .optional()
    .isString()
    .withMessage("area must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .isLength({ max: 500 })
    .withMessage("description cannot exceed 500 characters"),
];

export const requestIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid request id"),
];