import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import {
  categoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validators.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

const router = Router();

// ======================================================
// Public Endpoints
// ======================================================
router.get("/", getCategories);
router.get("/:id", categoryIdValidator, validate, getCategoryById);

// ======================================================
// Admin-Only Write Endpoints
// ======================================================
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  createCategoryValidator,
  validate,
  createCategory
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  categoryIdValidator,
  validate,
  updateCategoryValidator,
  validate,
  updateCategory
);

// Soft Delete (isActive = false)
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  categoryIdValidator,
  validate,
  deleteCategory
);

export default router;
