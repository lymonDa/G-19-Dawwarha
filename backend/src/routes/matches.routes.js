import express from "express";

const matchRouter = express.Router();

import{
  generateResourceMatches,
  getMatches,
  acceptMatch,
  rejectMatch,
} from "../controllers/matches.controller.js";
import validate from "../middleware/validate.js";
import { generateMatchValidation, matchIdValidation } from "../validators/match.validators.js";

matchRouter.post(
  "/:resourceId/generate", generateMatchValidation, validate,
  generateResourceMatches
);

matchRouter.get("/", getMatches);

matchRouter.put("/:id/accept", matchIdValidation, validate, acceptMatch);

matchRouter.put("/:id/reject", matchIdValidation, validate, rejectMatch);


export default matchRouter;