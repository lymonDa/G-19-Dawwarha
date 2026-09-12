import Handover from "../models/Handover.js";
import contributionService from "./contributionService.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

export async function confirm(handoverId, side, userId) {
  const handover = await Handover.findById(handoverId);
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

  const savedHandover = await handover.save();

  if (savedHandover.status === "completed" && !wasCompletedBefore) {
    await contributionService.recordCompletedTransfer(savedHandover);
  }

  return savedHandover;
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


