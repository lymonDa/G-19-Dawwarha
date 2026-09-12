import { param } from'express-validator';

export const generateMatchValidation = [
  param('resourceId')
    .isMongoId()
    .withMessage('Invalid Resource ObjectId format')
];

export const matchIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Match ObjectId format')
];