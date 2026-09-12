import contributionService from "../services/contributionService.js";

/**
 * Handles GET /api/users/me/contributions
 * Retrieves the authenticated user's own contribution history.
 * Identity is derived strictly from req.user._id (spoofing via query/body is rejected).
 */
export async function getMyContributions(req, res, next) {
  try {
    const userId = req.user?._id;
    const { page, limit } = req.query;

    const result = await contributionService.getContributionHistory(userId, {
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result.contributions,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}
