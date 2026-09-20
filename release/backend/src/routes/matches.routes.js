import express from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import {
  resourceIdValidation,
  matchIdValidation,
} from "../validators/match.validators.js";

import {
  generateResourceMatches,
  getMatchById,
  getMatches,
  acceptMatch,
  rejectMatch,
} from "../controllers/matches.controller.js";

const matchRouter = express.Router();
matchRouter.use(authenticate);

matchRouter.post(
  "/:resourceId/generate",
  resourceIdValidation,
  validate,
  generateResourceMatches
);

matchRouter.get(
  "/",
  getMatches
);

matchRouter.get(
  "/:id",
  matchIdValidation,
  validate,
  getMatchById
);

matchRouter.put(
  "/:id/accept",
  matchIdValidation,
  validate,
  acceptMatch
);

matchRouter.put(
  "/:id/reject",
  matchIdValidation,
  validate,
  rejectMatch
);

export default matchRouter;
