import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import requestModel from "../../src/models/Request.js";
import categoryRoutes from "../../src/routes/categories.routes.js";
import resourceRoutes from "../../src/routes/resources.routes.js";
import { buildResourceQuery } from "../../src/utils/resourceQueryBuilder.js";
import { generateMatches } from "../../src/services/matchingService.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const JWT_SECRET = "test_secret_for_engineer2_task2b_2c_tests_key!";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENGINEER 2 — TASK 2.B + TASK 2.C (Categories CRUD & Shared Query Builder)", () => {
  let mongo;
  let app;
  let server;
  let baseUrl;

  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;

  const sign = (user) =>
    jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    app = express();
    app.use(express.json());
    app.use("/api/categories", categoryRoutes);
    app.use("/api/resources", resourceRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    regularUser = await User.create({
      name: "Community Member",
      email: "member@example.com",
      passwordHash: "hash123",
      role: "user",
      status: "active",
    });
    regularToken = sign(regularUser);

    adminUser = await User.create({
      name: "Platform Admin",
      email: "admin.cat@example.com",
      passwordHash: "hash123",
      role: "admin",
      status: "active",
    });
    adminToken = sign(adminUser);
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

  // =========================================================================
  // TASK 2.B — CATEGORIES CRUD
  // =========================================================================
  describe("TASK 2.B — Categories API", () => {
    let createdCategoryId;

    it("GET /api/categories is publicly readable without authentication", async () => {
      await Category.create({
        name: "Books & Educational",
        slug: "books-educational",
        description: "Textbooks, novels, stationery",
        isActive: true,
      });

      const res = await api("GET", "/api/categories");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);
    });

    it("POST /api/categories rejects unauthenticated request with 401", async () => {
      const res = await api("POST", "/api/categories", { name: "Electronics" });
      assert.equal(res.status, 401);
    });

    it("POST /api/categories rejects non-admin regular user with 403 FORBIDDEN", async () => {
      const res = await api("POST", "/api/categories", { name: "Electronics" }, regularToken);
      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, "FORBIDDEN");
    });

    it("POST /api/categories allows admin to create category with auto-generated slug", async () => {
      const res = await api(
        "POST",
        "/api/categories",
        {
          name: "Home Furniture",
          description: "Sofas, tables, chairs, desks",
        },
        adminToken
      );

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, "Home Furniture");
      assert.equal(res.body.data.slug, "home-furniture");
      assert.equal(res.body.data.isActive, true);
      createdCategoryId = res.body.data._id;
    });

    it("POST /api/categories rejects duplicate category name with 409 DUPLICATE_RESOURCE", async () => {
      const res = await api(
        "POST",
        "/api/categories",
        { name: "home furniture" }, // Case-insensitive duplicate check
        adminToken
      );

      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, "DUPLICATE_RESOURCE");
    });

    it("POST /api/categories rejects invalid/empty name with 400", async () => {
      const res = await api("POST", "/api/categories", { name: " " }, adminToken);
      assert.equal(res.status, 400);
    });

    it("GET /api/categories/:id returns 200 for existing category", async () => {
      const res = await api("GET", `/api/categories/${createdCategoryId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data._id, createdCategoryId);
    });

    it("GET /api/categories/:id returns 400 for malformed ObjectId", async () => {
      const res = await api("GET", "/api/categories/malformed-id");
      assert.equal(res.status, 400);
      assert.ok(res.body.error.code === "INVALID_ID" || res.body.error.code === "VALIDATION_ERROR");
    });

    it("GET /api/categories/:id returns 404 for non-existent category", async () => {
      const nonExistent = new mongoose.Types.ObjectId();
      const res = await api("GET", `/api/categories/${nonExistent}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, "NOT_FOUND");
    });

    it("PUT /api/categories/:id rejects non-admin user with 403", async () => {
      const res = await api(
        "PUT",
        `/api/categories/${createdCategoryId}`,
        { name: "Unauthorized Edit" },
        regularToken
      );
      assert.equal(res.status, 403);
    });

    it("PUT /api/categories/:id allows admin to update name and description", async () => {
      const res = await api(
        "PUT",
        `/api/categories/${createdCategoryId}`,
        {
          name: "Modern Home Furniture",
          description: "Updated description for furniture",
        },
        adminToken
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, "Modern Home Furniture");
      assert.equal(res.body.data.slug, "modern-home-furniture");
      assert.equal(res.body.data.description, "Updated description for furniture");
    });

    it("DELETE /api/categories/:id rejects non-admin user with 403", async () => {
      const res = await api("DELETE", `/api/categories/${createdCategoryId}`, null, regularToken);
      assert.equal(res.status, 403);
    });

    it("DELETE /api/categories/:id executes SOFT DELETE (isActive = false) and document remains in DB", async () => {
      const res = await api("DELETE", `/api/categories/${createdCategoryId}`, null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isActive, false);

      // Verify category document STILL EXISTS in MongoDB!
      const persisted = await Category.findById(createdCategoryId);
      assert.ok(persisted !== null, "Category was physically deleted from database!");
      assert.equal(persisted.isActive, false);
    });

    it("GET /api/categories excludes deactivated categories by default", async () => {
      const res = await api("GET", "/api/categories");
      assert.equal(res.status, 200);
      const found = res.body.data.find((c) => String(c._id) === String(createdCategoryId));
      assert.equal(found, undefined, "Deactivated category was included in public default list");
    });

    it("GET /api/categories?isActive=false returns deactivated categories", async () => {
      const res = await api("GET", "/api/categories?isActive=false");
      assert.equal(res.status, 200);
      const found = res.body.data.find((c) => String(c._id) === String(createdCategoryId));
      assert.ok(found !== undefined, "Deactivated category not found in ?isActive=false query");
      assert.equal(found.isActive, false);
    });

    it("Resource creation rejects referencing deactivated category with exact 400 message", async () => {
      const payload = {
        title: "Teak Dining Table",
        description: "Solid wood dining table with 6 chairs",
        quantity: 1,
        categoryId: String(createdCategoryId), // Currently isActive = false
        location: { city: "Amman" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000).toISOString(),
          end: new Date(Date.now() + 86400000).toISOString(),
        },
      };

      const res = await api("POST", "/api/resources", payload, regularToken);
      assert.equal(res.status, 400);
      assert.match(res.body.error.message, /Category not found or inactive/i);
    });

    it("PUT /api/categories/:id allows admin to reactivate category (isActive = true)", async () => {
      const res = await api(
        "PUT",
        `/api/categories/${createdCategoryId}`,
        { isActive: true },
        adminToken
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.data.isActive, true);

      const reloaded = await Category.findById(createdCategoryId);
      assert.equal(reloaded.isActive, true);
    });
  });

  // =========================================================================
  // TASK 2.C — SHARED SEARCH/FILTER QUERY BUILDER
  // =========================================================================
  describe("TASK 2.C — Shared Search/Filter Query Builder (buildResourceQuery)", () => {
    const validCatId = new mongoose.Types.ObjectId().toString();

    it("builds default browsable filter when empty object passed", () => {
      const query = buildResourceQuery({});
      assert.deepEqual(query, {
        status: { $in: ["published", "available"] },
      });
    });

    it("builds categoryId filter safely from category or categoryId", () => {
      const q1 = buildResourceQuery({ category: validCatId });
      assert.equal(q1.categoryId, validCatId);
      assert.deepEqual(q1.status, { $in: ["published", "available"] });

      const q2 = buildResourceQuery({ categoryId: validCatId });
      assert.equal(q2.categoryId, validCatId);
    });

    it("builds location query using dot notation for compound index compatibility", () => {
      const q = buildResourceQuery({ city: "Amman", area: "Shmeisani" });
      assert.equal(q["location.city"], "Amman");
      assert.equal(q["location.area"], "Shmeisani");
      assert.deepEqual(q.status, { $in: ["published", "available"] });
    });

    it("combines category, location, and explicit status with AND semantics", () => {
      const q = buildResourceQuery({
        category: validCatId,
        city: "Zarqa",
        status: "available",
      });

      assert.equal(q.categoryId, validCatId);
      assert.equal(q["location.city"], "Zarqa");
      assert.equal(q.status, "available");
    });

    it("rejects invalid categoryId format with 400 'Category not found or inactive'", () => {
      assert.throws(
        () => buildResourceQuery({ category: "not-a-mongo-id" }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_CATEGORY");
          assert.equal(err.message, "Category not found or inactive");
          return true;
        }
      );
    });

    it("rejects invalid status parameter with 400 INVALID_STATUS", () => {
      assert.throws(
        () => buildResourceQuery({ status: "bogus_status" }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_STATUS");
          return true;
        }
      );
    });

    it("rejects query containing MongoDB $ operator in key or value with 400 INVALID_QUERY", () => {
      assert.throws(
        () => buildResourceQuery({ "category[$ne]": validCatId }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_QUERY");
          return true;
        }
      );

      assert.throws(
        () => buildResourceQuery({ city: "$where" }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_QUERY");
          return true;
        }
      );
    });

    it("rejects nested object injection with 400 INVALID_QUERY", () => {
      assert.throws(
        () => buildResourceQuery({ city: { $regex: ".*" } }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_QUERY");
          return true;
        }
      );
    });

    it("rejects unsupported arbitrary query parameters with 400 INVALID_QUERY", () => {
      assert.throws(
        () => buildResourceQuery({ adminOverride: true }),
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "INVALID_QUERY");
          return true;
        }
      );
    });

    it("is pure and does not mutate the input object", () => {
      const input = { city: "Irbid", status: "published" };
      const clone = { ...input };
      buildResourceQuery(input);
      assert.deepEqual(input, clone);
    });
  });

  // =========================================================================
  // INTEGRATION: GET /api/resources & matchingService.generateMatches
  // =========================================================================
  describe("TASK 2.C — Integrations", () => {
    let testCategory;
    let availableResource;
    let matchingRequest;

    before(async () => {
      testCategory = await Category.create({
        name: "Solar & Energy Surplus",
        slug: "solar-energy-surplus",
        isActive: true,
      });

      availableResource = await Resource.create({
        providerId: regularUser._id,
        categoryId: testCategory._id,
        title: "Solar Inverter 5kW",
        description: "Grid-tie inverter surplus from installation",
        quantity: 2,
        location: { city: "Amman", area: "Abdoun" },
        availabilityWindow: {
          start: new Date(Date.now() + 1000),
          end: new Date(Date.now() + 86400000),
        },
        status: "available",
      });

      matchingRequest = await requestModel.create({
        requesterId: regularUser._id,
        categoryId: testCategory._id,
        title: "Need Solar Inverter for Community Center",
        description: "Urgent need for power inverter",
        quantity: 1,
        location: { city: "Amman", area: "Abdoun" },
        urgency: "high",
        status: "published",
      });
    });

    it("GET /api/resources successfully consumes buildResourceQuery with filter params", async () => {
      const res = await api(
        "GET",
        `/api/resources?category=${testCategory._id}&city=Amman`
      );

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.length >= 1);
      assert.equal(res.body.data[0].title, "Solar Inverter 5kW");
    });

    it("matchingService.generateMatches successfully consumes buildResourceQuery for candidate retrieval", async () => {
      const matches = await generateMatches(availableResource._id);
      assert.ok(Array.isArray(matches));
      assert.ok(matches.length >= 1);
      assert.equal(String(matches[0].resourceId), String(availableResource._id));
      assert.equal(String(matches[0].requestId), String(matchingRequest._id));
      assert.ok(matches[0].score >= 0.5);
    });
  });
});
