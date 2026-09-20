import Handover from "../models/Handover.js";
import handoverService from "../services/handoverService.js";
import { isValidObjectId } from "../utils/objectId.js";

/**
 * GET /api/transactions/:matchId
 * Retrieves the handover record associated with a given match.
 * Access restricted to match participants (provider or seeker) and admins.
 */
export async function getHandoverByMatch(req, res, next) {
  try {
    const { matchId } = req.params;

    if (!isValidObjectId(matchId)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid match ID" },
      });
    }

    const handover = await Handover.findOne({ matchId });

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "No handover found for this match" },
      });
    }

    // Enforce participant-only access (provider, seeker, or admin)
    const userId = req.user?._id ? String(req.user._id) : null;
    const isAdmin = req.user?.role === "admin";
    const isProvider = userId && String(handover.providerId) === userId;
    const isSeeker = userId && String(handover.seekerId) === userId;

    if (!isAdmin && !isProvider && !isSeeker) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this handover",
        },
      });
    }

    return res.json({
      success: true,
      data: handover,
    });
  } catch (error) {
    return next(error);
  }
}

export async function confirm(req, res, next) {
  try {
    const { matchId } = req.params;

    if (!isValidObjectId(matchId)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid match ID" },
      });
    }

    const handover = await Handover.findOne({ matchId });

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "No handover found for this match" },
      });
    }

    const userId = req.user?._id ? String(req.user._id) : null;
    let side;

    if (userId && String(handover.providerId) === userId) {
      side = "provider";
    } else if (userId && String(handover.seekerId) === userId) {
      side = "seeker";
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this handover",
        },
      });
    }

    const updatedHandover = await handoverService.confirm(handover._id, side, req.user._id);

    console.info(
      JSON.stringify({
        event: "HANDOVER_CONFIRMATION",
        userId,
        handoverId: handover._id,
        matchId,
        side,
        timestamp: new Date().toISOString(),
      })
    );

    const bothConfirmed = Boolean(
      updatedHandover.confirmedByProvider &&
      updatedHandover.confirmedBySeeker
    );

    return res.json({
      success: true,
      data: {
        status: updatedHandover.status,
        bothConfirmed,
      },
    });
  } catch (error) {
    return next(error);
  }
}
