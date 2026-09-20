import { param } from "express-validator";

export const confirmTransactionValidator = [
  param("matchId")
    .isMongoId()
    .withMessage("Invalid match ID"),
];
