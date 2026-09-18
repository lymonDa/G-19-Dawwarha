import { Router } from "express";
import * as controller from "../controllers/organizations.controller.js";
import Organization from "../models/Organization.js";
import authenticate from "../middleware/authenticate.js";
import { requireOwnership, requireRole } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createOrganizationValidator, organizationIdValidator, updateOrganizationValidator, verifyOrganizationValidator } from "../validators/organization.validators.js";

const router = Router();
router.post("/", authenticate, createOrganizationValidator, validate, controller.create);
<<<<<<< HEAD
=======
router.get("/mine", authenticate, controller.getMine);
router.get("/", controller.list);
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
router.get("/:id", organizationIdValidator, validate, controller.getById);
router.put("/:id", authenticate, organizationIdValidator, validate, requireOwnership(async (req) => (await Organization.findById(req.params.id))?.ownerUserId), updateOrganizationValidator, validate, controller.update);
router.post("/:id/verify", authenticate, requireRole("admin"), organizationIdValidator, validate, verifyOrganizationValidator, validate, controller.verify);
export default router;