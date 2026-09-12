import mongoose from "mongoose";

import matchModel from "../models/Match.js";
import requestModel from "../models/Request.js";
import Resource from "../models/Resource.js";
import { buildResourceQuery } from "../utils/resourceQueryBuilder.js";
import { transitionResource } from "./resourceLifecycleService.js";
import { transitionRequest } from "./requestLifecycleService.js";
import { createHandoverForMatch } from "./handoverService.js";
import isValidObjectId from "../utils/objectId.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

// Weights per Product Brief Section 12
const W1 = 0.30; // category
const W2 = 0.20; // location
const W3 = 0.15; // quantity
const W4 = 0.20; // urgency
const W5 = 0.15; // availability

// Minimum score
const MIN_SCORE = 0.50;

/**
 * Calculate explainable weighted match score between a Resource and a Request.
 * Total score = sum(Wi * Si) where sum(Wi) = 1.0.
 *
 * @param {object} resource
 * @param {object} request
 * @returns {{ score: number, scoreBreakdown: object }}
 */
const calculateScore = (resource, request) => {
  let categoryScore = 0;
  let locationScore = 0;
  let quantityScore = 0;
  let urgencyScore = 0;
  let availabilityScore = 0;

  // 1. Category Compatibility (W1 = 0.30)
  if (
    resource.categoryId &&
    request.categoryId &&
    String(resource.categoryId) === String(request.categoryId)
  ) {
    categoryScore = 1.0;
  }

  // 2. Location Proximity (W2 = 0.20)
  if (resource.location && request.location) {
    if (resource.location.city && request.location.city && resource.location.city === request.location.city) {
      locationScore = 0.7;

      if (
        resource.location.area &&
        request.location.area &&
        resource.location.area === request.location.area
      ) {
        locationScore = 1.0;
      }
    }
  }

  // 3. Quantity Compatibility (W3 = 0.15)
  if (
    resource.quantity !== undefined &&
    request.quantity !== undefined &&
    resource.quantity >= request.quantity
  ) {
    quantityScore = 1.0;
  }

  // 4. Urgency Priority (W4 = 0.20)
  if (request.urgency === "high") {
    urgencyScore = 1.0;
  } else if (request.urgency === "medium") {
    urgencyScore = 0.7;
  } else if (request.urgency === "low") {
    urgencyScore = 0.4;
  }

  // 5. Availability Window Evaluation (W5 = 0.15)
  if (resource.availabilityWindow?.start && resource.availabilityWindow?.end) {
    const start = new Date(resource.availabilityWindow.start);
    const end = new Date(resource.availabilityWindow.end);
    const now = new Date();

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start && end >= now) {
      availabilityScore = 1.0;
    } else {
      availabilityScore = 0.0;
    }
  } else if (resource.status === "available" || resource.status === "published") {
    availabilityScore = 1.0;
  }

  const rawScore =
    categoryScore * W1 +
    locationScore * W2 +
    quantityScore * W3 +
    urgencyScore * W4 +
    availabilityScore * W5;

  const score = Math.round(rawScore * 1000) / 1000;

  return {
    score,
    scoreBreakdown: {
      category: categoryScore,
      location: locationScore,
      quantity: quantityScore,
      urgency: urgencyScore,
      availability: availabilityScore,
    },
  };
};

/**
 * Retrieve candidate resources for a need/request using Engineer 2's shared query builder.
 * Shared search/filter query builder integration per Backend Plan Task 2.C & Task 3.B.
 *
 * @param {object} filters
 * @returns {Promise<Array>}
 */
const findCandidateResources = async (filters = {}) => {
  const safeFilter = buildResourceQuery(filters, { defaultStatus: false });
  const Resource = mongoose.model("Resource");
  return Resource.find(safeFilter);
};

/**
 * Generate, score, and persist proposed matches for a given Resource.
 *
 * @param {string|mongoose.Types.ObjectId} resourceId
 * @returns {Promise<Array>} Sorted list of proposed matches
 */
const generateMatches = async (resourceId) => {
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    throw new Error("Invalid resourceId");
  }

  const Resource = mongoose.model("Resource");
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new Error("Resource not found");
  }

  if (resource.status !== "available" && resource.status !== "published") {
    throw new Error("Resource is not available");
  }

  const requests = await requestModel.find({
    status: "published",
    categoryId: resource.categoryId,
  });

  const matches = [];

  for (const request of requests) {
    const result = calculateScore(resource, request);

    if (result.score >= MIN_SCORE) {
      matches.push({
        resourceId: resource._id,
        requestId: request._id,
        providerId: resource.providerId,
        requesterId: request.requesterId,
        score: result.score,
        scoreBreakdown: result.scoreBreakdown,
        status: "proposed",
      });
    }
  }

  const savedMatches = await Promise.all(
    matches.map((match) =>
      matchModel.create(match).catch((err) => {
        if (err.code === 11000) {
          return null;
        }
        throw err;
      })
    )
  );

  return savedMatches
    .filter((match) => match !== null)
    .sort((a, b) => b.score - a.score);
};

