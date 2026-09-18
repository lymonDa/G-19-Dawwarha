import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import User from "../../src/models/User.js";
import Organization from "../../src/models/Organization.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import { transitionResource } from "../../src/services/resourceLifecycleService.js";
import resourceRoutes from "../../src/routes/resources.routes.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const JWT_SECRET = "test_jwt_secret_for_engineer_2_lifecycle_testing_key_123!";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENGINEER 2 — Comprehensive Resource Authorization, Lifecycle & Security Test Suite", () => {
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

  let activeCategory;
  let inactiveCategory;

  let verifiedOrg;
  let unverifiedOrg;
  let otherUserOrg;

  const sign = (user) =>
    jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    app = express();
    app.use(express.json());
    app.use("/api/resources", resourceRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    // Users
    ownerUser = await User.create({
      name: "Resource Provider Owner",
      email: "provider.owner@example.com",
      passwordHash: "hash123",
      role: "user",
      status: "active",
    });
    ownerToken = sign(ownerUser);

    otherUser = await User.create({
      name: "Non-Owner User",
      email: "non.owner@example.com",
      passwordHash: "hash123",
      role: "user",
      status: "active",
    });
    otherToken = sign(otherUser);

    adminUser = await User.create({
      name: "Platform Administrator",
      email: "admin.platform@example.com",
      passwordHash: "hash123",
      role: "admin",
      status: "active",
    });
    adminToken = sign(adminUser);

    // Categories
    activeCategory = await Category.create({
      name: "Construction Materials",
      slug: "construction-materials",
      description: "Surplus bricks, mortar, tiles",
      isActive: true,
    });

    inactiveCategory = await Category.create({
      name: "Archived Hazardous",
      slug: "archived-hazardous",
      description: "Deactivated category",
      isActive: false,
    });

    // Organizations
    verifiedOrg = await Organization.create({
      name: "Clean Earth Foundation",
      ownerUserId: ownerUser._id,
      verification: { status: "approved" },
    });

    unverifiedOrg = await Organization.create({
      name: "Pending Eco Group",
      ownerUserId: ownerUser._id,
      verification: { status: "pending" },
    });

    otherUserOrg = await Organization.create({
      name: "Other Org Ltd",
      ownerUserId: otherUser._id,
      verification: { status: "approved" },
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
    const json = await res.json().catch(() => null);
    return { status: res.status, body: json };
  };

  const createDummyResource = async (overrides = {}) => {
    return Resource.create({
      providerId: ownerUser._id,
      categoryId: activeCategory._id,
      title: "Surplus Pine Timber",
      description: "High quality 2x4 beams ready for collection.",
      quantity: 50,
      location: { city: "Amman", area: "Shmeisani" },
      availabilityWindow: {
        start: new Date(Date.now() + 3600000),
        end: new Date(Date.now() + 86400000),
      },
      status: "draft",
      ...overrides,
    });
  };

  // =========================================================================
  // 1. PUBLIC READ ENDPOINTS
  // =========================================================================
  describe("1. Public Read Endpoints", () => {
    it("allows unauthenticated public access to list resources GET /api/resources", async () => {
      await createDummyResource({ status: "published" });
      const res = await api("GET", "/api/resources");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it("allows unauthenticated public access to retrieve single resource GET /api/resources/:id", async () => {
      const resource = await createDummyResource({ status: "available" });
      const res = await api("GET", `/api/resources/${resource._id}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data._id, String(resource._id));
    });

    it("returns 400 for malformed ObjectId on GET /api/resources/:id", async () => {
      const res = await api("GET", "/api/resources/not-a-valid-id");
      assert.equal(res.status, 400);
      assert.ok(res.body.error.code === "INVALID_ID" || res.body.error.code === "VALIDATION_ERROR");
      assert.match(res.body.error.message, /invalid/i);
    });
  });

  // =========================================================================
  // 2. RESOURCE CREATION & ORGANIZATION AUTHORIZATION
  // =========================================================================
  describe("2. Resource Creation & Organization Authorization", () => {
    it("rejects unauthenticated resource creation with 401", async () => {
      const payload = {
        title: "Steel Pipes",
        description: "Surplus construction pipes",
        quantity: 10,
        categoryId: String(activeCategory._id),
        location: { city: "Zarqa" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 50000).toISOString(),
        },
      };
      const res = await api("POST", "/api/resources", payload, null);
      assert.equal(res.status, 401);
    });

    it("allows authenticated provider to create a valid personal resource in draft status", async () => {
      const payload = {
        title: "Recycled Bricks",
        description: "Clean clay bricks from demolition site",
        quantity: 200,
        categoryId: String(activeCategory._id),
        location: { city: "Amman", area: "Sweifieh" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      const res = await api("POST", "/api/resources", payload, ownerToken);
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "draft");
      assert.equal(res.body.data.providerId, String(ownerUser._id));
    });

    it("allows provider to publish on behalf of a verified organization they own", async () => {
      const payload = {
        title: "Surplus Glass Panels",
        description: "Double-glazed tempered panels",
        quantity: 15,
        categoryId: String(activeCategory._id),
        providerOrgId: String(verifiedOrg._id),
        location: { city: "Amman" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      const res = await api("POST", "/api/resources", payload, ownerToken);
      assert.equal(res.status, 201);
      assert.equal(res.body.data.providerOrgId, String(verifiedOrg._id));
    });

    it("rejects provider publishing on behalf of an UNVERIFIED organization with 403", async () => {
      const payload = {
        title: "Cement Bags",
        description: "Extra Portland cement",
        quantity: 25,
        categoryId: String(activeCategory._id),
        providerOrgId: String(unverifiedOrg._id),
        location: { city: "Amman" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      const res = await api("POST", "/api/resources", payload, ownerToken);
      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, "FORBIDDEN");
      assert.match(res.body.error.message, /unverified organization or an organization you do not own/i);
    });

    it("rejects provider publishing on behalf of an organization they DO NOT OWN with 403", async () => {
      const payload = {
        title: "Copper Cables",
        description: "Heavy duty copper wiring",
        quantity: 5,
        categoryId: String(activeCategory._id),
        providerOrgId: String(otherUserOrg._id),
        location: { city: "Amman" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      const res = await api("POST", "/api/resources", payload, ownerToken);
      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, "FORBIDDEN");
      assert.match(res.body.error.message, /unverified organization or an organization you do not own/i);
    });
  });

  // =========================================================================
  // 3. THE MOST IMPORTANT RULE — STATUS CANNOT BE DIRECTLY UPDATED
  // =========================================================================
  describe("3. The Most Important Rule — Status Cannot Be Directly Updated via PUT", () => {
    it("rejects PUT /api/resources/:id with { status: 'completed' } with 400 DIRECT_STATUS_UPDATE_FORBIDDEN", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}`,
        { status: "completed" },
        ownerToken
      );

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "DIRECT_STATUS_UPDATE_FORBIDDEN");

      // Verify MongoDB document status was NOT modified
      const reloaded = await Resource.findById(resource._id);
      assert.equal(reloaded.status, "draft");
    });

    it("rejects PUT /api/resources/:id with { status: 'available' } even when valid fields are included", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}`,
        { title: "Updated Title", status: "available" },
        ownerToken
      );

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "DIRECT_STATUS_UPDATE_FORBIDDEN");

      const reloaded = await Resource.findById(resource._id);
      assert.equal(reloaded.status, "draft");
      assert.notEqual(reloaded.title, "Updated Title");
    });
  });

  // =========================================================================
  // 4. RESOURCE UPDATE & OWNER/ADMIN AUTHORIZATION
  // =========================================================================
  describe("4. Resource Update Authorization & Allowed Fields", () => {
    it("allows owner to update allowed fields (title, description, quantity)", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}`,
        { title: "Updated Pine Timber Title", quantity: 80 },
        ownerToken
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, "Updated Pine Timber Title");
      assert.equal(res.body.data.quantity, 80);
    });

    it("allows platform admin to update allowed fields on resources owned by others", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}`,
        { description: "Admin moderated description." },
        adminToken
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.data.description, "Admin moderated description.");
    });

    it("rejects non-owner non-admin user updating resource with 403 FORBIDDEN", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}`,
        { title: "Unauthorized Edit" },
        otherToken
      );

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, "FORBIDDEN");

      const reloaded = await Resource.findById(resource._id);
      assert.notEqual(reloaded.title, "Unauthorized Edit");
    });
  });

  // =========================================================================
  // 5. TERMINAL STATES EDIT PROTECTION (Section 9 & 21)
  // =========================================================================
  describe("5. Terminal States Edit Protection (409)", () => {
    const terminalStates = ["completed", "impact_recorded", "cancelled", "expired"];

    for (const termStatus of terminalStates) {
      it(`rejects edit attempts on '${termStatus}' resource with 409 and leaves record unchanged`, async () => {
        const resource = await createDummyResource({
          status: termStatus,
          title: `Original Title for ${termStatus}`,
        });

        const res = await api(
          "PUT",
          `/api/resources/${resource._id}`,
          { title: "Attempted Malicious Mutation", quantity: 999 },
          ownerToken
        );

        assert.equal(res.status, 409);
        assert.equal(res.body.error.code, "INVALID_STATUS");
        assert.equal(res.body.error.message, "This listing can no longer be edited");

        const reloaded = await Resource.findById(resource._id);
        assert.equal(reloaded.title, `Original Title for ${termStatus}`);
        assert.equal(reloaded.status, termStatus);
      });
    }
  });

  // =========================================================================
  // 6. FULL LIFECYCLE STATE MACHINE MATRIX (DB Plan Section 9.2)
  // =========================================================================
  describe("6. Complete DB Plan 9.2 Lifecycle Transitions Verification", () => {
    // Valid transitions table per DB Plan 9.2
    const validMatrix = [
      { from: "draft", action: "publish", to: "published", actorType: "owner" },
      { from: "draft", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "published", action: "markAvailable", to: "available", actorType: "system" },
      { from: "published", action: "match", to: "matched", actorType: "system" },
      { from: "published", action: "markUnavailable", to: "unavailable", actorType: "owner" },
      { from: "published", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "published", action: "expire", to: "expired", actorType: "system" },
      { from: "available", action: "match", to: "matched", actorType: "system" },
      { from: "available", action: "markUnavailable", to: "unavailable", actorType: "owner" },
      { from: "available", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "available", action: "expire", to: "expired", actorType: "system" },
      { from: "matched", action: "accept", to: "accepted", actorType: "owner" },
      { from: "matched", action: "reject", to: "available", actorType: "owner" },
      { from: "matched", action: "release", to: "available", actorType: "system" },
      { from: "matched", action: "markUnavailable", to: "unavailable", actorType: "owner" },
      { from: "matched", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "accepted", action: "startHandover", to: "in_handover", actorType: "system" },
      { from: "accepted", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "in_handover", action: "complete", to: "completed", actorType: "owner" },
      { from: "in_handover", action: "cancel", to: "cancelled", actorType: "owner" },
      { from: "completed", action: "logImpact", to: "impact_recorded", actorType: "system" },
      { from: "unavailable", action: "reopen", to: "available", actorType: "owner" },
      { from: "unavailable", action: "cancel", to: "cancelled", actorType: "owner" },
    ];

    for (const t of validMatrix) {
      it(`executes valid transition: ${t.from} -> [${t.action}] -> ${t.to} (${t.actorType})`, async () => {
        const resource = await createDummyResource({ status: t.from });
        const actor = t.actorType === "system" ? { role: "system" } : ownerUser;

        const transitioned = await transitionResource(resource, t.action, actor);
        assert.equal(transitioned.status, t.to);

        const reloaded = await Resource.findById(resource._id);
        assert.equal(reloaded.status, t.to);
      });
    }

    // Invalid transitions (must throw 409 with specific message)
    const invalidTransitions = [
      { from: "completed", action: "available" },
      { from: "completed", action: "publish" },
      { from: "cancelled", action: "reopen" },
      { from: "cancelled", action: "publish" },
      { from: "expired", action: "reopen" },
      { from: "expired", action: "publish" },
      { from: "impact_recorded", action: "cancel" },
      { from: "draft", action: "complete" },
      { from: "draft", action: "accept" },
      { from: "published", action: "complete" },
      { from: "in_handover", action: "publish" },
    ];

    for (const inv of invalidTransitions) {
      it(`rejects invalid transition ${inv.from} -> [${inv.action}] with 409 and specific message`, async () => {
        const resource = await createDummyResource({ status: inv.from });

        await assert.rejects(
          async () => {
            await transitionResource(resource, inv.action, ownerUser);
          },
          (err) => {
            assert.equal(err.statusCode, 409);
            assert.equal(err.code, "INVALID_TRANSITION");
            assert.ok(
              err.message.includes(`Invalid transition: ${inv.from} -> ${inv.action}`) ||
              err.message.includes(`Cannot transition resource in terminal state: '${inv.from}'`)
            );
            return true;
          }
        );
      });
    }

    // HTTP endpoint status transition verification
    it("PUT /api/resources/:id/status allows owner to publish a draft resource", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}/status`,
        { action: "publish" },
        ownerToken
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "published");
    });

    it("PUT /api/resources/:id/status returns 409 with specific lifecycle message on invalid transition", async () => {
      const resource = await createDummyResource({ status: "draft" });
      const res = await api(
        "PUT",
        `/api/resources/${resource._id}/status`,
        { action: "complete" },
        ownerToken
      );

      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, "INVALID_TRANSITION");
      assert.equal(res.body.error.message, "Invalid transition: draft -> complete");
    });
  });

  // =========================================================================
  // 7. SYSTEM-ONLY TRANSITIONS PROTECTION (Section 8)
  // =========================================================================
  describe("7. System-Only Actions Protection", () => {
    const systemOnlyActions = [
      { status: "published", action: "expire" },
      { status: "published", action: "match" },
      { status: "published", action: "markAvailable" },
      { status: "matched", action: "release" },
      { status: "accepted", action: "startHandover" },
      { status: "completed", action: "logImpact" },
    ];

    for (const { status, action } of systemOnlyActions) {
      it(`rejects normal user triggering system-only action '${action}' with 403`, async () => {
        const resource = await createDummyResource({ status });
        await assert.rejects(
          async () => {
            await transitionResource(resource, action, ownerUser);
          },
          (err) => {
            assert.equal(err.statusCode, 403);
            assert.equal(err.code, "FORBIDDEN");
            assert.equal(err.message, `Action '${action}' can only be triggered by the system.`);
            return true;
          }
        );
      });

      it(`rejects admin user triggering system-only action '${action}' with 403`, async () => {
        const resource = await createDummyResource({ status });
        await assert.rejects(
          async () => {
            await transitionResource(resource, action, adminUser);
          },
          (err) => {
            assert.equal(err.statusCode, 403);
            assert.equal(err.code, "FORBIDDEN");
            assert.equal(err.message, `Action '${action}' can only be triggered by the system.`);
            return true;
          }
        );
      });
    }

    it("allows system actor to execute system-only action 'expire'", async () => {
      const resource = await createDummyResource({ status: "published" });
      const transitioned = await transitionResource(resource, "expire", { role: "system" });
      assert.equal(transitioned.status, "expired");
    });
  });

  // =========================================================================
  // 8. QUERY PARAMETER SANITIZATION & SECURITY (Section 13)
  // =========================================================================
  describe("8. Query Parameter Sanitization & NoSQL Injection Protection", () => {
    it("rejects query containing MongoDB $ operator with 400 INVALID_QUERY", async () => {
      const res = await api("GET", "/api/resources?category[$ne]=null");
      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "INVALID_QUERY");
    });

    it("rejects query containing nested objects with 400 INVALID_QUERY", async () => {
      const res = await api("GET", "/api/resources?city[regex]=.*");
      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "INVALID_QUERY");
    });

    it("rejects invalid status parameter with 400 INVALID_STATUS", async () => {
      const res = await api("GET", "/api/resources?status=unknown_invalid_status");
      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "INVALID_STATUS");
    });

    it("rejects malformed categoryId in query with 400 and exact Category message", async () => {
      const res = await api("GET", "/api/resources?category=not-an-object-id");
      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, "INVALID_CATEGORY");
      assert.equal(res.body.error.message, "Category not found or inactive");
    });

    it("filters correctly by city, area, and category without passing raw req.query", async () => {
      await Resource.deleteMany({});
      const r1 = await createDummyResource({
        title: "Item in Amman Downtown",
        location: { city: "Amman", area: "Downtown" },
        status: "available",
      });
      const r2 = await createDummyResource({
        title: "Item in Zarqa",
        location: { city: "Zarqa", area: "Central" },
        status: "available",
      });

      const res = await api("GET", "/api/resources?city=Amman&area=Downtown");
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0]._id, String(r1._id));
    });
  });

  // =========================================================================
  // 9. DELETE / CANCEL CONTRACT VERIFICATION (Section 17)
  // =========================================================================
  describe("9. DELETE / Cancel Contract Verification", () => {
    it("DELETE /api/resources/:id does NOT delete document but transitions status to 'cancelled'", async () => {
      const resource = await createDummyResource({ status: "available" });
      const res = await api("DELETE", `/api/resources/${resource._id}`, null, ownerToken);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "cancelled");

      // Verify the document is STILL IN MONGODB
      const persisted = await Resource.findById(resource._id);
      assert.ok(persisted !== null, "Resource document was physically deleted!");
      assert.equal(persisted.status, "cancelled");
    });
  });
});
