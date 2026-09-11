import * as authService from "../services/authService.js";

export async function register(req, res, next) {
  try {
    return res.status(201).json({ success: true, data: await authService.register(req.body) });
  } catch (error) { return next(error); }
}
export async function login(req, res, next) {
  try {
    return res.json({ success: true, data: await authService.login(req.body.email, req.body.password) });
  } catch (error) { return next(error); }
}
export function logout(req, res) {
  return res.json({ success: true, message: "Logged out. Authentication is stateless; discard the token on the client." });
}