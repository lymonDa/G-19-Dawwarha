import { body, param } from "express-validator";
import Category from "../models/Category.js";

export const resourceIdValidator = [
  param("id").isMongoId().withMessage("Invalid resource ID format"),
];

export const createResourceValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0"),

  body("categoryId")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .bail()
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category || !category.isActive) {
        throw new Error("Category not found or inactive");
      }
      return true;
    }),

  body("location")
    .isObject()
    .withMessage("Location must be an object"),

  body("location.city")
    .isString()
    .withMessage("City must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("location.area")
    .optional()
    .isString()
    .withMessage("Area must be a string")
    .trim(),

  body("availabilityWindow")
    .isObject()
    .withMessage("Availability window must be an object"),

  body("availabilityWindow.start")
    .notEmpty()
    .withMessage("Availability start date is required")
    .bail()
    .isISO8601()
    .withMessage("Availability start date must be a valid date"),

  body("availabilityWindow.end")
    .notEmpty()
    .withMessage("Availability end date is required")
    .bail()
    .isISO8601()
    .withMessage("Availability end date must be a valid date")
    .bail()
    .custom((value, { req }) => {
      const start = req.body?.availabilityWindow?.start;
      if (start && new Date(value) <= new Date(start)) {
        throw new Error("Availability end date must be after start date");
      }
      return true;
    }),

  body("providerOrgId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid organization ID format"),

  body("safetyDisclosure")
    .optional({ nullable: true })
    .isString()
    .withMessage("Safety disclosure must be a string")
    .trim(),
];

export const updateResourceValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("quantity")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0"),

  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .bail()
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category || !category.isActive) {
        throw new Error("Category not found or inactive");
      }
      return true;
    }),

  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),

  body("location.city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),

  body("location.area")
    .optional()
    .isString()
    .withMessage("Area must be a string")
    .trim(),

  body("availabilityWindow")
    .optional()
    .isObject()
    .withMessage("Availability window must be an object"),

  body("availabilityWindow.start")
    .optional()
    .isISO8601()
    .withMessage("Availability start date must be a valid date"),

  body("availabilityWindow.end")
    .optional()
    .isISO8601()
    .withMessage("Availability end date must be a valid date")
    .bail()
    .custom((value, { req }) => {
      const start = req.body?.availabilityWindow?.start;
      if (start && new Date(value) <= new Date(start)) {
        throw new Error("Availability end date must be after start date");
      }
      return true;
    }),

  body("safetyDisclosure")
    .optional({ nullable: true })
    .isString()
    .withMessage("Safety disclosure must be a string")
    .trim(),
];

export const updateResourceStatusValidator = [
  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .bail()
    .isString()
    .withMessage("Action must be a string")
    .bail()
    .isIn(["publish", "markAvailable", "markUnavailable", "cancel", "reopen"])
    .withMessage("Invalid action"),
];
