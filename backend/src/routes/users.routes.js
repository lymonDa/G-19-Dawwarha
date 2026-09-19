import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { changePassword, getMe, updateMe } from "../controllers/users.controller.js";
import validate from "../middleware/validate.js";
import { updateUserValidator } from "../validators/user.validators.js";

const router = Router();
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateUserValidator, validate, updateMe);
router.post("/me/change-password", authenticate, changePassword);
export default router;