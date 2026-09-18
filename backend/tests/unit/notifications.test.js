import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Report from "../../src/models/Report.js";
import Notification from "../../src/models/Notification.js";
import notificationService, {
  ALLOWED_NOTIFICATION_TYPES,
} from "../../src/services/notificationService.js";
import reportService from "../../src/services/reportService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("Task 4.C — Notifications Service & Integration Test Suite", () => {
  let server;
  let baseUrl;

  const reporterUserId = new mongoose.Types.ObjectId().toString();
  const adminUserId = new mongoose.Types.ObjectId().toString();
  const normalUserId = new mongoose.Types.ObjectId().toString();
  const validReportId = new mongoose.Types.ObjectId().toString();

  let reporterToken;
  let adminToken;
  let normalUserToken;

  before(async () => {
    reporterToken = jwt.sign({ sub: reporterUserId, role: "user" }, JWT_SECRET);
    adminToken = jwt.sign({ sub: adminUserId, role: "admin" }, JWT_SECRET);
    normalUserToken = jwt.sign({ sub: normalUserId, role: "user" }, JWT_SECRET);

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

    // Mock User.findById for auth middleware
    mock.method(User, "findById", (id) => {
      const strId = String(id);
      let user = null;
      if (strId === reporterUserId) {
        user = { _id: reporterUserId, role: "user", status: "active", name: "Reporter User" };
      } else if (strId === adminUserId) {
        user = { _id: adminUserId, role: "admin", status: "active", name: "Admin User" };
      } else if (strId === normalUserId) {
        user = { _id: normalUserId, role: "user", status: "active", name: "Normal User" };
      }
      return {
        ...user,
        lean: async () => user,
      };
    });
  });

  // =========================================================================
  // 1. notificationService.notify Unit Tests
  // =========================================================================
  describe("notificationService.notify(...) Core Invariants", () => {
    test("1 & 2. Valid notification creation: persists notification with all documented fields", async () => {
      let createdDoc = null;
      mock.method(Notification, "create", async (data) => {
        createdDoc = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
        };
        return createdDoc;
      });

      const recipientId = new mongoose.Types.ObjectId().toString();
      const entityId = new mongoose.Types.ObjectId().toString();

      const result = await notificationService.notify({
        recipientId,
        type: "report_resolved",
        title: "Report Resolved",
        message: "The issue has been handled by admin moderation.",
        relatedEntity: {
          type: "report",
          id: entityId,
        },
      });

      assert.ok(result);
      assert.equal(String(result.recipientId), recipientId);
      assert.equal(result.type, "report_resolved");
      assert.equal(result.title, "Report Resolved");
      assert.equal(result.message, "The issue has been handled by admin moderation.");
      assert.equal(result.readAt, null);
      assert.ok(result.createdAt instanceof Date);
      assert.deepEqual(result.relatedEntity, {
        type: "report",
        id: new mongoose.Types.ObjectId(entityId),
      });
    });

    test("Positional argument signature: supports notify(recipientId, type, title, message, relatedEntity)", async () => {
      let createdDoc = null;
      mock.method(Notification, "create", async (data) => {
        createdDoc = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
        };
        return createdDoc;
      });

      const recipientId = new mongoose.Types.ObjectId().toString();
      const result = await notificationService.notify(
        recipientId,
        "match_created",
        "New Match",
        "A match has been found.",
        { type: "match", id: new mongoose.Types.ObjectId().toString() }
      );

      assert.ok(result);
      assert.equal(String(result.recipientId), recipientId);
      assert.equal(result.type, "match_created");
      assert.equal(result.title, "New Match");
    });

    test("3. Invalid recipient ObjectId is rejected with HTTP 400", async () => {
      await assert.rejects(
        async () => {
          await notificationService.notify({
            recipientId: "invalid-id-format",
            type: "report_resolved",
            title: "Test",
            message: "Test message",
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "VALIDATION_ERROR");
          assert.match(err.message, /recipient ID/i);
          return true;
        }
      );
    });

    test("4. Missing required input (title/message/recipientId) is rejected with HTTP 400", async () => {
      const validRecipient = new mongoose.Types.ObjectId().toString();

      // Missing recipientId
      await assert.rejects(
        async () => {
          await notificationService.notify({
            type: "report_resolved",
            title: "Test",
            message: "Test message",
          });
        },
        { statusCode: 400, code: "VALIDATION_ERROR" }
      );

      // Missing title
      await assert.rejects(
        async () => {
          await notificationService.notify({
            recipientId: validRecipient,
            type: "report_resolved",
            title: "",
            message: "Test message",
          });
        },
        { statusCode: 400, code: "VALIDATION_ERROR" }
      );

      // Missing message
      await assert.rejects(
        async () => {
          await notificationService.notify({
            recipientId: validRecipient,
            type: "report_resolved",
            title: "Test",
            message: "   ",
          });
        },
        { statusCode: 400, code: "VALIDATION_ERROR" }
      );
    });

    test("5. Unsupported notification type is rejected with HTTP 400", async () => {
      const validRecipient = new mongoose.Types.ObjectId().toString();
      await assert.rejects(
        async () => {
          await notificationService.notify({
            recipientId: validRecipient,
            type: "unsupported_custom_type",
            title: "Test",
            message: "Test message",
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.equal(err.code, "VALIDATION_ERROR");
          assert.match(err.message, /notification type/i);
          return true;
        }
      );
    });

    test("6. Injection protection: arbitrary fields and MongoDB operators cannot enter Notification document", async () => {
      let passedPayload = null;
      mock.method(Notification, "create", async (data) => {
        passedPayload = data;
        return { _id: new mongoose.Types.ObjectId().toString(), ...data };
      });

      const validRecipient = new mongoose.Types.ObjectId().toString();
      await notificationService.notify({
        recipientId: validRecipient,
        type: "report_resolved",
        title: "Legitimate Title",
        message: "Legitimate Message",
        $where: "evil code",
        readAt: new Date("2020-01-01"), // Caller cannot force pre-read
        arbitraryField: "malicious payload",
      });

      assert.ok(passedPayload);
      assert.equal(passedPayload.$where, undefined);
      assert.equal(passedPayload.arbitraryField, undefined);
      assert.equal(passedPayload.readAt, null, "readAt must default to null upon creation");
    });
  });

  // =========================================================================
  // 2. Report Resolution Notification Integration Tests
  // =========================================================================
  describe("Report Resolution Notification Integration", () => {
    const createMockReportDoc = () => ({
      _id: validReportId,
      reporterId: reporterUserId,
      targetType: "user",
      targetId: new mongoose.Types.ObjectId().toString(),
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

    test("7, 8, & 9. Resolving report triggers expected notification to the reporter with correct payload", async () => {
      const mockDoc = createMockReportDoc();
      mock.method(Report, "findById", async () => mockDoc);

      let triggeredNotification = null;
      mock.method(notificationService, "notify", async (params) => {
        triggeredNotification = params;
        return { _id: new mongoose.Types.ObjectId().toString(), ...params };
      });

      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution: "The reported account has been suspended.",
        }),
      });

      assert.equal(res.status, 200);
      assert.ok(triggeredNotification, "notificationService.notify must be invoked on report resolution");
      assert.equal(String(triggeredNotification.recipientId), reporterUserId);
      assert.equal(triggeredNotification.type, "report_resolved");
      assert.equal(triggeredNotification.title, "Report Resolved");
      assert.match(triggeredNotification.message, /The reported account has been suspended/);
      assert.deepEqual(triggeredNotification.relatedEntity, {
        type: "report",
        id: validReportId,
      });
    });

    test("10. Non-admin resolve does NOT trigger notification and returns HTTP 403", async () => {
      const mockDoc = createMockReportDoc();
      mock.method(Report, "findById", async () => mockDoc);

      let notifyCalled = false;
      mock.method(notificationService, "notify", async () => {
        notifyCalled = true;
      });

      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${normalUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution: "Unauthorized attempt",
        }),
      });

      assert.equal(res.status, 403);
      assert.equal(notifyCalled, false);
    });

    test("11. Notification failure behavior: downstream notification failure propagates to error handler", async () => {
      const mockDoc = createMockReportDoc();
      mock.method(Report, "findById", async () => mockDoc);

      // Force notificationService.notify to fail
      mock.method(notificationService, "notify", async () => {
        throw Object.assign(new Error("Notification DB unavailable"), {
          statusCode: 500,
          code: "INTERNAL_ERROR",
        });
      });

      const res = await fetch(`${baseUrl}/api/reports/${validReportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution: "Account suspended.",
        }),
      });

      assert.equal(res.status, 500);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "INTERNAL_ERROR");
    });
  });

  // =========================================================================
  // 3. Engineer 3 Matching Integration Contract Tests
  // =========================================================================
  describe("Engineer 3 Matching Integration Contract Verification", () => {
    test("12. Verify notificationService.notify accepts match_created payload for Engineer 3 handoff", async () => {
      let createdDoc = null;
      mock.method(Notification, "create", async (data) => {
        createdDoc = { _id: new mongoose.Types.ObjectId().toString(), ...data };
        return createdDoc;
      });

      const seekerId = new mongoose.Types.ObjectId().toString();
      const matchId = new mongoose.Types.ObjectId().toString();

      // Engineer 3 contract invocation pattern
      const notification = await notificationService.notify({
        recipientId: seekerId,
        type: "match_created",
        title: "New Match Found",
        message: "A matching resource has been discovered for your request.",
        relatedEntity: {
          type: "match",
          id: matchId,
        },
      });

      assert.ok(notification);
      assert.equal(String(notification.recipientId), seekerId);
      assert.equal(notification.type, "match_created");
      assert.equal(notification.title, "New Match Found");
      assert.equal(String(notification.relatedEntity.id), matchId);
    });

    test("13. Verify notificationService.notify accepts match_accepted payload for match acceptance", async () => {
      let createdDoc = null;
      mock.method(Notification, "create", async (data) => {
        createdDoc = { _id: new mongoose.Types.ObjectId().toString(), ...data };
        return createdDoc;
      });

      const providerId = new mongoose.Types.ObjectId().toString();
      const matchId = new mongoose.Types.ObjectId().toString();

      const notification = await notificationService.notify({
        recipientId: providerId,
        type: "match_accepted",
        title: "Match Accepted",
        message: "Your match has been accepted and handover transfer is now in progress.",
        relatedEntity: {
          type: "match",
          id: matchId,
        },
      });

      assert.ok(notification);
      assert.equal(String(notification.recipientId), providerId);
      assert.equal(notification.type, "match_accepted");
      assert.equal(notification.title, "Match Accepted");
      assert.match(notification.message, /handover transfer/i);
      assert.equal(String(notification.relatedEntity.id), matchId);
    });

    test("Documented notification types completeness: all 4 documented types are permitted", () => {
      const expectedTypes = [
        "match_created",
        "match_accepted",
        "report_resolved",
        "org_verification_decided",
      ];
      assert.deepEqual(ALLOWED_NOTIFICATION_TYPES.sort(), expectedTypes.sort());
    });
  });
});
