import Handover from "../models/Handover.js";
import handoverService from "../services/handoverService.js";
import { isValidObjectId } from "../utils/objectId.js";

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

    const result = await handoverService.confirm(handover._id, side, req.user._id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
