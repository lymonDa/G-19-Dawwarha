import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "../../src/config/database.js";
import app from "../../src/app.js";

import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import Report from "../../src/models/Report.js";
import { requestModel } from "../../src/models/Request.js";

describe("TASK 4.F — Final Pre-Demo QA Validation Suite (Section 21 & Section 22)", () => {
  let server;
  let baseUrl;

  const runId = Date.now();
  const createdUserIds = [];

  let testUserToken;
  let testUser;

  before(async () => {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Register a valid user for authenticated QA tests
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Test User",
        email: `qa_${runId}@dawwarha.test`,
        password: "QAPassword123!",
      }),
    });
    const body = await res.json();
    testUser = body.data.user;
    testUserToken = body.data.token;
    createdUserIds.push(new mongoose.Types.ObjectId(testUser._id));
  });

  after(async () => {
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  // =========================================================================
  // QA 1 — Validation Strategy (Section 21 of Product Brief)
  // =========================================================================
  describe("QA 1: Payload Validation & Boundary Enforcement", () => {
    test("1.1 Registration rejects missing required fields with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Incomplete User" }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error);
    });

    test("1.2 Registration rejects invalid email format with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Bad Email",
          email: "not-an-email",
          password: "ValidPassword123!",
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error);
    });

    test("1.3 Request creation rejects negative or non-integer quantity with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Invalid Request",
          categoryId: new mongoose.Types.ObjectId().toString(),
          quantity: -5,
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test("1.4 Request creation rejects invalid Category ObjectId format with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Invalid Category ID",
          categoryId: "not-a-valid-mongo-id",
          quantity: 2,
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test("1.5 Report creation rejects invalid targetType enum with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "invalid_type",
          targetId: new mongoose.Types.ObjectId().toString(),
          reason: "spam",
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test("1.6 Report creation rejects non-existent target with HTTP 400 (TARGET_NOT_FOUND)", async () => {
      const nonExistentTargetId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: nonExistentTargetId,
          reason: "spam",
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "TARGET_NOT_FOUND");
    });

    test("1.7 Handover confirmation rejects invalid matchId parameter with HTTP 400", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/invalid-match-id-123/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "VALIDATION_ERROR");
    });
  });

  // =========================================================================
  // QA 2 — Authentication & Server-Side Authorization (Section 21)
  // =========================================================================
  describe("QA 2: Authentication & Server-Side Role Enforcement", () => {
    test("2.1 Unauthenticated requests to protected endpoints return HTTP 401", async () => {
      const endpoints = [
        { url: `${baseUrl}/api/users/me`, method: "GET" },
        { url: `${baseUrl}/api/organizations`, method: "POST" },
        { url: `${baseUrl}/api/requests`, method: "POST" },
        { url: `${baseUrl}/api/reports`, method: "POST" },
        { url: `${baseUrl}/api/reports`, method: "GET" },
        { url: `${baseUrl}/api/users/me/contributions`, method: "GET" },
        { url: `${baseUrl}/api/admin/analytics`, method: "GET" },
      ];

      for (const ep of endpoints) {
        const res = await fetch(ep.url, { method: ep.method });
        assert.equal(res.status, 401, `Endpoint ${ep.method} ${ep.url} should require authentication`);
        const body = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, "UNAUTHORIZED");
      }
    });

    test("2.2 Non-admin cannot access admin-only endpoints (HTTP 403 Forbidden)", async () => {
      const adminEndpoints = [
        { url: `${baseUrl}/api/reports`, method: "GET" },
        { url: `${baseUrl}/api/reports/${new mongoose.Types.ObjectId()}/resolve`, method: "PUT" },
        { url: `${baseUrl}/api/admin/analytics`, method: "GET" },
      ];

      for (const ep of adminEndpoints) {
        const res = await fetch(ep.url, {
          method: ep.method,
          headers: {
            Authorization: `Bearer ${testUserToken}`,
            "Content-Type": "application/json",
          },
          body: ep.method === "PUT" ? JSON.stringify({ status: "resolved", resolution: "Test" }) : undefined,
        });
        assert.equal(res.status, 403, `Admin endpoint ${ep.method} ${ep.url} should reject non-admin`);
        const body = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, "FORBIDDEN");
      }
    });

    test("2.3 Client cannot spoof role in body or query parameters", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics?role=admin`, {
        headers: {
          Authorization: `Bearer ${testUserToken}`,
        },
      });
      assert.equal(res.status, 403);
    });
  });

  // =========================================================================
  // QA 3 — Error Response Envelope & Security (Section 22)
  // =========================================================================
  describe("QA 3: Standardized Error Envelopes & Security Invariants", () => {
    test("3.1 Error responses conform to { success: false, error: { code, message } } envelope", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nonexistent@user.com", password: "WrongPassword123!" }),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error);
      assert.ok(body.error.code);
      assert.ok(body.error.message);
    });

    test("3.2 Raw MongoDB or internal stack traces are never exposed to clients", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${new mongoose.Types.ObjectId()}/confirm`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
        method: "POST",
      });
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "NOT_FOUND");
      assert.equal(body.stack, undefined);
    });
  });

  // =========================================================================
  // QA 4 — Database Integrity & Schema Invariants
  // =========================================================================
  describe("QA 4: Database Schema Invariants & Prohibitions", () => {
    test("4.1 Prohibited 'analytics' collection does NOT exist in Mongoose", () => {
      assert.equal(mongoose.models.Analytics, undefined);
      assert.equal(mongoose.models.analytics, undefined);
      assert.equal(mongoose.models.AdminAnalytics, undefined);
    });

    test("4.2 Handover collection enforces unique matchId index", () => {
      const matchIdIndex = Handover.schema.indexes().find((idx) => idx[0].matchId !== undefined);
      assert.ok(matchIdIndex);
      assert.equal(matchIdIndex[1].unique, true);
    });

    test("4.3 Contribution collection enforces unique handoverId index for duplicate prevention", () => {
      const handoverIdIndex = Contribution.schema.indexes().find((idx) => idx[0].handoverId !== undefined);
      assert.ok(handoverIdIndex);
      assert.equal(handoverIdIndex[1].unique, true);
    });
  });
});
