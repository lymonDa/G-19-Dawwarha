import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import {
  createReportValidator,
  resolveReportValidator,
} from "../validators/report.validators.js";
import {
  create,
<<<<<<< HEAD
=======
  getMyReports,
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  list,
  resolve,
} from "../controllers/reports.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createReportValidator,
  validate,
  create
);

<<<<<<< HEAD
=======
// GET /api/reports/me - Authenticated user retrieves their own submitted reports
router.get(
  "/me",
  authenticate,
  getMyReports
);

>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
router.get(
  "/",
  authenticate,
  requireRole("admin"),
  list
);

router.put(
  "/:id/resolve",
  authenticate,
  requireRole("admin"),
  resolveReportValidator,
  validate,
  resolve
);

export default router;
