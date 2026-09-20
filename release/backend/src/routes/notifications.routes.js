import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import {
  listNotifications,
  markRead,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listNotifications);
router.patch("/:id/read", markRead);

export default router;
