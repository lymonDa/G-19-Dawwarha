import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { listUsers, reactivateUser, suspendUser } from "../controllers/admin.controller.js";

const router = Router();
router.use(authenticate, requireRole("admin"));
router.get("/users", listUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/reactivate", reactivateUser);
export default router;