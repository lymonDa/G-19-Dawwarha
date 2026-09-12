import { requestModel } from "../models/Request.js";
import { transitionRequest } from "../services/requestLifecycleService.js";

const isOwnerOrAdmin = (request, user) => {
  return (
    user.role === "admin" ||
    String(request.requesterId) === String(user._id)
  );
};

// GET /api/requests
const getRequests = (req, res) => {
  requestModel
    .find()
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: err.message,
        },
      });
    });
};

// GET /api/requests/:id
const getRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Request not found",
          },
        });
      }

      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: err.message,
        },
      });
    });
};

// POST /api/requests
const addRequest = (req, res) => {
  const request = new requestModel({
    requesterId: req.user._id,
    categoryId: req.body.categoryId,
    quantity: req.body.quantity,
    urgency: req.body.urgency,
    location: req.body.location,
    description: req.body.description,
  });

  request
    .save()
    .then((data) => {
      res.status(201).json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.message,
        },
      });
    });
};

// PUT /api/requests/:id
const updateRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((request) => {
      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Request not found",
          },
        });
      }

      if (!isOwnerOrAdmin(request, req.user)) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to update this request.",
          },
        });
      }

      if (
        request.status === "accepted" ||
        request.status === "fulfilled" ||
        request.status === "cancelled" ||
        request.status === "expired"
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "This request cannot be updated anymore.",
          },
        });
      }

      if (req.body.categoryId !== undefined) {
        request.categoryId = req.body.categoryId;
      }

      if (req.body.quantity !== undefined) {
        request.quantity = req.body.quantity;
      }

      if (req.body.urgency !== undefined) {
        request.urgency = req.body.urgency;
      }

      if (req.body.location !== undefined) {
        request.location = req.body.location;
      }

      if (req.body.description !== undefined) {
        request.description = req.body.description;
      }

      return request.save();
    })
    .then((data) => {
      if (data) {
        res.json({
          success: true,
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: err.message,
        },
      });
    });
};

// PUT /api/requests/:id/status
const changeRequestStatus = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((request) => {
      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Request not found",
          },
        });
      }

      if (!isOwnerOrAdmin(request, req.user)) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to change this request.",
          },
        });
      }

      return transitionRequest(
        request,
        req.body.action,
        req.user
      );
    })
    .then((data) => {
      if (data) {
        res.json({
          success: true,
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        error: {
          code: "INVALID_TRANSITION",
          message: err.message,
        },
      });
    });
};

// DELETE /api/requests/:id
const deleteRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((request) => {
      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Request not found",
          },
        });
      }

      if (!isOwnerOrAdmin(request, req.user)) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to cancel this request.",
          },
        });
      }

      return transitionRequest(
        request,
        "cancel",
        req.user
      );
    })
    .then((data) => {
      if (data) {
        res.json({
          success: true,
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        error: {
          code: "INVALID_TRANSITION",
          message: err.message,
        },
      });
    });
};

export {
  getRequests,
  getRequest,
  addRequest,
  updateRequest,
  changeRequestStatus,
  deleteRequest,
};






























































































/*import { requestModel } from "../models/Request.js";
import { transitionRequest } from "../services/requestLifecycleService.js";

const getRequests = (req, res) => {
  requestModel
    .find()
    .populate("requesterId")
    .populate("categoryId")
    .populate("requesterOrgId")
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    });
};

const getRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .populate("requesterId")
    .populate("categoryId")
    .populate("requesterOrgId")
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    });
};

const addRequest = (req, res) => {
  const request = new requestModel({
    ...req.body,
    requesterId: req.user._id,
  });

  request
    .save()
    .then((data) => {
      res.status(201).json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    });
};

const updateRequest = (req, res) => {
  const updateData = {
    ...req.body,
  };

  delete updateData.status;
  delete updateData.requesterId;

  requestModel
    .findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    });
};

const changeRequestStatus = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((request) => {
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      return transitionRequest(
        request,
        req.body.action,
        req.user
      );
    })
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        message: err.message,
      });
    });
};

const deleteRequest = (req, res) => {
  requestModel
    .findById(req.params.id)
    .then((request) => {
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      return transitionRequest(
        request,
        "cancel",
        req.user
      );
    })
    .then((data) => {
      res.json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(409).json({
        success: false,
        message: err.message,
      });
    });
};

export {
  getRequests,
  getRequest,
  addRequest,
  updateRequest,
  changeRequestStatus,
  deleteRequest,
};*/