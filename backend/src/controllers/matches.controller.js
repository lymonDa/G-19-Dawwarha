import mongoose from "mongoose";

import{ matchModel } from "../models/Match.js";

import{
  generateMatches,
} from "../services/matchingService.js";

const generateResourceMatches = (req, res) => {
  generateMatches(req.params.resourceId)
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        message: err.message,
      });
    });
};

const getMatches = (req, res) => {
  matchModel
    .find({
      $or: [
        {
          providerId: req.user._id,
        },
        {
          requesterId: req.user._id,
        },
      ],
    })
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    });
};

const acceptMatch = (req, res) => {
  matchModel
    .findById(req.params.id)
    .then((match) => {
      if (!match) {
        return res.status(404).json({
          success: false,
          message: "Match not found",
        });
      }

      if (match.status !== "proposed") {
        return res.status(409).json({
          success: false,
          message: "This match is no longer pending",
        });
      }

      if (
        String(match.providerId) !==
          String(req.user._id) &&
        String(match.requesterId) !==
          String(req.user._id) &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission",
        });
      }

      match.status = "accepted";

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
        message: err.message,
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
          message: "Match not found",
        });
      }

      if (match.status !== "proposed") {
        return res.status(409).json({
          success: false,
          message: "This match is no longer pending",
        });
      }

      if (
        String(match.providerId) !==
          String(req.user._id) &&
        String(match.requesterId) !==
          String(req.user._id) &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission",
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
        message: err.message,
      });
    });
};

export{
  generateResourceMatches,
  getMatches,
  acceptMatch,
  rejectMatch,
};