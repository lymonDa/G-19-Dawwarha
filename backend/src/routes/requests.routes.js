import express from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import {
  createRequestValidation,
  requestIdValidation,
} from "../validators/request.validators.js";

import {
  getRequests,
  getRequest,
  addRequest,
  updateRequest,
  changeRequestStatus,
  deleteRequest,
} from "../controllers/requests.controller.js";

const requestRouter = express.Router();

requestRouter.get("/", authenticate, getRequests);

requestRouter.get(
  "/:id",
  authenticate,
  requestIdValidation,
  validate,
  getRequest
);

requestRouter.post(
  "/",
  authenticate,
  createRequestValidation,
  validate,
  addRequest
);

requestRouter.put(
  "/:id",
  authenticate,
  requestIdValidation,
  validate,
  updateRequest
);

requestRouter.put(
  "/:id/status",
  authenticate,
  requestIdValidation,
  validate,
  changeRequestStatus
);

requestRouter.delete(
  "/:id",
  authenticate,
  requestIdValidation,
  validate,
  deleteRequest
);

export default requestRouter;