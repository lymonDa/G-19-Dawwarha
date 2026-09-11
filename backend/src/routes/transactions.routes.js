import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { confirmTransactionValidator } from "../validators/transaction.validators.js";
import { confirm } from "../controllers/transactions.controller.js";

const router = Router();

router.post("/:matchId/confirm", authenticate, confirmTransactionValidator, validate, confirm);

export default router;
