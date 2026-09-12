import Resource from "../models/Resource.js";
import Organization from "../models/Organization.js";
import { transitionResource } from "../services/resourceLifecycleService.js";
import { getPagination, buildPagination } from "../utils/pagination.js";
import isValidObjectId from "../utils/objectId.js";
import { buildResourceQuery } from "../utils/resourceQueryBuilder.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

/**
 * Middleware: Load resource by ID and attach to req.resource
 */
export async function loadResource(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid resource ID format." },
      });
    }

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
 * Filter and list browseable resources using the shared query builder
 */
export async function getResources(req, res, next) {
  try {
    const filter = buildResourceQuery(req.query);
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
    const orgId = req.body.providerOrgId || req.body.organizationId;
    if (orgId) {
      if (!isValidObjectId(orgId)) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_ID", message: "Invalid organization ID format." },
        });
      }

      const org = await Organization.findById(orgId);
      if (!org) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Provider organization not found." },
        });
      }

      const isOrgOwner = String(org.ownerUserId) === String(req.user._id);
      const isApproved =
        org.verification?.status === "approved" ||
        org.status === "approved" ||
        org.status === "verified";

      if (!isOrgOwner || !isApproved) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Cannot publish on behalf of an unverified organization or an organization you do not own.",
          },
        });
      }
    }

    const resource = await Resource.create({
      providerId: req.user._id,
      providerOrgId: orgId || null,
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

    if (req.body.status !== undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: "DIRECT_STATUS_UPDATE_FORBIDDEN",
          message: "Status cannot be updated directly. Use lifecycle transition endpoints.",
        },
      });
    }

    const terminalStates = ["completed", "impact_recorded", "cancelled", "expired"];
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