import test from "node:test";
import assert from "node:assert/strict";

import { calculateScore } from "../../src/services/matchingService.js";

test("calculateScore - same category, same city and area", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: {
      city: "Qena",
      area: "Qena City",
    },
  };

  const request = {
    categoryId: "cat1",
    quantity: 5,
    urgency: "high",
    location: {
      city: "Qena",
      area: "Qena City",
    },
  };

  const result = calculateScore(resource, request);

  assert.equal(result.scoreBreakdown.category, 1);
  assert.equal(result.scoreBreakdown.location, 1);
  assert.equal(result.scoreBreakdown.quantity, 1);
  assert.equal(result.scoreBreakdown.urgency, 1);
  assert.equal(result.scoreBreakdown.availability, 1);
  assert.equal(result.score, 1);
});

test("calculateScore - same city but different area", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: {
      city: "Qena",
      area: "Qena City",
    },
  };

  const request = {
    categoryId: "cat1",
    quantity: 5,
    urgency: "high",
    location: {
      city: "Qena",
      area: "Another Area",
    },
  };

  const result = calculateScore(resource, request);

  assert.equal(result.scoreBreakdown.location, 0.7);
});

test("calculateScore - different category", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: {
      city: "Qena",
      area: "Qena City",
    },
  };

  const request = {
    categoryId: "cat2",
    quantity: 5,
    urgency: "high",
    location: {
      city: "Qena",
      area: "Qena City",
    },
  };

  const result = calculateScore(resource, request);

  assert.equal(result.scoreBreakdown.category, 0);
});