import mongoose from "mongoose";
import matchModel from "../models/Match.js";
import requestModel from "../models/Request.js";
import  Resource from "../models/Resource.js";
import Handover from "../models/Handover.js";
import { generateMatches } from "../services/matchingService.js";

const generateResourceMatches = (req, res) => {
  Resource.findById(req.params.resourceId)
    .then((resource) => {
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message: "Resource not found",
          },
        });
      }

      if (
        req.user.role !== "admin" &&
        String(resource.providerId) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to generate matches.",
          },
        });
      }

      return generateMatches(req.params.resourceId);
    })
    .then((data) => {
      if (data) {
        res.json({
          success: true,
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        error: {
          code: "MATCH_ERROR",
          message: err.message,
        },
      });
    });
};

const getMatches = (req, res) => {
  matchModel
    .find({
      $or: [
        { providerId: req.user._id },
        { requesterId: req.user._id },
      ],
    })
    .populate("requestId")
    .populate("resourceId")
    .then((data) => {
      res.json({
        success: true,
        data: data,
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

const acceptMatch = (req, res) => {
  mongoose
    .startSession()
    .then((session) => {
      return session
        .withTransaction(() => {
          return matchModel
            .findById(req.params.id)
            .session(session)
            .then((match) => {
              if (!match) {
                throw new Error("MATCH_NOT_FOUND");
              }

              if (match.status !== "proposed") {
                throw new Error("INVALID_STATUS");
              }

              if (
                req.user.role !== "admin" &&
                String(match.providerId) !== String(req.user._id) &&
                String(match.requesterId) !== String(req.user._id)
              ) {
                throw new Error("FORBIDDEN");
              }

              match.status = "accepted";

              return match.save({ session });
            })
            .then((match) => {
              return requestModel
                .findById(match.requestId)
                .session(session)
                .then((request) => {
                  if (!request) {
                    throw new Error("REQUEST_NOT_FOUND");
                  }

                  request.status = "accepted";

                  return request.save({ session });
                })
                .then(() => match);
            })
            .then((match) => {
              return Resource.findById(match.resourceId)
                .session(session)
                .then((resource) => {
                  if (!resource) {
                    throw new Error("RESOURCE_NOT_FOUND");
                  }

                  resource.status = "accepted";

                  return resource.save({ session });
                })
                .then(() => match);
            })
            .then((match) => {
              return Handover.create(
                [
                  {
                    matchId: match._id,
                    resourceId: match.resourceId,
                    requestId: match.requestId,
                    providerId: match.providerId,
                    seekerId: match.requesterId,
                    status: "in_progress",
                  },
                ],
                { session }
              ).then(() => match);
            });
        })
        .then((match) => {
          res.json({
            success: true,
            data: match,
          });
        })
        .catch((err) => {
          if (err.message === "MATCH_NOT_FOUND") {
            return res.status(404).json({
              success: false,
              error: {
                code: "MATCH_NOT_FOUND",
                message: "Match not found",
              },
            });
          }

          if (err.message === "INVALID_STATUS") {
            return res.status(409).json({
              success: false,
              error: {
                code: "INVALID_STATUS",
                message: "This match is no longer pending.",
              },
            });
          }

          if (err.message === "FORBIDDEN") {
            return res.status(403).json({
              success: false,
              error: {
                code: "FORBIDDEN",
                message: "You don't have permission to accept this match.",
              },
            });
          }

          if (err.message === "REQUEST_NOT_FOUND") {
            return res.status(404).json({
              success: false,
              error: {
                code: "REQUEST_NOT_FOUND",
                message: "Request not found.",
              },
            });
          }

          if (err.message === "RESOURCE_NOT_FOUND") {
            return res.status(404).json({
              success: false,
              error: {
                code: "RESOURCE_NOT_FOUND",
                message: "Resource not found.",
              },
            });
          }

          return res.status(409).json({
            success: false,
            error: {
              code: "ACCEPT_ERROR",
              message: err.message,
            },
          });
        })
        .finally(() => {
          session.endSession();
        });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: {
          code: "SESSION_ERROR",
          message: err.message,
        },
      });
    });
};

const rejectMatch = (req, res) => {
  matchModel
    .findById(req.params.id)
    .then((match) => {
      if (!match) {
        return res.status(404).json({
          success: false,
          error: {
            code: "MATCH_NOT_FOUND",
            message: "Match not found",
          },
        });
      }

      if (match.status !== "proposed") {
        return res.status(409).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "This match is no longer pending.",
          },
        });
      }

      if (
        req.user.role !== "admin" &&
        String(match.providerId) !== String(req.user._id) &&
        String(match.requesterId) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to reject this match.",
          },
        });
      }

      match.status = "rejected";

      return match.save();
    })
    .then((data) => {
      if (data) {
        res.json({
          success: true,
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        error: {
          code: "REJECT_ERROR",
          message: err.message,
        },
      });
    });
};

export {
  generateResourceMatches,
  getMatches,
  acceptMatch,
  rejectMatch,
};