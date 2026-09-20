import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { listUsers, reactivateUser, suspendUser } from "../controllers/admin.controller.js";
import validate from "../middleware/validate.js";
import { userIdValidator } from "../validators/admin.validators.js";

const router = Router();
router.use(authenticate, requireRole("admin"));
router.get("/users", listUsers);
router.put("/users/:id/suspend", userIdValidator, validate, suspendUser);
router.put("/users/:id/reactivate", userIdValidator, validate, reactivateUser);
export default router;