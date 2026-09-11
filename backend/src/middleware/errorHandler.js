export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, error: { code: "DUPLICATE_RESOURCE", message: "A resource with these details already exists." } });
  }
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: { code: error.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"), message: status === 500 ? "An unexpected error occurred." : error.message },
  });
}