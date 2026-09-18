import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { getAnalytics } from "../controllers/adminAnalytics.controller.js";

const router = Router();

// GET /api/admin/analytics — admin-only, read-only
router.get("/", authenticate, requireRole("admin"), getAnalytics);

export default router;
