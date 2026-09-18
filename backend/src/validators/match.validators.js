import { param } from "express-validator";

export const matchIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid match ID")
];

export const resourceIdValidation = [
  param("resourceId")
    .isMongoId()
    .withMessage("Invalid resource ID")
];

// Aliases for compatibility
export const matchIdValidator = matchIdValidation;
export const resourceIdValidator = resourceIdValidation;

















/*import { param } from'express-validator';

export const generateMatchValidation = [
  param('resourceId')
    .isMongoId()
    .withMessage('Invalid Resource ObjectId format')
];

export const matchIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Match ObjectId format')
];*/