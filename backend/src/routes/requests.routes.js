import express from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import {
  createRequestValidator,
  requestIdValidator,
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
  requestIdValidator,
  validate,
  getRequest
);

requestRouter.post(
  "/",
  authenticate,
  createRequestValidator,
  validate,
  addRequest
);

requestRouter.put(
  "/:id",
  authenticate,
  requestIdValidator,
  validate,
  updateRequest
);

requestRouter.put(
  "/:id/status",
  authenticate,
  requestIdValidator,
  validate,
  changeRequestStatus
);

requestRouter.delete(
  "/:id",
  authenticate,
  requestIdValidator,
  validate,
  deleteRequest
);

export default requestRouter;





































/*import express from "express";

const requestRouter = express.Router();

import{
  getRequests,
  getRequest,
  addRequest,
  updateRequest,
  changeRequestStatus,
  deleteRequest,
} from "../controllers/requests.controller.js";


import {
  createRequestValidation,
  updateRequestValidation,
  changeStatusValidation,
} from "../validators/request.validators.js";

import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";




requestRouter.get("/", getRequests);
requestRouter.get("/:id", getRequest);

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
  updateRequestValidation,
  validate,
  updateRequest
);

requestRouter.put(
  "/:id/status",
  authenticate,
  changeStatusValidation,
  validate,
  changeRequestStatus
);

requestRouter.delete("/:id", authenticate, deleteRequest);

export default requestRouter;*/






/*requestRouter.get("/", getRequests);

requestRouter.get("/:id", getRequest);

requestRouter.post("/", addRequest);

requestRouter.put("/:id", updateRequest);

requestRouter.put("/:id/status", changeRequestStatus);

requestRouter.delete("/:id", deleteRequest);*/


