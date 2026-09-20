import Category from "../models/Category.js";
import isValidObjectId from "../utils/objectId.js";

/**
 * GET /api/categories (Public)
 * Retrieve categories. Defaults to active categories for public browsing.
 * Supports ?isActive=true|false|all
 */
export async function getCategories(req, res, next) {
  try {
    const filter = {};

    if (req.query.isActive === "false") {
      filter.isActive = false;
    } else if (req.query.isActive === "all" || req.query.all === "true") {
      // no isActive filter - return all categories
    } else {
      // default: active categories only
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/categories/:id (Public)
 * Retrieve a single category by ID
 */
export async function getCategoryById(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid category ID format." },
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/categories (Admin Only)
 * Create a new taxonomy category
 */
export async function createCategory(req, res, next) {
  try {
    const { name, slug, description, isActive } = req.body;

    const trimmedName = name.trim();
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Category with this name already exists.",
        },
      });
    }

    const category = await Category.create({
      name: trimmedName,
      slug: slug ? slug.trim().toLowerCase() : undefined,
      description: description ? description.trim() : "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Category with this name or slug already exists.",
        },
      });
    }
    return next(error);
  }
}

/**
 * PUT /api/categories/:id (Admin Only)
 * Update allowed category fields
 */
export async function updateCategory(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid category ID format." },
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    if (req.body.name) {
      const trimmedName = req.body.name.trim();
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: {
            code: "DUPLICATE_RESOURCE",
            message: "Category with this name already exists.",
          },
        });
      }

      category.name = trimmedName;
      if (!req.body.slug) {
        category.slug = trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    }

    if (req.body.slug) {
      category.slug = req.body.slug.trim().toLowerCase();
    }

    if (req.body.description !== undefined) {
      category.description = req.body.description.trim();
    }

    if (req.body.isActive !== undefined) {
      category.isActive = Boolean(req.body.isActive);
    }

    const updated = await category.save();

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Category with this name or slug already exists.",
        },
      });
    }
    return next(error);
  }
}

/**
 * DELETE /api/categories/:id (Admin Only)
 * CRITICAL SOFT DELETE: Deactivates category by setting isActive = false.
 * NEVER physically deletes the document from MongoDB.
 */
export async function deleteCategory(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid category ID format." },
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    // Soft delete only — never hard delete
    category.isActive = false;
    const updated = await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
