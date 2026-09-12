import mongoose from "mongoose";

import matchModel from "../models/Match.js";
import requestModel from "../models/Request.js";

// Weights
const W1 = 0.30; // category
const W2 = 0.20; // location
const W3 = 0.15; // quantity
const W4 = 0.20; // urgency
const W5 = 0.15; // availability

// Minimum score
const MIN_SCORE = 0.50;

const calculateScore = (resource, request) => {
  let categoryScore = 0;
  let locationScore = 0;
  let quantityScore = 0;
  let urgencyScore = 0;
  let availabilityScore = 0;

  // Category
  if (
    String(resource.categoryId) ===
    String(request.categoryId)
  ) {
    categoryScore = 1;
  }

  // Location
  if (resource.location && request.location) {
    if (resource.location.city === request.location.city) {
      locationScore = 0.7;

      if (
        resource.location.area &&
        request.location.area &&
        resource.location.area === request.location.area
      ) {
        locationScore = 1.0;
      }
    }
  }

  // Quantity
  if (
    resource.quantity &&
    request.quantity &&
    resource.quantity >= request.quantity
  ) {
    quantityScore = 1;
  }

  // Urgency
  if (request.urgency === "high") {
    urgencyScore = 1;
  } else if (request.urgency === "medium") {
    urgencyScore = 0.7;
  } else {
    urgencyScore = 0.4;
  }

  // Availability
  if (resource.status === "available") {
    availabilityScore = 1;
  }

  const score =
    categoryScore * W1 +
    locationScore * W2 +
    quantityScore * W3 +
    urgencyScore * W4 +
    availabilityScore * W5;

  return {
    score,
    scoreBreakdown: {
      category: categoryScore,
      location: locationScore,
      quantity: quantityScore,
      urgency: urgencyScore,
      availability: availabilityScore,
    },
  };
};

const generateMatches = (resourceId) => {
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    return Promise.reject(
      new Error("Invalid resourceId")
    );
  }

  const Resource = mongoose.model("Resource");

  return Resource.findById(resourceId)
    .then((resource) => {
      if (!resource) {
        throw new Error("Resource not found");
      }

      if (resource.status !== "available") {
        throw new Error("Resource is not available");
      }

      return requestModel
        .find({
          status: "published",
          categoryId: resource.categoryId,
        })
        .then((requests) => {
          const matches = [];

          requests.forEach((request) => {
            const result = calculateScore(
              resource,
              request
            );

            if (result.score >= MIN_SCORE) {
              matches.push({
                resourceId: resource._id,
                requestId: request._id,
                providerId: resource.providerId,
                requesterId: request.requesterId,
                score: result.score,
                scoreBreakdown: result.scoreBreakdown,
                status: "proposed",
              });
            }
          });

          return Promise.all(
            matches.map((match) => {
              return matchModel
                .create(match)
                .catch((err) => {
                  if (err.code === 11000) {
                    return null;
                  }

                  throw err;
                });
            })
          );
        });
    })
    .then((matches) => {
      return matches
        .filter((match) => match !== null)
        .sort((a, b) => b.score - a.score);
    });
};

export {
  calculateScore,
  generateMatches,
};