import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { getMe, updateMe } from "../controllers/users.controller.js";

const router = Router();
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
export default router;