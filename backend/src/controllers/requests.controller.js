import requestModel from "../models/Request.js";
import Category from "../models/Category.js";
import Organization from "../models/Organization.js";
import isValidObjectId from "../utils/objectId.js";
import { transitionRequest } from "../services/requestLifecycleService.js";

const isOwnerOrAdmin = (request, user) => {
  return (
    user.role === "admin" ||
    String(request.requesterId) === String(user._id)
  );
};

// GET /api/requests
const getRequests = (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }

  if (req.query.city) {
    filter["location.city"] = req.query.city;
  }

  requestModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .then((data) => {
      res.json({
        success: true,
        data: data,
        pagination: {
          page,
          limit,
          count: data.length,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: err.message,
        },
      });
    });
};

// GET /api/requests/:id
const getRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Request not found",
          },
        });
      }

      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: err.message,
        },
      });
    });
};

// POST /api/requests
const addRequest = async (req, res) => {
  try {
    const { categoryId, quantity, urgency, location, description, requesterOrgId } = req.body;

    if (!categoryId || !isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category not found or inactive",
        },
      });
    }

    const cat = await Category.findById(categoryId);
    if (!cat || !cat.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category not found or inactive",
        },
      });
    }

    let verifiedOrgId = null;
    if (requesterOrgId) {
      if (!isValidObjectId(requesterOrgId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid organization ID format",
          },
        });
      }
      const org = await Organization.findById(requesterOrgId);
      if (!org) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Organization not found",
          },
        });
      }
      const isOwner = String(org.ownerUserId) === String(req.user._id) || req.user.role === "admin";
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not belong to or own this organization",
          },
        });
      }
      const isApproved = org.verification?.status === "approved";
      if (!isApproved) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Organization is not approved to make requests",
          },
        });
      }
      verifiedOrgId = org._id;
    }

    const request = new requestModel({
      requesterId: req.user._id,
      requesterOrgId: verifiedOrgId,
      categoryId,
      quantity,
      urgency,
      location,
      description,
      status: "draft",
    });

    const data = await request.save();
    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
      },
    });
  }
};

// PUT /api/requests/:id
const updateRequest = async (req, res) => {
  try {
    const request = await requestModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message: "Request not found",
        },
      });
    }

    if (!isOwnerOrAdmin(request, req.user)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to update this request.",
        },
      });
    }

    if (
      request.status === "accepted" ||
      request.status === "fulfilled" ||
      request.status === "cancelled" ||
      request.status === "expired"
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "This request cannot be updated anymore.",
        },
      });
    }

    if (req.body.categoryId !== undefined) {
      if (!isValidObjectId(req.body.categoryId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category not found or inactive",
          },
        });
      }
      const cat = await Category.findById(req.body.categoryId);
      if (!cat || !cat.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category not found or inactive",
          },
        });
      }
      request.categoryId = req.body.categoryId;
    }

    if (req.body.requesterOrgId !== undefined) {
      if (req.body.requesterOrgId === null) {
        request.requesterOrgId = null;
      } else {
        if (!isValidObjectId(req.body.requesterOrgId)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid organization ID format",
            },
          });
        }
        const org = await Organization.findById(req.body.requesterOrgId);
        if (!org) {
          return res.status(404).json({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Organization not found",
            },
          });
        }
        const isOwner = String(org.ownerUserId) === String(req.user._id) || req.user.role === "admin";
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not belong to or own this organization",
            },
          });
        }
        const isApproved = org.verification?.status === "approved";
        if (!isApproved) {
          return res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Organization is not approved to make requests",
            },
          });
        }
        request.requesterOrgId = org._id;
      }
    }

    if (req.body.quantity !== undefined) {
      request.quantity = req.body.quantity;
    }

    if (req.body.urgency !== undefined) {
      request.urgency = req.body.urgency;
    }

    if (req.body.location !== undefined) {
      request.location = req.body.location;
    }

    if (req.body.description !== undefined) {
      request.description = req.body.description;
    }

    const data = await request.save();
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ERROR",
        message: err.message,
      },
    });
  }
};


// PUT /api/requests/:id/status
const changeRequestStatus = async (req, res) => {
  try {
    const request = await requestModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message: "Request not found",
        },
      });
    }

    if (!isOwnerOrAdmin(request, req.user)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to change this request.",
        },
      });
    }

    const data = await transitionRequest(
      request,
      req.body.action,
      req.user
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    const statusCode = err.statusCode || 409;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || "INVALID_TRANSITION",
        message: err.message,
      },
    });
  }
};

// DELETE /api/requests/:id
const deleteRequest = async (req, res) => {
  try {
    const request = await requestModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message: "Request not found",
        },
      });
    }

    if (!isOwnerOrAdmin(request, req.user)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to cancel this request.",
        },
      });
    }

    const data = await transitionRequest(
      request,
      "cancel",
      req.user
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    const statusCode = err.statusCode || 409;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || "INVALID_TRANSITION",
        message: err.message,
      },
    });
  }
};


export {
  getRequests,
  getRequest,
  addRequest,
  updateRequest,
  changeRequestStatus,
  deleteRequest,
};