import express from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import {
  resourceIdValidator,
  matchIdValidator,
} from "../validators/match.validators.js";

import {
  generateResourceMatches,
  getMatches,
  acceptMatch,
  rejectMatch,
} from "../controllers/matches.controller.js";

const matchRouter = express.Router();

matchRouter.post(
  "/:resourceId/generate",
  authenticate,
  resourceIdValidator,
  validate,
  generateResourceMatches
);

matchRouter.get(
  "/",
  authenticate,
  getMatches
);

matchRouter.put(
  "/:id/accept",
  authenticate,
  matchIdValidator,
  validate,
  acceptMatch
);

matchRouter.put(
  "/:id/reject",
  authenticate,
  matchIdValidator,
  validate,
  rejectMatch
);

export default matchRouter;
































/*import express from "express";

const matchRouter = express.Router();

import{
  generateResourceMatches,
  getMatches,
  acceptMatch,
  rejectMatch,
} from "../controllers/matches.controller.js";

matchRouter.post(
  "/:resourceId/generate",
  generateResourceMatches
);

matchRouter.get("/", getMatches);

matchRouter.put("/:id/accept", acceptMatch);

matchRouter.put("/:id/reject", rejectMatch);


export default matchRouter;*/