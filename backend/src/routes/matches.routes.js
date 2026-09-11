import express from "express";

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


export default matchRouter;