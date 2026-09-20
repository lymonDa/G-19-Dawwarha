import adminAnalyticsService from "../services/adminAnalyticsService.js";

/**
 * GET /api/admin/analytics
 * Admin-only, read-only analytics endpoint derived strictly from DB Plan Section 14.
 */
export async function getAnalytics(req, res, next) {
  try {
    const analytics = await adminAnalyticsService.getAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return next(error);
  }
}
