import test from "node:test";
import assert from "node:assert/strict";

import { calculateScore, findCandidateResources } from "../../src/services/matchingService.js";

test("calculateScore - same category, same city and area", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: {
      city: "Qena",
      area: "Qena City",
    },
    availabilityWindow: {
      start: new Date(Date.now() - 3600000),
      end: new Date(Date.now() + 86400000),
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

test("calculateScore - expired availability window evaluates to 0", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: { city: "Amman", area: "Abdali" },
    availabilityWindow: {
      start: new Date(Date.now() - 200000),
      end: new Date(Date.now() - 100000), // in the past
    },
  };

  const request = {
    categoryId: "cat1",
    quantity: 5,
    urgency: "high",
    location: { city: "Amman", area: "Abdali" },
  };

  const result = calculateScore(resource, request);
  assert.equal(result.scoreBreakdown.availability, 0);
  assert.equal(result.score < 1, true);
});

test("calculateScore - medium and low urgency scores", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 10,
    status: "available",
    location: { city: "Amman", area: "Abdali" },
  };

  const medRequest = {
    categoryId: "cat1",
    quantity: 5,
    urgency: "medium",
    location: { city: "Amman", area: "Abdali" },
  };
  assert.equal(calculateScore(resource, medRequest).scoreBreakdown.urgency, 0.7);

  const lowRequest = {
    categoryId: "cat1",
    quantity: 5,
    urgency: "low",
    location: { city: "Amman", area: "Abdali" },
  };
  assert.equal(calculateScore(resource, lowRequest).scoreBreakdown.urgency, 0.4);
});

test("calculateScore - insufficient quantity yields 0 for quantity", () => {
  const resource = {
    categoryId: "cat1",
    quantity: 3,
    status: "available",
    location: { city: "Amman", area: "Abdali" },
  };

  const request = {
    categoryId: "cat1",
    quantity: 10, // exceeds available
    urgency: "high",
    location: { city: "Amman", area: "Abdali" },
  };

  assert.equal(calculateScore(resource, request).scoreBreakdown.quantity, 0);
});