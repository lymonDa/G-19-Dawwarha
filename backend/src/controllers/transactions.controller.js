import Handover from "../models/Handover.js";
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

    return res.json({ success: true, data: handover });
  } catch (error) {
    return next(error);
  }
}
