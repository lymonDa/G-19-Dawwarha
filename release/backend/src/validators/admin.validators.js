import { param } from "express-validator";

export const userIdValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];