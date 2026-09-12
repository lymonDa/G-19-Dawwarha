import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import { transitionResource } from "../../src/services/resourceLifecycleService.js";
import resourceRoutes from "../../src/routes/resources.routes.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const JWT_SECRET = "test_jwt_secret_for_engineer_2_testing_32_chars!";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENGINEER 2 — STEP 5: DELETE /api/resources/:id & Resource Lifecycle", () => {
  let mongo;
  let app;
  let server;
  let baseUrl;

  let ownerUser;
  let otherUser;
  let adminUser;
  let ownerToken;
  let otherToken;
  let adminToken;
  let testCategory;
  let inactiveCategory;

  const sign = (user) => jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    app = express();
    app.use(express.json());
    app.use("/api/resources", resourceRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    ownerUser = await User.create({
      name: "Provider Owner",
      email: "owner@example.com",
      passwordHash: "hash",
      role: "user",
      status: "active",
    });
    ownerToken = sign(ownerUser);

    otherUser = await User.create({
      name: "Unrelated User",
      email: "other@example.com",
      passwordHash: "hash",
      role: "user",
      status: "active",
    });
    otherToken = sign(otherUser);

    adminUser = await User.create({
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash: "hash",
      role: "admin",
      status: "active",
    });
    adminToken = sign(adminUser);

    testCategory = await Category.create({
      name: "Recycled Wood",
      slug: "recycled-wood",
      description: "Wood and timber surplus",
      isActive: true,
    });

    inactiveCategory = await Category.create({
      name: "Discontinued",
      slug: "discontinued",
      description: "Inactive category",
      isActive: false,
    });
  });

  after(async () => {
    server.close();
    await mongoose.disconnect();
    await mongo.stop();
  });

  const api = async (method, path, body, token) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  };

  const createTestResource = async (status = "available", overrides = {}) => {
    return Resource.create({
      providerId: ownerUser._id,
      categoryId: testCategory._id,
      title: "Reclaimed Pine Beams",
      description: "10 pieces of seasoned pine timber",
      quantity: 10,
      location: { city: "Amman", area: "Abdali" },
      availabilityWindow: {
        start: new Date("2026-10-01T09:00:00Z"),
        end: new Date("2026-10-15T18:00:00Z"),
      },
      status,
      ...overrides,
    });
  };

  // =========================================================================
  // 1. TRANSITION SERVICE UNIT TESTS
  // =========================================================================
  describe("resourceLifecycleService.transitionResource", () => {
    it("transitions draft -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("draft");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("transitions published -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("published");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("transitions available -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("available");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("transitions matched -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("matched");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("transitions accepted -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("accepted");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("transitions in_handover -> cancelled when action is 'cancel'", async () => {
      const res = await createTestResource("in_handover");
      const updated = await transitionResource(res, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("rejects transition on 'completed' resource as a terminal state", async () => {
      const res = await createTestResource("completed");
      await assert.rejects(
        transitionResource(res, "cancel", ownerUser),
        (err) => err.statusCode === 409 && err.code === "INVALID_TRANSITION"
      );
    });

    it("rejects transition on 'impact_recorded' resource as a terminal state", async () => {
      const res = await createTestResource("impact_recorded");
      await assert.rejects(
        transitionResource(res, "cancel", ownerUser),
        (err) => err.statusCode === 409 && err.code === "INVALID_TRANSITION"
      );
    });

    it("rejects transition on already 'cancelled' resource as a terminal state", async () => {
      const res = await createTestResource("cancelled");
      await assert.rejects(
        transitionResource(res, "cancel", ownerUser),
        (err) => err.statusCode === 409 && err.code === "INVALID_TRANSITION"
      );
    });

    it("rejects cancellation by a non-owner non-admin user with 403", async () => {
      const res = await createTestResource("available");
      await assert.rejects(
        transitionResource(res, "cancel", otherUser),
        (err) => err.statusCode === 403 && err.code === "FORBIDDEN"
      );
    });

    it("allows cancellation by admin user", async () => {
      const res = await createTestResource("available");
      const updated = await transitionResource(res, "cancel", adminUser);
      assert.equal(updated.status, "cancelled");
    });
  });

  // =========================================================================
  // 2. HTTP DELETE /api/resources/:id AUTHORIZATION & BEHAVIOR
  // =========================================================================
  describe("DELETE /api/resources/:id (HTTP Endpoint)", () => {
    it("rejects unauthenticated request with 401 UNAUTHORIZED", async () => {
      const resDoc = await createTestResource("available");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, null);
      assert.equal(res.status, 401);
      assert.equal(res.data.error.code, "UNAUTHORIZED");
    });

    it("rejects authenticated non-owner request with 403 FORBIDDEN", async () => {
      const resDoc = await createTestResource("available");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, otherToken);
      assert.equal(res.status, 403);
      assert.equal(res.data.error.code, "FORBIDDEN");
    });

    it("allows owner to cancel resource and returns HTTP 200 with cancelled status", async () => {
      const resDoc = await createTestResource("available");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, ownerToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.message, "Resource cancelled successfully");
      assert.equal(res.data.data.status, "cancelled");
    });

    it("confirms resource is NOT hard-deleted from MongoDB after DELETE", async () => {
      const resDoc = await createTestResource("available");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, ownerToken);
      assert.equal(res.status, 200);

      // Verify directly from MongoDB
      const found = await Resource.findById(resDoc._id);
      assert.ok(found, "Resource must still exist in MongoDB");
      assert.equal(found.status, "cancelled", "Resource status must be cancelled");
      assert.equal(String(found.providerId), String(ownerUser._id));
    });

    it("allows admin to cancel resource owned by another user", async () => {
      const resDoc = await createTestResource("available");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.status, "cancelled");

      const inDb = await Resource.findById(resDoc._id);
      assert.equal(inDb.status, "cancelled");
    });

    it("rejects DELETE on already cancelled resource with HTTP 409 INVALID_TRANSITION", async () => {
      const resDoc = await createTestResource("cancelled");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, ownerToken);
      assert.equal(res.status, 409);
      assert.equal(res.data.error.code, "INVALID_TRANSITION");

      // Verify still in MongoDB and not deleted
      const inDb = await Resource.findById(resDoc._id);
      assert.ok(inDb);
      assert.equal(inDb.status, "cancelled");
    });

    it("rejects DELETE on completed resource with HTTP 409 INVALID_TRANSITION", async () => {
      const resDoc = await createTestResource("completed");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, ownerToken);
      assert.equal(res.status, 409);
      assert.equal(res.data.error.code, "INVALID_TRANSITION");

      // Ensure status did NOT change to cancelled
      const inDb = await Resource.findById(resDoc._id);
      assert.equal(inDb.status, "completed");
    });

    it("rejects DELETE on impact_recorded resource with HTTP 409 INVALID_TRANSITION", async () => {
      const resDoc = await createTestResource("impact_recorded");
      const res = await api("DELETE", `/api/resources/${resDoc._id}`, null, ownerToken);
      assert.equal(res.status, 409);
      assert.equal(res.data.error.code, "INVALID_TRANSITION");

      // Ensure status did NOT change to cancelled
      const inDb = await Resource.findById(resDoc._id);
      assert.equal(inDb.status, "impact_recorded");
    });

    it("returns HTTP 404 NOT_FOUND when resource does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await api("DELETE", `/api/resources/${fakeId}`, null, ownerToken);
      assert.equal(res.status, 404);
      assert.equal(res.data.error.code, "NOT_FOUND");
    });

    it("returns HTTP 400 for invalid ObjectId format", async () => {
      const res = await api("DELETE", "/api/resources/invalid-mongo-id-123", null, ownerToken);
      assert.equal(res.status, 400);
      assert.ok(["INVALID_ID", "VALIDATION_ERROR"].includes(res.data.error.code));
    });
  });

  // =========================================================================
  // 3. RESOURCE CREATION & VALIDATION INVARIANTS (DB Plan Section 8.4)
  // =========================================================================
  describe("Resource Validation Invariants (DB Plan Section 8.4)", () => {
    const validBody = () => ({
      title: "Valid Resource Title",
      description: "Detailed description of surplus materials for reuse",
      quantity: 5,
      categoryId: String(testCategory._id),
      location: { city: "Amman", area: "Sweifieh" },
      availabilityWindow: {
        start: "2026-11-01T08:00:00.000Z",
        end: "2026-11-20T18:00:00.000Z",
      },
    });

    it("successfully creates a valid resource in draft status", async () => {
      const res = await api("POST", "/api/resources", validBody(), ownerToken);
      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.status, "draft");
      assert.equal(res.data.data.title, "Valid Resource Title");
    });

    it("rejects title < 3 characters with 400", async () => {
      const body = validBody();
      body.title = "AB";
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects title > 100 characters with 400", async () => {
      const body = validBody();
      body.title = "A".repeat(101);
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects description > 1000 characters with 400", async () => {
      const body = validBody();
      body.description = "D".repeat(1001);
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects quantity <= 0 with 400", async () => {
      const body = validBody();
      body.quantity = 0;
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects availabilityWindow.end <= availabilityWindow.start with 400", async () => {
      const body = validBody();
      body.availabilityWindow = {
        start: "2026-11-20T18:00:00.000Z",
        end: "2026-11-01T08:00:00.000Z",
      };
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects non-existent categoryId with 400", async () => {
      const body = validBody();
      body.categoryId = String(new mongoose.Types.ObjectId());
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });

    it("rejects inactive categoryId with 400", async () => {
      const body = validBody();
      body.categoryId = String(inactiveCategory._id);
      const res = await api("POST", "/api/resources", body, ownerToken);
      assert.equal(res.status, 400);
      assert.equal(res.data.error.code, "VALIDATION_ERROR");
    });
  });
});
