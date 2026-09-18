import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import requestModel from "../../src/models/Request.js";
import matchModel from "../../src/models/Match.js";
import Handover from "../../src/models/Handover.js";
import matchRouter from "../../src/routes/matches.routes.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const JWT_SECRET = "test_secret_for_matches_api_tests_key!";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENGINEER 3 — Match API, Transactions & Coordination Tests (Task 3.B)", () => {
  let replSet;
  let app;
  let server;
  let baseUrl;

  let providerUser;
  let requesterUser;
  let thirdPartyUser;
  let adminUser;

  let providerToken;
  let requesterToken;
  let thirdPartyToken;
  let adminToken;

  let category;

  const sign = (user) =>
    jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  const makeResource = (overrides = {}) => ({
    title: "Test Resource",
    description: "Resource description",
    categoryId: category._id,
    providerId: providerUser._id,
    quantity: 10,
    unit: "items",
    status: "available",
    location: { city: "Amman", area: "Downtown" },
    availabilityWindow: {
      start: new Date("2026-09-01T00:00:00Z"),
      end: new Date("2026-09-30T00:00:00Z"),
    },
    ...overrides,
  });

  const makeRequest = (overrides = {}) => ({
    title: "Test Request",
    description: "Request description",
    categoryId: category._id,
    requesterId: requesterUser._id,
    quantity: 2,
    status: "published",
    urgency: "medium",
    location: { city: "Amman", area: "Downtown" },
    ...overrides,
  });

  before(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replSet.getUri());

    app = express();
    app.use(express.json());
    app.use("/api/matches", matchRouter);
    app.use(errorHandler);

    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await replSet.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Resource.deleteMany({});
    await requestModel.deleteMany({});
    await matchModel.deleteMany({});
    await Handover.deleteMany({});

    providerUser = await User.create({
      name: "Provider User",
      email: "provider@example.com",
      passwordHash: "dummyHash123",
      role: "user",
      status: "active",
    });

    requesterUser = await User.create({
      name: "Requester User",
      email: "requester@example.com",
      passwordHash: "dummyHash123",
      role: "user",
      status: "active",
    });

    thirdPartyUser = await User.create({
      name: "Third Party User",
      email: "thirdparty@example.com",
      passwordHash: "dummyHash123",
      role: "user",
      status: "active",
    });

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "dummyHash123",
      role: "admin",
      status: "active",
    });

    providerToken = sign(providerUser);
    requesterToken = sign(requesterUser);
    thirdPartyToken = sign(thirdPartyUser);
    adminToken = sign(adminUser);

    category = await Category.create({
      name: "Surplus Food",
      description: "Edible surplus meals and groceries",
      isActive: true,
    });
  });

  describe("POST /api/matches/:resourceId/generate (Task 3.B)", () => {
    it("rejects invalid ObjectId for resourceId with 400", async () => {
      const res = await fetch(`${baseUrl}/api/matches/not-a-valid-id/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.code === "VALIDATION_ERROR" || body.error.code === "INVALID_ID");
    });

    it("returns 404 when resource does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/matches/${fakeId}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "RESOURCE_NOT_FOUND");
    });

    it("rejects non-owner, non-admin caller with 403", async () => {
      const resource = await Resource.create(makeResource());

      const res = await fetch(`${baseUrl}/api/matches/${resource._id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${thirdPartyToken}`,
        },
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    it("rejects matching when resource is not available or published (e.g. cancelled) with 400", async () => {
      const resource = await Resource.create(makeResource({ status: "cancelled" }));

      const res = await fetch(`${baseUrl}/api/matches/${resource._id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "INVALID_STATUS");
    });

    it("generates and stores matches for eligible published requests", async () => {
      const resource = await Resource.create(
        makeResource({
          title: "Fresh Apples",
          quantity: 10,
          location: { city: "Amman", area: "Jabal Amman" },
        })
      );

      const request = await requestModel.create(
        makeRequest({
          title: "Need Apples",
          description: "Apples for family",
          quantity: 5,
          urgency: "high",
          location: { city: "Amman", area: "Jabal Amman" },
        })
      );

      const res = await fetch(`${baseUrl}/api/matches/${resource._id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.equal(body.data.length, 1);
      assert.equal(String(body.data[0].resourceId), String(resource._id));
      assert.equal(String(body.data[0].requestId), String(request._id));
      assert.equal(body.data[0].status, "proposed");

      const dbMatch = await matchModel.findById(body.data[0]._id);
      assert.ok(dbMatch);
      assert.equal(dbMatch.status, "proposed");
    });

    it("allows admin to generate matches for any resource", async () => {
      const resource = await Resource.create(makeResource());

      const res = await fetch(`${baseUrl}/api/matches/${resource._id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
    });
  });

  describe("GET /api/matches (Task 3.B)", () => {
    let match1;
    let match2;

    beforeEach(async () => {
      const resource1 = await Resource.create(
        makeResource({
          title: "Item 1",
          providerId: providerUser._id,
        })
      );

      const request1 = await requestModel.create(
        makeRequest({
          title: "Request 1",
          requesterId: requesterUser._id,
          quantity: 2,
        })
      );

      const resource2 = await Resource.create(
        makeResource({
          title: "Item 2",
          providerId: thirdPartyUser._id,
        })
      );

      const request2 = await requestModel.create(
        makeRequest({
          title: "Request 2",
          requesterId: thirdPartyUser._id,
          quantity: 4,
        })
      );

      match1 = await matchModel.create({
        resourceId: resource1._id,
        requestId: request1._id,
        providerId: providerUser._id,
        requesterId: requesterUser._id,
        score: 0.85,
        status: "proposed",
      });

      match2 = await matchModel.create({
        resourceId: resource2._id,
        requestId: request2._id,
        providerId: thirdPartyUser._id,
        requesterId: thirdPartyUser._id,
        score: 0.75,
        status: "proposed",
      });
    });

    it("enforces inbox isolation (provider only sees their matches)", async () => {
      const res = await fetch(`${baseUrl}/api/matches`, {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 1);
      assert.equal(String(body.data[0]._id), String(match1._id));
    });

    it("enforces inbox isolation (requester only sees their matches)", async () => {
      const res = await fetch(`${baseUrl}/api/matches`, {
        headers: {
          Authorization: `Bearer ${requesterToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 1);
      assert.equal(String(body.data[0]._id), String(match1._id));
    });

    it("allows admin with all=true or view=all to view all matches", async () => {
      const res = await fetch(`${baseUrl}/api/matches?all=true`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 2);
    });

    it("supports filtering by status and pagination", async () => {
      match2.status = "rejected";
      await match2.save();

      const res = await fetch(`${baseUrl}/api/matches?status=proposed`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.pagination);
      assert.equal(body.pagination.page, 1);
      assert.equal(body.pagination.limit, 20);
    });
  });

  describe("PUT /api/matches/:id/accept — Atomic Transaction (Task 3.B)", () => {
    let resource;
    let request;
    let match;

    beforeEach(async () => {
      resource = await Resource.create(
        makeResource({
          title: "Laptop for School",
          providerId: providerUser._id,
        })
      );

      request = await requestModel.create(
        makeRequest({
          title: "Student Needs Laptop",
          requesterId: requesterUser._id,
          quantity: 1,
          urgency: "high",
        })
      );

      match = await matchModel.create({
        resourceId: resource._id,
        requestId: request._id,
        providerId: providerUser._id,
        requesterId: requesterUser._id,
        score: 0.9,
        status: "proposed",
      });
    });

    it("rejects non-party user with 403", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${match._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${thirdPartyToken}`,
        },
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    it("successfully accepts match when called by provider, updating all 3 entities & creating handover", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${match._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.handoverId);
      assert.equal(body.data.match.status, "accepted");

      // Verify Match in DB
      const updatedMatch = await matchModel.findById(match._id);
      assert.equal(updatedMatch.status, "accepted");

      // Verify Resource in DB
      const updatedResource = await Resource.findById(resource._id);
      assert.equal(updatedResource.status, "accepted");

      // Verify Request in DB
      const updatedRequest = await requestModel.findById(request._id);
      assert.equal(updatedRequest.status, "accepted");

      // Verify Handover created
      const handover = await Handover.findById(body.data.handoverId);
      assert.ok(handover);
      assert.equal(String(handover.matchId), String(match._id));
      assert.equal(String(handover.resourceId), String(resource._id));
      assert.equal(String(handover.requestId), String(request._id));
      assert.equal(String(handover.providerId), String(providerUser._id));
      assert.equal(String(handover.seekerId), String(requesterUser._id));
      assert.equal(handover.status, "in_progress");
      assert.equal(handover.confirmedByProvider, false);
      assert.equal(handover.confirmedBySeeker, false);
    });

    it("successfully accepts match when called by requester", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${match._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${requesterToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.handoverId);

      const updatedMatch = await matchModel.findById(match._id);
      assert.equal(updatedMatch.status, "accepted");
    });

    it("rejects duplicate acceptance attempt on already accepted match with 409", async () => {
      match.status = "accepted";
      await match.save();

      const res = await fetch(`${baseUrl}/api/matches/${match._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "INVALID_STATUS");
    });

    it("aborts transaction and rolls back changes if a lifecycle step or handover creation fails", async () => {
      // Put resource into terminal cancelled state so transitionResource will throw 409
      resource.status = "cancelled";
      await resource.save();

      const res = await fetch(`${baseUrl}/api/matches/${match._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 409);

      // Verify Match was NOT updated to accepted in DB (rolled back)
      const freshMatch = await matchModel.findById(match._id);
      assert.equal(freshMatch.status, "proposed");

      // Verify Request was NOT updated to accepted in DB
      const freshRequest = await requestModel.findById(request._id);
      assert.equal(freshRequest.status, "published");

      // Verify no Handover was created
      const handoverCount = await Handover.countDocuments({ matchId: match._id });
      assert.equal(handoverCount, 0);
    });
  });

  describe("PUT /api/matches/:id/reject (Task 3.B)", () => {
    let resource;
    let request;
    let match;

    beforeEach(async () => {
      resource = await Resource.create(
        makeResource({
          title: "Desk Lamp",
          status: "matched",
          providerId: providerUser._id,
        })
      );

      request = await requestModel.create(
        makeRequest({
          title: "Needs Desk Lamp",
          status: "matched",
          requesterId: requesterUser._id,
        })
      );

      match = await matchModel.create({
        resourceId: resource._id,
        requestId: request._id,
        providerId: providerUser._id,
        requesterId: requesterUser._id,
        score: 0.88,
        status: "proposed",
      });
    });

    it("rejects non-party caller with 403", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${match._id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${thirdPartyToken}`,
        },
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    it("successfully marks match rejected and releases matched resource & request back to available/published", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${match._id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${requesterToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, "rejected");

      const updatedMatch = await matchModel.findById(match._id);
      assert.equal(updatedMatch.status, "rejected");

      const updatedResource = await Resource.findById(resource._id);
      assert.equal(updatedResource.status, "available");

      const updatedRequest = await requestModel.findById(request._id);
      assert.equal(updatedRequest.status, "published");
    });

    it("returns 409 if match is already rejected", async () => {
      match.status = "rejected";
      await match.save();

      const res = await fetch(`${baseUrl}/api/matches/${match._id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "INVALID_STATUS");
    });
  });
});
