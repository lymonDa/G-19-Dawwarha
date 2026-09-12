import Resource from "../models/Resource.js";
import Organization from "../models/Organization.js";
import { transitionResource } from "../services/resourceLifecycleService.js";
import { getPagination, buildPagination } from "../utils/pagination.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

/**
 * Middleware: Load resource by ID and attach to req.resource
 */
export async function loadResource(req, res, next) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found." },
      });
    }
    req.resource = resource;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * STEP 1: GET /api/resources (Public)
 * Filter and list browseable resources
 */
export async function getResources(req, res, next) {
  try {
    const { category, city, area, status } = req.query;
    const filter = {};

    // Status filter - default to browsable statuses
    if (status) {
      if (typeof status !== "string") {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_STATUS", message: "Invalid status parameter" },
        });
      }
      filter.status = status;
    } else {
      filter.status = { $in: ["published", "available"] };
    }

    if (category) {
      filter.categoryId = category;
    }

    if (city) {
      filter["location.city"] = city.trim();
    }

    if (area) {
      filter["location.area"] = area.trim();
    }

    const { page, limit, skip } = getPagination(req.query);

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: resources,
      pagination: buildPagination({ page, limit, total }),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/resources/:id (Public)
 * Retrieve a single resource by ID
 */
export function getResource(req, res) {
  return res.status(200).json({
    success: true,
    data: req.resource,
  });
}

/**
 * STEP 2: POST /api/resources (Authenticated)
 * Create a new resource in 'draft' status
 */
export async function createResource(req, res, next) {
  try {
    // If published on behalf of an organization, verify ownership and approved status
    if (req.body.providerOrgId) {
      const org = await Organization.findById(req.body.providerOrgId);
      if (!org) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Provider organization not found." },
        });
      }

      const isOrgOwner = String(org.ownerUserId) === String(req.user._id);
      const isApproved = org.verification?.status === "approved";

      if (!isOrgOwner || !isApproved) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot publish on behalf of an unverified organization or an organization you do not own.",
          },
        });
      }
    }

    const resource = await Resource.create({
      providerId: req.user._id,
      providerOrgId: req.body.providerOrgId || null,
      categoryId: req.body.categoryId,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      quantity: req.body.quantity,
      location: {
        city: req.body.location.city.trim(),
        area: req.body.location.area ? req.body.location.area.trim() : undefined,
      },
      availabilityWindow: {
        start: new Date(req.body.availabilityWindow.start),
        end: new Date(req.body.availabilityWindow.end),
      },
      safetyDisclosure: req.body.safetyDisclosure || null,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * STEP 3: PUT /api/resources/:id (Owner or Admin)
 * Update allowed fields of a non-terminal resource
 */
export async function updateResource(req, res, next) {
  try {
    const resource = req.resource;

    const terminalStates = ["completed", "impact_recorded", "cancelled"];
    if (terminalStates.includes(resource.status)) {
      return res.status(409).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "This listing can no longer be edited",
        },
      });
    }

    const updatableFields = [
      "title",
      "description",
      "quantity",
      "categoryId",
      "location",
      "availabilityWindow",
      "safetyDisclosure",
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    }

    const updated = await resource.save();
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * STEP 4: PUT /api/resources/:id/status (Owner or Admin)
 * Execute a state machine action
 */
export async function updateResourceStatus(req, res, next) {
  try {
    const updated = await transitionResource(
      req.resource,
      req.body.action,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * STEP 5: DELETE /api/resources/:id (Owner or Admin)
 * Soft cancellation using the lifecycle transition service (action: 'cancel').
 * Does NOT hard delete the document from MongoDB.
 */
export async function deleteResource(req, res, next) {
  try {
    const cancelled = await transitionResource(
      req.resource,
      "cancel",
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Resource cancelled successfully",
      data: cancelled,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  loadResource,
  getResources,
  getResource,
  createResource,
  updateResource,
  updateResourceStatus,
  deleteResource,
};