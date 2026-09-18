import reportService from "../services/reportService.js";

/**
 * Handles POST /api/reports
 * Authenticated user creates a new report against a valid target.
 */
export async function create(req, res, next) {
  try {
    const reporterId = req.user._id;
    const { targetType, targetId, reason, description } = req.body;

    const report = await reportService.createReport({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    });

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles GET /api/reports
 * Admin only endpoint for listing reports with filtering and pagination.
 */
export async function list(req, res, next) {
  try {
    const { status, targetType, page, limit } = req.query;

    const result = await reportService.listReports({
      status,
      targetType,
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles PUT /api/reports/:id/resolve
 * Admin only endpoint for reviewing and resolving reports.
 */
export async function resolve(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { status, resolution } = req.body;

    const updatedReport = await reportService.resolveReport(id, {
      status,
      resolution,
      adminId,
    });

    return res.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    return next(error);
  }
}
