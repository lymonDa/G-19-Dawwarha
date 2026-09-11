/*
 * Required order: authenticate -> requireOwnership(...) -> validate -> controller.
 * Admin-only routes use authenticate -> requireRole("admin") -> controller.
 */
const forbidden = (res) => res.status(403).json({
  success: false,
  error: { code: "FORBIDDEN", message: "You don't have permission to do that." },
});

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) return forbidden(res);
  return next();
};

export const requireOwnership = (getOwnerId) => async (req, res, next) => {
  if (req.user?.role === "admin") return next();
  const ownerId = await getOwnerId(req);
  if (!ownerId || String(ownerId) !== String(req.user?._id)) return forbidden(res);
  return next();
};