/**
 * Accept a proposed match in a MongoDB transaction.
 * Transitions match -> accepted, resource -> accepted, request -> accepted,
 * and creates a Handover record via handoverService.
 *
 * @param {string} matchId
 * @param {object} actingUser
 * @returns {Promise<{ match: object, handoverId: string, handover: object }>}
 */
const acceptMatch = async (matchId, actingUser) => {
  if (!isValidObjectId(matchId)) {
    throw makeError(400, "INVALID_ID", "Invalid match ID");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const match = await matchModel.findById(matchId).session(session);
    if (!match) {
      throw makeError(404, "MATCH_NOT_FOUND", "Match not found");
    }

    if (match.status !== "proposed") {
      throw makeError(409, "INVALID_STATUS", "This match is no longer pending.");
    }

    const isAdmin = actingUser.role === "admin";
    const isProvider = String(match.providerId) === String(actingUser._id);
    const isRequester = String(match.requesterId) === String(actingUser._id);

    if (!isAdmin && !isProvider && !isRequester) {
      throw makeError(403, "FORBIDDEN", "You don't have permission to accept this match.");
    }

    const resource = await Resource.findById(match.resourceId).session(session);
    if (!resource) {
      throw makeError(404, "RESOURCE_NOT_FOUND", "Resource not found.");
    }

    const request = await requestModel.findById(match.requestId).session(session);
    if (!request) {
      throw makeError(404, "REQUEST_NOT_FOUND", "Request not found.");
    }

    // 1. Transition Resource via resourceLifecycleService
    if (resource.status === "available" || resource.status === "published") {
      await transitionResource(resource, "match", { role: "system" }, { session });
    }
    const resourceActor = isProvider || isAdmin ? actingUser : { _id: actingUser._id, role: "admin" };
    await transitionResource(resource, "accept", resourceActor, { session });

    // 2. Transition Request via requestLifecycleService
    if (request.status === "published") {
      await transitionRequest(request, "match", { role: "system" }, session);
    }
    const requestActor = isRequester || isAdmin ? actingUser : { _id: actingUser._id, role: "admin" };
    await transitionRequest(request, "accept", requestActor, session);

    // 3. Transition Match status
    match.status = "accepted";
    await match.save({ session });

    // 4. Delegate Handover creation to Engineer 4's handoverService
    const handover = await createHandoverForMatch(match, session);

    await session.commitTransaction();

    return {
      match,
      handoverId: handover._id,
      handover,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Reject a proposed match.
 * Transitions match -> rejected, and releases resource/request if matched.
 *
 * @param {string} matchId
 * @param {object} actingUser
 * @returns {Promise<object>}
 */
const rejectMatch = async (matchId, actingUser) => {
  if (!isValidObjectId(matchId)) {
    throw makeError(400, "INVALID_ID", "Invalid match ID");
  }

  const match = await matchModel.findById(matchId);
  if (!match) {
    throw makeError(404, "MATCH_NOT_FOUND", "Match not found");
  }

  if (match.status !== "proposed") {
    throw makeError(409, "INVALID_STATUS", "This match is no longer pending.");
  }

  const isAdmin = actingUser.role === "admin";
  const isProvider = String(match.providerId) === String(actingUser._id);
  const isRequester = String(match.requesterId) === String(actingUser._id);

  if (!isAdmin && !isProvider && !isRequester) {
    throw makeError(403, "FORBIDDEN", "You don't have permission to reject this match.");
  }

  match.status = "rejected";
  await match.save();

  // Release resource back to available if it was in matched status
  const resource = await Resource.findById(match.resourceId);
  if (resource && resource.status === "matched") {
    try {
      const resourceActor = isProvider || isAdmin ? actingUser : { _id: actingUser._id, role: "admin" };
      await transitionResource(resource, "reject", resourceActor);
    } catch (releaseErr) {
      // Log release error if transition fails
    }
  }

  // Release request back to published if it was in matched status
  const request = await requestModel.findById(match.requestId);
  if (request && request.status === "matched") {
    try {
      const requestActor = isRequester || isAdmin ? actingUser : { _id: actingUser._id, role: "admin" };
      await transitionRequest(request, "reject", requestActor);
    } catch (releaseErr) {
      // Log release error if transition fails
    }
  }

  return match;
};

export {
  calculateScore,
  generateMatches,
  findCandidateResources,
  acceptMatch,
  rejectMatch,
  W1,
  W2,
  W3,
  W4,
  W5,
  MIN_SCORE,
};

export default {
  calculateScore,
  generateMatches,
  findCandidateResources,
  acceptMatch,
  rejectMatch,
};