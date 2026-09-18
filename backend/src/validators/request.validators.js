import { body, param } from "express-validator";
import Category from "../models/Category.js";
import isValidObjectId from "../utils/objectId.js";

export const createRequestValidation = [
  body("categoryId")
    .notEmpty()
    .withMessage("categoryId is required")
    .custom(async (val) => {
      if (!isValidObjectId(val)) {
        throw new Error("Category not found or inactive");
      }
      const cat = await Category.findById(val);
      if (!cat || !cat.isActive) {
        throw new Error("Category not found or inactive");
      }
      return true;
    }),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isNumeric()
    .withMessage("quantity must be a number")
    .custom((value) => Number(value) > 0)
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

  body("requesterOrgId")
    .optional({ nullable: true })
    .custom((val) => {
      if (val !== null && val !== undefined && val !== "" && !isValidObjectId(val)) {
        throw new Error("Invalid organization ID format");
      }
      return true;
    }),
];

export const updateRequestValidation = [
  body("categoryId")
    .optional()
    .custom(async (val) => {
      if (!isValidObjectId(val)) {
        throw new Error("Category not found or inactive");
      }
      const cat = await Category.findById(val);
      if (!cat || !cat.isActive) {
        throw new Error("Category not found or inactive");
      }
      return true;
    }),

  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("quantity must be a number")
    .custom((value) => Number(value) > 0)
    .withMessage("quantity must be greater than 0"),

  body("urgency")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("urgency must be low, medium, or high"),

  body("location.city")
    .optional()
    .notEmpty()
    .withMessage("city cannot be empty"),

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

  body("requesterOrgId")
    .optional({ nullable: true })
    .custom((val) => {
      if (val !== null && val !== undefined && val !== "" && !isValidObjectId(val)) {
        throw new Error("Invalid organization ID format");
      }
      return true;
    }),

  body("status")
    .custom((val) => {
      if (val !== undefined) {
        throw new Error("Direct status mutation is forbidden. Use lifecycle transitions.");
      }
      return true;
    }),
];

export const requestIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid request id"),
];