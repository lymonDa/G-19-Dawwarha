import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireOwnership } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import {
  resourceIdValidator,
  createResourceValidator,
  updateResourceValidator,
  updateResourceStatusValidator,
} from "../validators/resource.validators.js";
import {
  getResources,
  getResource,
  createResource,
  loadResource,
  updateResource,
  updateResourceStatus,
  deleteResource,
} from "../controllers/resources.controller.js";

const router = Router();

// ======================================================
// STEP 1: GET /api/resources (Public)
// ======================================================
router.get("/", getResources);

// ======================================================
// GET /api/resources/:id (Public)
// ======================================================
router.get("/:id", resourceIdValidator, validate, loadResource, getResource);

// ======================================================
// STEP 2: POST /api/resources (Authenticated)
// ======================================================
router.post(
  "/",
  authenticate,
  createResourceValidator,
  validate,
  createResource
);

// ======================================================
// STEP 3: PUT /api/resources/:id (Owner or Admin)
// ======================================================
router.put(
  "/:id",
  authenticate,
  resourceIdValidator,
  validate,
  loadResource,
  requireOwnership((req) => req.resource.providerId),
  updateResourceValidator,
  validate,
  updateResource
);

// ======================================================
// STEP 4: PUT /api/resources/:id/status (Owner or Admin)
// ======================================================
router.put(
  "/:id/status",
  authenticate,
  resourceIdValidator,
  validate,
  loadResource,
  requireOwnership((req) => req.resource.providerId),
  updateResourceStatusValidator,
  validate,
  updateResourceStatus
);

// ======================================================
// STEP 5: DELETE /api/resources/:id (Owner or Admin)
// Soft cancellation - triggers transition action: 'cancel'
// Does NOT physically delete the resource from MongoDB.
// ======================================================
router.delete(
  "/:id",
  authenticate,
  resourceIdValidator,
  validate,
  loadResource,
  requireOwnership((req) => req.resource.providerId),
  deleteResource
);

export default router;