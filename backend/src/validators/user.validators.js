import { body } from "express-validator";

const addressFields = ["street", "city", "area", "country"];

export const updateUserValidator = [
  body("name").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("location").optional().isObject().withMessage("Location must be an object"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  ...addressFields.map((field) => body(`address.${field}`).optional().isString().withMessage(`Address ${field} must be a string`)),
  body("contactInfo").optional().isObject().withMessage("Contact info must be an object"),
  body("contactInfo.phone").optional().isString().isLength({ max: 30 }).withMessage("Phone must be at most 30 characters"),
  body("contactInfo.alternateEmail").optional().isEmail().withMessage("Alternate email must be valid"),
];