import { body, param } from 'express-validator';

export const createRequestValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid Category ObjectId format'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Urgency must be one of: low, medium, high, critical'),
  body('requesterOrgId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Organization ObjectId format')
];

export const updateRequestValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Request ObjectId format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Urgency must be one of: low, medium, high, critical')
];

export const changeStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Request ObjectId format'),
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isString()
    .withMessage('Action must be a valid string')
];