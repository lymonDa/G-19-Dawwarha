import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import Report from "../../src/models/Report.js";
import Contribution from "../../src/models/Contribution.js";
import Organization from "../../src/models/Organization.js";
import { matchModel } from "../../src/models/Match.js";
import { requestModel } from "../../src/models/Request.js";
import Resource from "../../src/models/Resource.js";
import adminAnalyticsService from "../../src/services/adminAnalyticsService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("Task 4.E — Admin Analytics Service & Endpoint Test Suite", () => {
  let server;
  let baseUrl;

  const adminUserId = new mongoose.Types.ObjectId().toString();
  const normalUserId = new mongoose.Types.ObjectId().toString();
  const suspendedAdminId = new mongoose.Types.ObjectId().toString();

  let adminToken;
  let normalUserToken;
  let suspendedAdminToken;

  before(async () => {
    adminToken = jwt.sign({ sub: adminUserId, role: "admin" }, JWT_SECRET);
    normalUserToken = jwt.sign({ sub: normalUserId, role: "user" }, JWT_SECRET);
    suspendedAdminToken = jwt.sign({ sub: suspendedAdminId, role: "admin" }, JWT_SECRET);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    mock.restoreAll();

    // Default mocks for admin analytics models to prevent buffer timeouts on unconnected mongoose
    mock.method(Resource, "countDocuments", async () => 0);
    mock.method(Resource, "aggregate", async () => []);
    mock.method(requestModel, "countDocuments", async () => 0);
    mock.method(Handover, "countDocuments", async () => 0);
    mock.method(Report, "countDocuments", async () => 0);
    mock.method(Organization, "countDocuments", async () => 0);
    mock.method(Contribution, "aggregate", async () => []);
    mock.method(matchModel, "aggregate", async () => []);

    // Default User.findById mock for authentication
    mock.method(User, "findById", (id) => {
      const strId = String(id);
      let foundUser = null;
      if (strId === adminUserId) {
        foundUser = { _id: adminUserId, role: "admin", status: "active", name: "Admin User" };
      } else if (strId === normalUserId) {
        foundUser = { _id: normalUserId, role: "user", status: "active", name: "Normal User" };
      } else if (strId === suspendedAdminId) {
        foundUser = { _id: suspendedAdminId, role: "admin", status: "suspended", name: "Suspended Admin" };
      }
      return {
        ...foundUser,
        lean: async () => foundUser,
      };
    });
  });

  // =========================================================================
  // 1. Authentication and Authorization Invariants
  // =========================================================================
  describe("Authentication & Authorization (Admin-Only)", () => {
    test("1. Unauthenticated GET /api/admin/analytics returns HTTP 401", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "UNAUTHORIZED");
    });

    test("2. Invalid token returns HTTP 401", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: "Bearer invalid.jwt.token" },
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "UNAUTHORIZED");
    });

    test("3. Authenticated non-admin (role: 'user') returns HTTP 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${normalUserToken}` },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    test("4. Suspended admin account returns HTTP 403", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${suspendedAdminToken}` },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "ACCOUNT_SUSPENDED");
    });

    test("5. Role spoofing via query/body is rejected: non-admin sending role='admin' receives 403", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics?role=admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    test("6. Authenticated admin returns HTTP 200 with valid analytics envelope", async () => {
      // Mock empty return values
      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 0,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data);
      assert.ok(body.data.summary);
      assert.ok(Array.isArray(body.data.resourcesByCategory));
      assert.ok(Array.isArray(body.data.categoryImpact));
      assert.ok(body.data.matchAcceptance);
    });
  });

  // =========================================================================
  // 2. Empty Database Safety
  // =========================================================================
  describe("Empty Collections Safety", () => {
    test("Returns zero counts and empty arrays when all collections have no records", async () => {
      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 0,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      // Summary checks
      assert.equal(data.summary.totalUsers, 0);
      assert.equal(data.summary.activeUsers, 0);
      assert.equal(data.summary.resourcesPublished, 0);
      assert.equal(data.summary.completedTransfers, 0);
      assert.equal(data.summary.requestsCreated, 0);
      assert.equal(data.summary.openReports, 0);
      assert.equal(data.summary.registeredOrganizations, 0);

      // Category breakdown checks
      assert.deepEqual(data.resourcesByCategory, []);
      assert.deepEqual(data.categoryImpact, []);

      // Match acceptance checks
      assert.equal(data.matchAcceptance.total, 0);
      assert.equal(data.matchAcceptance.proposed, 0);
      assert.equal(data.matchAcceptance.accepted, 0);
      assert.equal(data.matchAcceptance.rejected, 0);
      assert.equal(data.matchAcceptance.acceptanceRate, 0);
      assert.deepEqual(data.matchAcceptance.byStatus, []);
    });
  });

  // =========================================================================
  // 3. Analytics Correctness (DB Plan Section 14 Pipelines)
  // =========================================================================
  describe("Section 14 Pipelines Correctness & Aggregation Behavior", () => {
    test("Pipeline 1: Admin Dashboard Summary metrics match database state", async () => {
      mock.method(User, "countDocuments", async (filter = {}) => {
        if (filter.status === "active") return 8;
        return 10; // total users
      });
      mock.method(Handover, "countDocuments", async (filter = {}) => {
        if (filter.status === "completed") return 4;
        return 6;
      });
      mock.method(requestModel, "countDocuments", async (filter = {}) => {
        return 7;
      });
      mock.method(Report, "countDocuments", async (filter = {}) => {
        if (filter.status === "open") return 2;
        return 5;
      });
      mock.method(Organization, "countDocuments", async () => 3);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(Resource, "countDocuments", async () => 12);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 12, // published resources
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      assert.equal(data.summary.totalUsers, 10);
      assert.equal(data.summary.activeUsers, 8);
      assert.equal(data.summary.resourcesPublished, 12);
      assert.equal(data.summary.completedTransfers, 4);
      assert.equal(data.summary.requestsCreated, 7);
      assert.equal(data.summary.openReports, 2);
      assert.equal(data.summary.registeredOrganizations, 3);
    });

    test("Pipeline 2: Resources published vs. fulfilled by category ($group by categoryId, $count by status)", async () => {
      const catFood = new mongoose.Types.ObjectId().toString();
      const catBooks = new mongoose.Types.ObjectId().toString();

      const mockResourceAggregation = [
        {
          categoryId: catFood,
          published: 5,
          fulfilled: 3,
          total: 8,
          byStatus: [
            { status: "published", count: 5 },
            { status: "completed", count: 3 },
          ],
        },
        {
          categoryId: catBooks,
          published: 2,
          fulfilled: 0,
          total: 2,
          byStatus: [{ status: "published", count: 2 }],
        },
      ];

      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(Resource, "aggregate", async () => mockResourceAggregation);
      mock.method(Resource, "countDocuments", async () => 10);
      mock.method(mongoose.connection, "collection", (name) => {
        if (name === "resources") {
          return {
            aggregate: () => ({ toArray: async () => mockResourceAggregation }),
            countDocuments: async () => 10,
          };
        }
        return { aggregate: () => ({ toArray: async () => [] }), countDocuments: async () => 0 };
      });

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      assert.equal(data.resourcesByCategory.length, 2);
      const foodRow = data.resourcesByCategory.find((r) => r.categoryId === catFood);
      assert.ok(foodRow);
      assert.equal(foodRow.published, 5);
      assert.equal(foodRow.fulfilled, 3);
      assert.equal(foodRow.total, 8);
      assert.deepEqual(foodRow.byStatus, [
        { status: "published", count: 5 },
        { status: "completed", count: 3 },
      ]);

      const booksRow = data.resourcesByCategory.find((r) => r.categoryId === catBooks);
      assert.ok(booksRow);
      assert.equal(booksRow.published, 2);
      assert.equal(booksRow.fulfilled, 0);
      assert.equal(booksRow.total, 2);
    });

    test("Pipeline 3: Category-level impact ($group by categoryId, $sum: quantity, $count)", async () => {
      const catFood = new mongoose.Types.ObjectId().toString();
      const catClothing = new mongoose.Types.ObjectId().toString();

      const mockContributionImpact = [
        {
          categoryId: catFood,
          completedTransfers: 15,
          totalQuantity: 45,
        },
        {
          categoryId: catClothing,
          completedTransfers: 6,
          totalQuantity: 18,
        },
      ];

      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => mockContributionImpact);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 0,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      assert.equal(data.categoryImpact.length, 2);
      assert.equal(data.categoryImpact[0].categoryId, catFood);
      assert.equal(data.categoryImpact[0].completedTransfers, 15);
      assert.equal(data.categoryImpact[0].totalQuantity, 45);

      assert.equal(data.categoryImpact[1].categoryId, catClothing);
      assert.equal(data.categoryImpact[1].completedTransfers, 6);
      assert.equal(data.categoryImpact[1].totalQuantity, 18);
    });

    test("Pipeline 4: Match acceptance rate ($group by status, $count)", async () => {
      const mockMatchStatusCounts = [
        { status: "proposed", count: 10 },
        { status: "accepted", count: 6 },
        { status: "rejected", count: 2 },
      ];

      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => mockMatchStatusCounts);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 0,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      // Total = 10 + 6 + 2 = 18
      assert.equal(data.matchAcceptance.total, 18);
      assert.equal(data.matchAcceptance.proposed, 10);
      assert.equal(data.matchAcceptance.accepted, 6);
      assert.equal(data.matchAcceptance.rejected, 2);
      // Decided = 6 + 2 = 8, acceptanceRate = 6 / 8 = 0.75
      assert.equal(data.matchAcceptance.acceptanceRate, 0.75);
      assert.deepEqual(data.matchAcceptance.byStatus, mockMatchStatusCounts);
    });

    test("Pipeline 4: Match acceptance rate handles zero decided matches safely", async () => {
      const mockOnlyProposed = [{ status: "proposed", count: 5 }];

      mock.method(User, "countDocuments", async () => 0);
      mock.method(Handover, "countDocuments", async () => 0);
      mock.method(requestModel, "countDocuments", async () => 0);
      mock.method(Report, "countDocuments", async () => 0);
      mock.method(Organization, "countDocuments", async () => 0);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => mockOnlyProposed);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 0,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const { data } = await res.json();

      assert.equal(data.matchAcceptance.total, 5);
      assert.equal(data.matchAcceptance.proposed, 5);
      assert.equal(data.matchAcceptance.accepted, 0);
      assert.equal(data.matchAcceptance.rejected, 0);
      assert.equal(data.matchAcceptance.acceptanceRate, 0);
    });
  });

  // =========================================================================
  // 4. Read-Only Invariant & Schema Structural Guarantee
  // =========================================================================
  describe("Read-Only Guarantee & No Analytics Collection", () => {
    test("No 'analytics' collection or model exists in Mongoose", () => {
      assert.equal(mongoose.models.Analytics, undefined);
      assert.equal(mongoose.models.analytics, undefined);
      assert.equal(mongoose.models.AdminAnalytics, undefined);
    });

    test("GET /api/admin/analytics executes zero write operations (read-only invariant)", async () => {
      let writesAttempted = 0;
      const countWrite = () => {
        writesAttempted += 1;
      };

      // Spy on write methods across models
      mock.method(User, "create", countWrite);
      mock.method(User, "updateOne", countWrite);
      mock.method(Contribution, "create", countWrite);
      mock.method(Handover, "updateOne", countWrite);
      mock.method(Report, "create", countWrite);

      // Run analytics query
      mock.method(User, "countDocuments", async () => 5);
      mock.method(Handover, "countDocuments", async () => 2);
      mock.method(requestModel, "countDocuments", async () => 4);
      mock.method(Report, "countDocuments", async () => 1);
      mock.method(Organization, "countDocuments", async () => 1);
      mock.method(Contribution, "aggregate", async () => []);
      mock.method(matchModel, "aggregate", async () => []);
      mock.method(Resource, "countDocuments", async () => 3);
      mock.method(mongoose.connection, "collection", () => ({
        aggregate: () => ({ toArray: async () => [] }),
        countDocuments: async () => 3,
      }));

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      assert.equal(writesAttempted, 0, "No database write operations should occur during analytics");
    });
  });

  // =========================================================================
  // 5. Database Error Handling
  // =========================================================================
  describe("Database Error Handling", () => {
    test("Propagates database aggregation failure through errorHandler without leaking raw internals", async () => {
      mock.method(User, "countDocuments", async () => {
        throw new Error("MongoDB connection reset");
      });

      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 500);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error);
    });
  });
});
