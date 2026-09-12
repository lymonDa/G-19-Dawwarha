import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { getMyContributions } from "../controllers/contributions.controller.js";

const router = Router();

// GET /api/users/me/contributions
router.get("/me/contributions", authenticate, getMyContributions);

export default router;
