import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Notification from "../../src/models/Notification.js";
import notificationService from "../../src/services/notificationService.js";
import { transitionVerification } from "../../src/services/organizationService.js";
import Organization from "../../src/models/Organization.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("BLK-02 — Notifications API & Triggers Test Suite", () => {
  let server;
  let baseUrl;

  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  let userAToken;
  let userBToken;

  before(async () => {
    userAToken = jwt.sign({ sub: userAId, role: "user" }, JWT_SECRET);
    userBToken = jwt.sign({ sub: userBId, role: "user" }, JWT_SECRET);

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

    mock.method(User, "findById", async (id) => {
      const strId = String(id);
      if (strId === userAId) return { _id: userAId, role: "user", status: "active" };
      if (strId === userBId) return { _id: userBId, role: "user", status: "active" };
      return null;
    });
  });

  test("1. Unauthenticated GET /api/notifications returns HTTP 401", async () => {
    const res = await fetch(`${baseUrl}/api/notifications`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test("2. Authenticated GET /api/notifications returns isolated notifications for req.user", async () => {
    const mockNotifications = [
      {
        _id: new mongoose.Types.ObjectId(),
        recipientId: userAId,
        type: "match_created",
        title: "Match 1",
        message: "Match message",
        readAt: null,
        createdAt: new Date(),
      },
    ];

    let queryArg = null;
    mock.method(Notification, "find", (query) => {
      queryArg = query;
      return {
        sort: () => ({
          skip: () => ({
            limit: async () => mockNotifications,
          }),
        }),
      };
    });
    mock.method(Notification, "countDocuments", async () => 1);

    const res = await fetch(`${baseUrl}/api/notifications?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.notifications.length, 1);
    assert.equal(body.data.pagination.total, 1);
    // User isolation: query recipientId must match userAId strictly
    assert.equal(String(queryArg.recipientId), userAId);
  });

  test("3. User isolation: client query cannot spoof another recipientId", async () => {
    let queryArg = null;
    mock.method(Notification, "find", (query) => {
      queryArg = query;
      return {
        sort: () => ({
          skip: () => ({
            limit: async () => [],
          }),
        }),
      };
    });
    mock.method(Notification, "countDocuments", async () => 0);

    // User A passes recipientId=userBId in query string
    const res = await fetch(`${baseUrl}/api/notifications?recipientId=${userBId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });

    assert.equal(res.status, 200);
    // Server ignores client-supplied recipientId and enforces req.user._id
    assert.equal(String(queryArg.recipientId), userAId);
    assert.notEqual(String(queryArg.recipientId), userBId);
  });

  test("4. Filtering: unreadOnly query sets readAt: null", async () => {
    let queryArg = null;
    mock.method(Notification, "find", (query) => {
      queryArg = query;
      return {
        sort: () => ({
          skip: () => ({
            limit: async () => [],
          }),
        }),
      };
    });
    mock.method(Notification, "countDocuments", async () => 0);

    const res = await fetch(`${baseUrl}/api/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });

    assert.equal(res.status, 200);
    assert.equal(queryArg.readAt, null);
  });

  test("5. PATCH /api/notifications/:id/read marks notification as read", async () => {
    const notifId = new mongoose.Types.ObjectId().toString();
    const fakeNotif = {
      _id: notifId,
      recipientId: userAId,
      readAt: null,
      async save() { return this; },
    };

    mock.method(Notification, "findOne", async (query) => {
      if (String(query._id) === notifId && String(query.recipientId) === userAId) {
        return fakeNotif;
      }
      return null;
    });

    const res = await fetch(`${baseUrl}/api/notifications/${notifId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${userAToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.notEqual(fakeNotif.readAt, null);
  });

  test("6. User isolation on mark read: User B cannot mark User A's notification as read (returns 404)", async () => {
    const notifId = new mongoose.Types.ObjectId().toString();

    mock.method(Notification, "findOne", async (query) => {
      if (String(query.recipientId) === userAId) {
        return { _id: notifId, recipientId: userAId };
      }
      return null;
    });

    const res = await fetch(`${baseUrl}/api/notifications/${notifId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${userBToken}` },
    });

    assert.equal(res.status, 404);
  });

  test("7. Trigger: organization verification emits org_verification_decided notification", async () => {
    const orgId = new mongoose.Types.ObjectId().toString();
    const fakeOrg = {
      _id: orgId,
      ownerUserId: userAId,
      verification: { status: "pending" },
      async save() { return this; },
    };

    mock.method(Organization, "findById", async () => fakeOrg);

    let emittedNotification = null;
    mock.method(notificationService, "notify", async (payload) => {
      emittedNotification = payload;
      return payload;
    });

    await transitionVerification(orgId, "approved", null, new mongoose.Types.ObjectId().toString());

    assert.ok(emittedNotification);
    assert.equal(emittedNotification.type, "org_verification_decided");
    assert.equal(String(emittedNotification.recipientId), userAId);
    assert.equal(emittedNotification.relatedEntity.type, "organization");
    assert.equal(String(emittedNotification.relatedEntity.id), orgId);
  });
});
