import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { loginValidator, registerValidator } from "../validators/auth.validators.js";

const router = Router();
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", authenticate, logout);
export default router;