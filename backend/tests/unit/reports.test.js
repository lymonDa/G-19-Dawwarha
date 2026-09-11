import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Report from "../../src/models/Report.js";
import reportService from "../../src/services/reportService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("Task 4.B — Reports Service & Endpoints Test Suite", () => {
  let server;
  let baseUrl;

  const normalUserId = new mongoose.Types.ObjectId().toString();
  const secondUserId = new mongoose.Types.ObjectId().toString();
  const adminUserId = new mongoose.Types.ObjectId().toString();

  const existingTargetUserId = new mongoose.Types.ObjectId().toString();
  const existingResourceId = new mongoose.Types.ObjectId().toString();
  const existingRequestId = new mongoose.Types.ObjectId().toString();
  const missingTargetId = new mongoose.Types.ObjectId().toString();

  let normalUserToken;
  let adminToken;

  before(async () => {
    normalUserToken = jwt.sign({ sub: normalUserId, role: "user" }, JWT_SECRET);
    adminToken = jwt.sign({ sub: adminUserId, role: "admin" }, JWT_SECRET);

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

    // Default collection mock for un-modeled collections (resources, requests)
    mock.method(mongoose.connection, "collection", (name) => {
      return {
        findOne: async ({ _id }) => {
          const strId = String(_id);
          if (name === "resources" && strId === existingResourceId) {
            return { _id, title: "Mock Resource" };
          }
          if (name === "requests" && strId === existingRequestId) {
            return { _id, title: "Mock Request" };
          }
          return null;
        },
      };
    });

    // Default User.findById mock
    mock.method(User, "findById", (id) => {
      const strId = String(id);
      let foundUser = null;
      if (strId === normalUserId) {
        foundUser = { _id: normalUserId, role: "user", status: "active", name: "Normal User" };
      } else if (strId === secondUserId) {
        foundUser = { _id: secondUserId, role: "user", status: "active", name: "Second User" };
      } else if (strId === adminUserId) {
        foundUser = { _id: adminUserId, role: "admin", status: "active", name: "Admin User" };
      } else if (strId === existingTargetUserId) {
        foundUser = { _id: existingTargetUserId, role: "user", status: "active", name: "Target User" };
      }
      return {
        ...foundUser,
        lean: async () => foundUser,
      };
    });
  });

  // =========================================================================
  // STEP 3 & 4: Polymorphic Target Validation Unit Tests
  // =========================================================================
  describe("Polymorphic Target Validation (validateReportTarget)", () => {
    test("validateReportTarget: returns true for existing user target", async () => {
      const exists = await reportService.validateReportTarget("user", existingTargetUserId);
      assert.equal(exists, true);
    });

    test("validateReportTarget: returns false for non-existent user target", async () => {
      const exists = await reportService.validateReportTarget("user", missingTargetId);
      assert.equal(exists, false);
    });

    test("validateReportTarget: returns true for existing resource target in collection", async () => {
      mock.method(mongoose.connection, "collection", (name) => {
        if (name === "resources") {
          return {
            findOne: async ({ _id }) =>
              String(_id) === existingResourceId ? { _id, title: "Drill" } : null,
          };
        }
        return { findOne: async () => null };
      });

      const exists = await reportService.validateReportTarget("resource", existingResourceId);
      assert.equal(exists, true);
    });

    test("validateReportTarget: returns false for non-existent resource target in collection", async () => {
      mock.method(mongoose.connection, "collection", (name) => {
        if (name === "resources") {
          return {
            findOne: async ({ _id }) =>
              String(_id) === existingResourceId ? { _id, title: "Drill" } : null,
          };
        }
        return { findOne: async () => null };
      });

      const exists = await reportService.validateReportTarget("resource", missingTargetId);
      assert.equal(exists, false);
    });

    test("validateReportTarget: returns true for existing request target in collection", async () => {
      mock.method(mongoose.connection, "collection", (name) => {
        if (name === "requests") {
          return {
            findOne: async ({ _id }) =>
              String(_id) === existingRequestId ? { _id, title: "Need ladder" } : null,
          };
        }
        return { findOne: async () => null };
      });

      const exists = await reportService.validateReportTarget("request", existingRequestId);
      assert.equal(exists, true);
    });

    test("validateReportTarget: returns false for non-existent request target in collection", async () => {
      mock.method(mongoose.connection, "collection", (name) => {
        if (name === "requests") {
          return {
            findOne: async ({ _id }) =>
              String(_id) === existingRequestId ? { _id, title: "Need ladder" } : null,
          };
        }
        return { findOne: async () => null };
      });

      const exists = await reportService.validateReportTarget("request", missingTargetId);
      assert.equal(exists, false);
    });

    test("validateReportTarget: returns false for invalid targetType not in allow-list", async () => {
      const exists = await reportService.validateReportTarget("order", existingTargetUserId);
      assert.equal(exists, false);
    });

    test("validateReportTarget: returns false for invalid targetId format", async () => {
      const exists = await reportService.validateReportTarget("user", "not-a-valid-id");
      assert.equal(exists, false);
    });
  });

  // =========================================================================
  // STEP 5: POST /api/reports Tests
  // =========================================================================
  describe("POST /api/reports — Submission & Invariants", () => {
    test("1. Valid report creation: returns HTTP 201 and creates report with reporterId from auth token", async () => {
      let createdDoc = null;
      mock.method(Report, "create", async (data) => {
        createdDoc = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          status: "open",
          reviewedBy: null,
          resolution: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return createdDoc;
      });

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: existingTargetUserId,
          reason: "spam",
          description: "Sending repeated spam messages.",
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.targetType, "user");
      assert.equal(String(json.data.targetId), existingTargetUserId);
      assert.equal(String(json.data.reporterId), normalUserId);
      assert.equal(json.data.reason, "spam");
      assert.equal(json.data.status, "open");
    });

    test("2. Missing target document: returns HTTP 400 and creates NO report document", async () => {
      let createCalled = false;
      mock.method(Report, "create", async () => {
        createCalled = true;
        return {};
      });

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: missingTargetId,
          reason: "fraud",
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "TARGET_NOT_FOUND");
      assert.equal(createCalled, false, "Report.create MUST NOT be called when target does not exist");
    });

    test("3. Invalid targetType: returns HTTP 400 and creates NO report", async () => {
      let createCalled = false;
      mock.method(Report, "create", async () => {
        createCalled = true;
        return {};
      });

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "comment", // not in ['resource', 'request', 'user']
          targetId: existingTargetUserId,
          reason: "spam",
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "VALIDATION_ERROR");
      assert.equal(createCalled, false);
    });

    test("4. Invalid targetId format: returns HTTP 400 and creates NO report", async () => {
      let createCalled = false;
      mock.method(Report, "create", async () => {
        createCalled = true;
        return {};
      });

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: "not-a-valid-mongo-id",
          reason: "spam",
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "VALIDATION_ERROR");
      assert.equal(createCalled, false);
    });

    test("5. Unauthenticated POST: returns HTTP 401", async () => {
      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: existingTargetUserId,
          reason: "spam",
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "UNAUTHORIZED");
    });

    test("14. Reporter spoofing protection: client passing arbitrary reporterId in body is ignored", async () => {
      let passedReporterId = null;
      mock.method(Report, "create", async (data) => {
        passedReporterId = data.reporterId;
        return {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          status: "open",
        };
      });

      const spoofedReporterId = new mongoose.Types.ObjectId().toString();

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: existingTargetUserId,
          reason: "spam",
          reporterId: spoofedReporterId, // Attempted spoof
        }),
      });

      assert.equal(res.status, 201);
      assert.equal(String(passedReporterId), String(normalUserId));
      assert.notEqual(String(passedReporterId), spoofedReporterId);
    });

    test("16. No dangling report created after failed target validation", async () => {
      let createdDocs = 0;
      mock.method(Report, "create", async () => {
        createdDocs++;
        return {};
      });

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "resource",
          targetId: missingTargetId,
          reason: "safety",
        }),
      });

      assert.equal(res.status, 400);
      assert.equal(createdDocs, 0);
    });
  });

  // =========================================================================
  // STEP 6, 7 & 8: GET /api/reports Tests (Admin Only & List Security)
  // =========================================================================
  describe("GET /api/reports — Listing & Authorization", () => {
    test("6. Admin GET: returns HTTP 200 with reports list and pagination envelope", async () => {
      const mockReports = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          reporterId: normalUserId,
          targetType: "user",
          targetId: existingTargetUserId,
          reason: "spam",
          status: "open",
          createdAt: new Date(),
        },
      ];

      mock.method(Report, "find", () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => mockReports,
          }),
        }),
      }));
      mock.method(Report, "countDocuments", async () => 1);

      const res = await fetch(`${baseUrl}/api/reports`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(Array.isArray(json.data), true);
      assert.equal(json.data.length, 1);
      assert.deepEqual(json.pagination, {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    test("7. Non-admin GET: returns HTTP 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/reports`, {
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
        },
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FORBIDDEN");
    });

    test("8. Unauthenticated GET: returns HTTP 401 Unauthorized", async () => {
      const res = await fetch(`${baseUrl}/api/reports`);

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "UNAUTHORIZED");
    });

    test("13. Query injection protection: arbitrary mongo operators cannot be passed in query parameters", async () => {
      let passedFilter = null;
      mock.method(Report, "find", (filter) => {
        passedFilter = filter;
        return {
          sort: () => ({
            skip: () => ({
              limit: async () => [],
            }),
          }),
        };
      });
      mock.method(Report, "countDocuments", async () => 0);

      // Attempt Mongo operator injection via query string
      const res = await fetch(
        `${baseUrl}/api/reports?status[$ne]=closed&targetType[$regex]=.*&evilParam=123&$where=sleep(1000)`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      assert.equal(res.status, 200);
      // Verify passedFilter only contains whitelisted, validated fields
      assert.equal(passedFilter.evilParam, undefined);
      assert.equal(passedFilter.$where, undefined);
      // Because status[$ne] is an object, not allowed enum string, it must not be in filter
      assert.equal(passedFilter.status, undefined);
      assert.equal(passedFilter.targetType, undefined);
      assert.deepEqual(passedFilter, {});
    });
  });

  // =========================================================================
  // STEP 9 & 10: PUT /api/reports/:id/resolve Tests (Admin Resolution & Security)
  // =========================================================================
  describe("PUT /api/reports/:id/resolve — Resolution & Immutability", () => {
    const validReportId = new mongoose.Types.ObjectId().toString();

    const createMockReportDoc = () => ({
      _id: validReportId,
      reporterId: normalUserId,
      targetType: "user",
      targetId: existingTargetUserId,
      reason: "spam",
      description: "Old description",
      status: "open",
      reviewedBy: null,
      resolution: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      async save() {
        return this;
      },
    });

    test("9. Admin resolve: returns HTTP 200 and updates status, resolution, and reviewedBy", async () => {
      const mockDoc = createMockReportDoc();
      mock.method(Report, "findById", async () => mockDoc);

      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution: "User warned and temporary spam lock applied.",
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, "resolved");
      assert.equal(json.data.resolution, "User warned and temporary spam lock applied.");
      assert.equal(String(json.data.reviewedBy), adminUserId);
    });

    test("10. Non-admin resolve: returns HTTP 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: "I want to resolve this myself.",
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FORBIDDEN");
    });

    test("11. Unauthenticated resolve: returns HTTP 401 Unauthorized", async () => {
      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: "Anonymous resolve attempt",
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "UNAUTHORIZED");
    });

    test("12. Invalid report ID format: returns HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/reports/not-a-valid-id/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: "Valid resolution text",
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "VALIDATION_ERROR");
    });

    test("Missing report document in DB: returns HTTP 404", async () => {
      mock.method(Report, "findById", async () => null);

      const res = await fetch(`${baseUrl}/api/reports/${missingTargetId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: "Valid resolution text",
        }),
      });

      assert.equal(res.status, 404);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "REPORT_NOT_FOUND");
    });

    test("15. Immutable field protection: client cannot change targetType, targetId, reporterId, or createdAt during resolve", async () => {
      const mockDoc = createMockReportDoc();
      mock.method(Report, "findById", async () => mockDoc);

      const maliciousTargetId = new mongoose.Types.ObjectId().toString();
      const maliciousReporterId = new mongoose.Types.ObjectId().toString();

      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: "Legitimate resolution text",
          targetType: "request", // malicious change
          targetId: maliciousTargetId, // malicious change
          reporterId: maliciousReporterId, // malicious change
          createdAt: new Date("2099-01-01T00:00:00Z"), // malicious change
        }),
      });

      assert.equal(res.status, 200);
      // Immutable fields must remain unaltered
      assert.equal(mockDoc.targetType, "user");
      assert.equal(String(mockDoc.targetId), existingTargetUserId);
      assert.equal(String(mockDoc.reporterId), normalUserId);
      assert.equal(mockDoc.createdAt.toISOString(), "2026-01-01T00:00:00.000Z");
      // Document status and resolution should be updated
      assert.equal(mockDoc.status, "resolved");
      assert.equal(mockDoc.resolution, "Legitimate resolution text");
      assert.equal(String(mockDoc.reviewedBy), adminUserId);
    });
  });

  // =========================================================================
  // Model Pre-Save Hook Unit Tests
  // =========================================================================
  describe("Report Model Hook Invariants", () => {
    test("Pre-save validation requires reviewedBy and resolution when status !== 'open'", () => {
      const report = new Report({
        reporterId: new mongoose.Types.ObjectId(),
        targetType: "user",
        targetId: new mongoose.Types.ObjectId(),
        reason: "spam",
        status: "resolved",
      });

      // Calling pre-save hook with missing fields returns error
      let preSaveError = null;
      report.schema.s.hooks.execPre("save", report, [
        (err) => {
          preSaveError = err;
        },
      ]);
      assert.ok(preSaveError);
      assert.match(preSaveError.message, /reviewedBy is required/);
    });
  });
});
