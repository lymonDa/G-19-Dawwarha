/*
 * Use as authenticate before protected controllers. It verifies the Bearer
 * JWT, reloads the current user, and blocks users suspended after issuance.
 */
import User from "../models/User.js";
import { verifyToken } from "../services/authService.js";

export default async function authenticate(req, res, next) {
  const header = req.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication is required." } });
  }
  try {
    const payload = verifyToken(header.slice(7).trim());
    const user = payload.sub ? await User.findById(payload.sub) : null;
    if (!user) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication is required." } });
    if (user.status === "suspended") {
      return res.status(403).json({ success: false, error: { code: "ACCOUNT_SUSPENDED", message: "Your account is suspended." } });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } });
  }
}