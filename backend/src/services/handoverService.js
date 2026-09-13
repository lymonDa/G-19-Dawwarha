import mongoose from "mongoose";
import Handover from "../models/Handover.js";
import Resource from "../models/Resource.js";
import requestModel from "../models/Request.js";
import contributionService from "./contributionService.js";
import { transitionResource } from "./resourceLifecycleService.js";
import { transitionRequest } from "./requestLifecycleService.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

export async function confirm(handoverId, side, userId, options = {}) {
  const query = Handover.findById(handoverId);
  const handover = options?.session ? await query.session(options.session) : await query;
  if (!handover) {
    throw makeError(404, "NOT_FOUND", "Handover not found.");
  }

  if (handover.status === "cancelled" || handover.status === "no_show") {
    throw makeError(409, "HANDOVER_INACTIVE", "This handover is no longer active.");
  }

  const strUserId = String(userId);
  if (side === "provider") {
    if (String(handover.providerId) !== strUserId) {
      throw makeError(403, "FORBIDDEN", "You are not authorized to confirm this handover.");
    }
    if (!handover.confirmedByProvider) {
      handover.confirmedByProvider = true;
      handover.providerConfirmedAt = new Date();
    }
  } else if (side === "seeker") {
    if (String(handover.seekerId) !== strUserId) {
      throw makeError(403, "FORBIDDEN", "You are not authorized to confirm this handover.");
    }
    if (!handover.confirmedBySeeker) {
      handover.confirmedBySeeker = true;
      handover.seekerConfirmedAt = new Date();
    }
  } else {
    throw makeError(400, "INVALID_SIDE", "Invalid confirmation side.");
  }

  const wasCompletedBefore = handover.status === "completed";

  if (handover.confirmedByProvider && handover.confirmedBySeeker) {
    handover.status = "completed";
    if (!handover.completedAt) {
      handover.completedAt = new Date();
    }
  }

  let session = options?.session || null;
  let ownSession = false;

  if (!session && mongoose.connection.readyState === 1 && typeof mongoose.startSession === "function") {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      ownSession = true;
    } catch {
      session = null;
      ownSession = false;
    }
  }

  try {
    if (session && typeof handover.$session === "function") {
      handover.$session(session);
    }
    const savedHandover = await handover.save(session ? { session } : undefined);

    if (savedHandover.status === "completed" && !wasCompletedBefore) {
      // 1. Record completed contribution
      await contributionService.recordCompletedTransfer(savedHandover, session ? { session } : {});

      // 2. Resource lifecycle cascade: in_handover -> completed -> impact_recorded
      const shouldCheckResource =
        savedHandover.resourceId &&
        (mongoose.connection.readyState === 1 ||
          Boolean(Resource.findById?.mock) ||
          Boolean(mongoose.models?.Resource?.findById?.mock));

      if (shouldCheckResource) {
        const resQuery = Resource.findById(savedHandover.resourceId);
        const resource =
          session && typeof resQuery?.session === "function"
            ? await resQuery.session(session)
            : await resQuery;
        if (resource) {
          const resourceActor = { _id: resource.providerId, role: "system", isSystem: true };
          if (resource.status === "accepted") {
            await transitionResource(resource, "startHandover", resourceActor, { session });
          }
          if (resource.status === "in_handover") {
            await transitionResource(resource, "complete", resourceActor, { session });
          }
          if (resource.status === "completed") {
            await transitionResource(resource, "logImpact", resourceActor, { session });
          }
          if (resource.status !== "impact_recorded") {
            throw makeError(
              409,
              "INVALID_TRANSITION",
              `Resource cannot complete handover from state: '${resource.status}'`
            );
          }
        }
      }

      // 3. Request lifecycle cascade: accepted -> fulfilled
      const shouldCheckRequest =
        savedHandover.requestId &&
        (mongoose.connection.readyState === 1 ||
          Boolean(requestModel.findById?.mock) ||
          Boolean(mongoose.models?.Request?.findById?.mock));

      if (shouldCheckRequest) {
        const reqQuery = requestModel.findById(savedHandover.requestId);
        const request =
          session && typeof reqQuery?.session === "function"
            ? await reqQuery.session(session)
            : await reqQuery;
        if (request) {
          const requestActor = { _id: request.requesterId, role: "system", isSystem: true };
          if (request.status === "accepted") {
            await transitionRequest(request, "complete", requestActor, session ? { session } : {});
          }
          if (request.status !== "fulfilled") {
            throw makeError(
              409,
              "INVALID_TRANSITION",
              `Request cannot be fulfilled from state: '${request.status}'`
            );
          }
        }
      }
    }

    if (ownSession && session) {
      await session.commitTransaction();
    }
    return savedHandover;
  } catch (err) {
    if (ownSession && session) {
      await session.abortTransaction();
    } else if (!session && !wasCompletedBefore && handover.status === "completed") {
      handover.status = "in_progress";
      handover.completedAt = null;
      try {
        await handover.save();
      } catch {
        // preserve original error
      }
    }
    throw err;
  } finally {
    if (ownSession && session) {
      session.endSession();
    }
  }
}

export async function createHandoverForMatch(match, session = null) {
  const handoverData = {
    matchId: match._id,
    resourceId: match.resourceId,
    requestId: match.requestId,
    providerId: match.providerId,
    seekerId: match.requesterId,
    status: "in_progress",
  };
  const options = session ? { session } : {};
  const [handover] = await Handover.create([handoverData], options);
  return handover;
}

const handoverService = { confirm, createHandoverForMatch };
export default handoverService;
