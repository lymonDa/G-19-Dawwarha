import { body, param } from "express-validator";

export const categoryIdValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

export const createCategoryValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("slug")
    .optional()
    .isString()
    .withMessage("Slug must be a string")
    .bail()
    .trim()
    .toLowerCase(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateCategoryValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("slug")
    .optional()
    .isString()
    .withMessage("Slug must be a string")
    .bail()
    .trim()
    .toLowerCase(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export default {
  categoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
};
