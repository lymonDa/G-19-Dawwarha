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
