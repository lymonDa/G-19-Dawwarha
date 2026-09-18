import mongoose from "mongoose";
import matchModel from "../models/Match.js";
import requestModel from "../models/Request.js";
import Resource from "../models/Resource.js";
import {
  generateMatches,
  acceptMatch as serviceAcceptMatch,
  rejectMatch as serviceRejectMatch,
} from "../services/matchingService.js";
import isValidObjectId from "../utils/objectId.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

const generateResourceMatches = async (req, res) => {
  try {
    const { resourceId } = req.params;

    if (!isValidObjectId(resourceId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid resource ID",
        },
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(resource.providerId) === String(req.user._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to generate matches.",
        },
      });
    }

    if (resource.status !== "available" && resource.status !== "published") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Resource is not available for matching",
        },
      });
    }

    const data = await generateMatches(resourceId);
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 409).json({
      success: false,
      error: {
        code: err.code || "MATCH_ERROR",
        message: err.message,
      },
    });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid match ID" },
      });
    }

    const match = await matchModel
      .findById(id)
      .populate("requestId")
      .populate("resourceId");

    if (!match) {
      return res.status(404).json({
        success: false,
        error: { code: "MATCH_NOT_FOUND", message: "Match not found" },
      });
    }

    // Enforce participant or admin access
    const isAdmin = req.user.role === "admin";
    const isProvider = String(match.providerId) === String(req.user._id);
    const isRequester = String(match.requesterId) === String(req.user._id);

    if (!isAdmin && !isProvider && !isRequester) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to view this match.",
        },
      });
    }

    return res.json({
      success: true,
      data: match,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: err.message },
    });
  }
};

const getMatches = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    const isAdmin = req.user.role === "admin";
    const wantsAll = req.query.all === "true" || req.query.view === "all";

    if (!isAdmin || !wantsAll) {
      filter.$or = [
        { providerId: req.user._id },
        { requesterId: req.user._id },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [data, total] = await Promise.all([
      matchModel
        .find(filter)
        .populate("requestId")
        .populate("resourceId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      matchModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        count: data.length,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err.message,
      },
    });
  }
};

const acceptMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await serviceAcceptMatch(id, req.user);
    return res.json({
      success: true,
      data: {
        match: result.match,
        handoverId: result.handoverId,
      },
    });
  } catch (err) {
    const statusCode = err.statusCode || 409;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || "ACCEPT_ERROR",
        message: err.message,
      },
    });
  }
};

const rejectMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await serviceRejectMatch(id, req.user);
    return res.json({
      success: true,
      data: match,
    });
  } catch (err) {
    const statusCode = err.statusCode || 409;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || "REJECT_ERROR",
        message: err.message,
      },
    });
  }
};

export {
  generateResourceMatches,
  getMatchById,
  getMatches,
  acceptMatch,
  rejectMatch,
};