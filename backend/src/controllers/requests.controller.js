import { requestModel } from "../models/Request.js";
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
};