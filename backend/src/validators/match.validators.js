import { param } from "express-validator";

export const resourceIdValidator = [
  param("resourceId")
    .isMongoId()
    .withMessage("Invalid resource id"),
];

export const matchIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid match id"),
];



















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