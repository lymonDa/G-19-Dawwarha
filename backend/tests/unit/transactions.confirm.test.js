import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import handoverService from "../../src/services/handoverService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("POST /api/transactions/:matchId/confirm (Step 1, Step 2, & Step 3)", () => {
  let server;
  let baseUrl;

  const providerUserId = new mongoose.Types.ObjectId().toString();
  const seekerUserId = new mongoose.Types.ObjectId().toString();
  const thirdUserId = new mongoose.Types.ObjectId().toString();
  const validMatchId = new mongoose.Types.ObjectId().toString();
  const handoverDocId = new mongoose.Types.ObjectId().toString();

  let providerToken;
  let seekerToken;
  let thirdUserToken;

  const createFakeHandover = () => ({
    _id: handoverDocId,
    matchId: validMatchId,
    resourceId: new mongoose.Types.ObjectId().toString(),
    requestId: new mongoose.Types.ObjectId().toString(),
    providerId: providerUserId,
    seekerId: seekerUserId,
    confirmedByProvider: false,
    confirmedBySeeker: false,
    status: "in_progress",
    completedAt: null,
  });

  before(async () => {
    providerToken = jwt.sign({ sub: providerUserId, role: "user" }, JWT_SECRET);
    seekerToken = jwt.sign({ sub: seekerUserId, role: "user" }, JWT_SECRET);
    thirdUserToken = jwt.sign({ sub: thirdUserId, role: "user" }, JWT_SECRET);

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
    // Default User.findById mock resolving active users
    mock.method(User, "findById", async (id) => {
      const strId = String(id);
      if (strId === providerUserId) {
        return { _id: providerUserId, role: "user", status: "active" };
      }
      if (strId === seekerUserId) {
        return { _id: seekerUserId, role: "user", status: "active" };
      }
      if (strId === thirdUserId) {
        return { _id: thirdUserId, role: "user", status: "active" };
      }
      return null;
    });
  });

  test("Test 1 — Provider confirmation: calls handoverService.confirm with (handover._id, 'provider', userId)", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let confirmArgs = null;
    mock.method(handoverService, "confirm", async (handoverId, side, userId) => {
      confirmArgs = { handoverId, side, userId };
      return { ...fakeHandover, confirmedByProvider: true };
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.confirmedByProvider, true);
    assert.deepEqual(confirmArgs, {
      handoverId: handoverDocId,
      side: "provider",
      userId: providerUserId,
    });
  });

  test("Test 2 — Seeker confirmation: calls handoverService.confirm with (handover._id, 'seeker', userId)", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let confirmArgs = null;
    mock.method(handoverService, "confirm", async (handoverId, side, userId) => {
      confirmArgs = { handoverId, side, userId };
      return { ...fakeHandover, confirmedBySeeker: true };
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.confirmedBySeeker, true);
    assert.deepEqual(confirmArgs, {
      handoverId: handoverDocId,
      side: "seeker",
      userId: seekerUserId,
    });
  });

  test("Test 3 — Non-party: returns 403 and does NOT call handoverService.confirm", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let serviceCalled = false;
    mock.method(handoverService, "confirm", async () => {
      serviceCalled = true;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${thirdUserToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "FORBIDDEN");
    assert.equal(serviceCalled, false);
  });

  test("Test 4 — Client-side spoofing: authenticated provider sending side='seeker' still passes 'provider'", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let passedSide = null;
    mock.method(handoverService, "confirm", async (handoverId, side) => {
      passedSide = side;
      return fakeHandover;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ side: "seeker" }),
    });

    assert.equal(res.status, 200);
    assert.equal(passedSide, "provider");
  });

  test("Test 5 — Client-side spoofing: authenticated seeker sending side='provider' still passes 'seeker'", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let passedSide = null;
    mock.method(handoverService, "confirm", async (handoverId, side) => {
      passedSide = side;
      return fakeHandover;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ side: "provider" }),
    });

    assert.equal(res.status, 200);
    assert.equal(passedSide, "seeker");
  });

  test("Test 6 — Invalid matchId: returns HTTP 400 and does NOT call service", async () => {
    let serviceCalled = false;
    mock.method(handoverService, "confirm", async () => { serviceCalled = true; });

    const res = await fetch(`${baseUrl}/api/transactions/not-a-valid-object-id/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.equal(serviceCalled, false);
  });

  test("Test 7 — Missing handover: returns HTTP 404 and does NOT call service", async () => {
    mock.method(Handover, "findOne", async () => null);

    let serviceCalled = false;
    mock.method(handoverService, "confirm", async () => { serviceCalled = true; });

    const nonExistentMatchId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/api/transactions/${nonExistentMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "NOT_FOUND");
    assert.equal(body.error.message, "No handover found for this match");
    assert.equal(serviceCalled, false);
  });

  test("Test 8 — Service error propagation: error thrown by service reaches errorHandler and propagates status", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    mock.method(handoverService, "confirm", async () => {
      const err = new Error("This handover is no longer active.");
      err.statusCode = 409;
      err.code = "HANDOVER_INACTIVE";
      throw err;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "HANDOVER_INACTIVE");
    assert.equal(body.error.message, "This handover is no longer active.");
  });

  test("Test 9 — Service called with correct ObjectId: first argument is handover._id, NOT matchId", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let receivedHandoverId = null;
    mock.method(handoverService, "confirm", async (handoverId) => {
      receivedHandoverId = handoverId;
      return fakeHandover;
    });

    await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(receivedHandoverId, handoverDocId);
    assert.notEqual(receivedHandoverId, validMatchId);
  });

  test("Test 10 — Authentication: unauthenticated requests return 401 and do not reach service", async () => {
    let serviceCalled = false;
    mock.method(handoverService, "confirm", async () => { serviceCalled = true; });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    assert.equal(res.status, 401);
    assert.equal(serviceCalled, false);
  });
});

describe("Real handoverService.confirm Integration Logic", () => {
  const providerId = new mongoose.Types.ObjectId().toString();
  const seekerId = new mongoose.Types.ObjectId().toString();
  const handoverId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mock.restoreAll();
  });

  test("Real Service: provider confirmation updates providerConfirmed without completing handover", async () => {
    const fakeHandoverDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      confirmedByProvider: false,
      confirmedBySeeker: false,
      providerConfirmedAt: null,
      seekerConfirmedAt: null,
      status: "in_progress",
      completedAt: null,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandoverDoc);

    const updated = await handoverService.confirm(handoverId, "provider", providerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.notEqual(updated.providerConfirmedAt, null);
    assert.equal(updated.confirmedBySeeker, false);
    assert.equal(updated.status, "in_progress");
    assert.equal(updated.completedAt, null);
  });

  test("Real Service: seeker confirmation subsequently completes the handover if provider confirmed", async () => {
    const fakeHandoverDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      providerConfirmedAt: new Date(),
      seekerConfirmedAt: null,
      status: "in_progress",
      completedAt: null,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandoverDoc);

    const updated = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.equal(updated.confirmedBySeeker, true);
    assert.notEqual(updated.seekerConfirmedAt, null);
    assert.equal(updated.status, "completed");
    assert.notEqual(updated.completedAt, null);
  });

  test("Real Service: duplicate confirmation is idempotent and does not overwrite timestamps", async () => {
    const originalProviderTime = new Date("2026-09-01T10:00:00Z");
    const fakeHandoverDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      providerConfirmedAt: originalProviderTime,
      seekerConfirmedAt: null,
      status: "in_progress",
      completedAt: null,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandoverDoc);

    const updated = await handoverService.confirm(handoverId, "provider", providerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.equal(updated.providerConfirmedAt.getTime(), originalProviderTime.getTime());
    assert.equal(updated.status, "in_progress");
  });

  test("Real Service: cancelled or no_show handover rejects with 409", async () => {
    const fakeCancelledDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      status: "cancelled",
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeCancelledDoc);

    await assert.rejects(
      async () => {
        await handoverService.confirm(handoverId, "provider", providerId);
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, "HANDOVER_INACTIVE");
        assert.equal(err.message, "This handover is no longer active.");
        return true;
      }
    );
  });
});
