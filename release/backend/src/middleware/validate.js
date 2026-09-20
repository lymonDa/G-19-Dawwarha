import { validationResult } from "express-validator";

export default function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: result.array()[0].msg },
    });
  }
  return next();
}