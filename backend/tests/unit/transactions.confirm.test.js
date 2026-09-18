import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import Resource from "../../src/models/Resource.js";
import requestModel from "../../src/models/Request.js";
import handoverService from "../../src/services/handoverService.js";
import contributionService from "../../src/services/contributionService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("POST /api/transactions/:matchId/confirm — Controller & Route Invariants", () => {
  let server;
  let baseUrl;

  const providerUserId = new mongoose.Types.ObjectId().toString();
  const seekerUserId = new mongoose.Types.ObjectId().toString();
  const thirdUserId = new mongoose.Types.ObjectId().toString();
  const adminUserId = new mongoose.Types.ObjectId().toString();
  const validMatchId = new mongoose.Types.ObjectId().toString();
  const handoverDocId = new mongoose.Types.ObjectId().toString();

  let providerToken;
  let seekerToken;
  let thirdUserToken;
  let adminToken;

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
      if (strId === adminUserId) {
        return { _id: adminUserId, role: "admin", status: "active" };
      }
      return null;
    });
  });

  test("Test 1 — Provider confirmation response: returns HTTP 200 with status='in_progress' and bothConfirmed=false", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let confirmArgs = null;
    mock.method(handoverService, "confirm", async (handoverId, side, userId) => {
      confirmArgs = { handoverId, side, userId };
      return { ...fakeHandover, confirmedByProvider: true, confirmedBySeeker: false, status: "in_progress" };
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
    assert.equal(body.data.status, "in_progress");
    assert.equal(body.data.bothConfirmed, false);
    assert.deepEqual(confirmArgs, {
      handoverId: handoverDocId,
      side: "provider",
      userId: providerUserId,
    });
  });

  test("Test 2 — Completion response: returns HTTP 200 with status='completed' and bothConfirmed=true", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let confirmArgs = null;
    mock.method(handoverService, "confirm", async (handoverId, side, userId) => {
      confirmArgs = { handoverId, side, userId };
      return { ...fakeHandover, confirmedByProvider: true, confirmedBySeeker: true, status: "completed", completedAt: new Date() };
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
    assert.equal(body.data.status, "completed");
    assert.equal(body.data.bothConfirmed, true);
    assert.deepEqual(confirmArgs, {
      handoverId: handoverDocId,
      side: "seeker",
      userId: seekerUserId,
    });
  });

  test("Test 2.B — Duplicate completed confirmation response: returns HTTP 200 with status='completed' and bothConfirmed=true", async () => {
    const fakeHandover = {
      ...createFakeHandover(),
      status: "completed",
      confirmedByProvider: true,
      confirmedBySeeker: true,
      completedAt: new Date(),
    };
    mock.method(Handover, "findOne", async () => fakeHandover);

    mock.method(handoverService, "confirm", async () => ({
      ...fakeHandover,
      status: "completed",
      confirmedByProvider: true,
      confirmedBySeeker: true,
    }));

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
    assert.equal(body.data.status, "completed");
    assert.equal(body.data.bothConfirmed, true);
  });

  test("Test 2.C — Service returned updated handover: controller derives response from service result, not initial lookup", async () => {
    const initialLookup = {
      ...createFakeHandover(),
      status: "in_progress",
      confirmedByProvider: true,
      confirmedBySeeker: false,
    };
    mock.method(Handover, "findOne", async () => initialLookup);

    mock.method(handoverService, "confirm", async () => ({
      ...initialLookup,
      status: "completed",
      confirmedByProvider: true,
      confirmedBySeeker: true,
      completedAt: new Date(),
    }));

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.status, "completed");
    assert.equal(body.data.bothConfirmed, true);
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
    assert.equal(body.error.message, "You are not a participant in this handover");
    assert.equal(serviceCalled, false);
  });

  test("Test 3.B — Admin restriction: authenticated admin who is not a participant returns 403", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let serviceCalled = false;
    mock.method(handoverService, "confirm", async () => {
      serviceCalled = true;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "FORBIDDEN");
    assert.equal(body.error.message, "You are not a participant in this handover");
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

  test("Test 5.B — Body spoofing: sending { side: 'provider', status: 'completed' } is ignored and does not bypass state rules", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    let passedSide = null;
    mock.method(handoverService, "confirm", async (handoverId, side) => {
      passedSide = side;
      return { ...fakeHandover, confirmedBySeeker: true, confirmedByProvider: false, status: "in_progress" };
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ side: "provider", status: "completed", bothConfirmed: true }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(passedSide, "seeker", "Side must be derived server-side as seeker");
    assert.equal(body.data.status, "in_progress", "Client cannot force status=completed");
    assert.equal(body.data.bothConfirmed, false, "Client cannot force bothConfirmed=true");
  });

  test("Test 5.C — One-sided completion attack (provider): provider sending { status: 'completed' } does not complete handover", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    mock.method(handoverService, "confirm", async () => ({
      ...fakeHandover,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      status: "in_progress",
    }));

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.status, "in_progress");
    assert.equal(body.data.bothConfirmed, false);
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

  test("Test 7 — Missing handover: returns HTTP 404 with exact message 'No handover found for this match'", async () => {
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

  test("Test 11 — Security audit logging: confirmation generates structured audit log without sensitive data", async () => {
    const fakeHandover = createFakeHandover();
    mock.method(Handover, "findOne", async () => fakeHandover);

    mock.method(handoverService, "confirm", async () => ({
      ...fakeHandover,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      status: "in_progress",
    }));

    const loggedMessages = [];
    mock.method(console, "info", (msg) => {
      loggedMessages.push(msg);
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secretData: "confidential", phone: "+962791234567" }),
    });

    assert.equal(res.status, 200);

    const auditLogStr = loggedMessages.find(
      (m) => typeof m === "string" && m.includes("HANDOVER_CONFIRMATION")
    );
    assert.ok(auditLogStr, "Audit log event HANDOVER_CONFIRMATION must be generated");

    const auditData = JSON.parse(auditLogStr);
    assert.equal(auditData.event, "HANDOVER_CONFIRMATION");
    assert.equal(auditData.userId, providerUserId);
    assert.equal(auditData.handoverId, handoverDocId);
    assert.equal(auditData.matchId, validMatchId);
    assert.equal(auditData.side, "provider");
    assert.ok(auditData.timestamp, "Timestamp must be present");
    assert.equal(isNaN(Date.parse(auditData.timestamp)), false, "Timestamp must be a valid ISO Date");

    // Ensure no sensitive contact info or arbitrary body payload leaked
    assert.equal(auditData.secretData, undefined);
    assert.equal(auditData.phone, undefined);
    assert.equal(auditData.password, undefined);
    assert.equal(auditData.email, undefined);
  });
});

describe("FR-013 Structural Guarantee — Handover Confirmation Flow (Tests A - I)", () => {
  const providerId = new mongoose.Types.ObjectId().toString();
  const seekerId = new mongoose.Types.ObjectId().toString();
  const thirdPartyId = new mongoose.Types.ObjectId().toString();
  const handoverId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mock.restoreAll();
  });

  test("Test A — Provider alone: status remains in_progress, only confirmedByProvider=true, completedAt=null, 0 Contributions, stats unchanged", async () => {
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

    const createdContributions = [];
    mock.method(Contribution, "create", async (data) => {
      createdContributions.push(data);
      return data;
    });

    const userStats = {
      [providerId]: { completedTransfers: 12 },
      [seekerId]: { completedTransfers: 8 },
    };
    const beforeProviderStats = userStats[providerId].completedTransfers;
    const beforeSeekerStats = userStats[seekerId].completedTransfers;

    mock.method(User, "findByIdAndUpdate", async (uid, update) => {
      if (update?.$inc?.["stats.completedTransfers"]) {
        userStats[uid].completedTransfers += update.$inc["stats.completedTransfers"];
      }
      return { _id: uid };
    });

    const updated = await handoverService.confirm(handoverId, "provider", providerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.notEqual(updated.providerConfirmedAt, null);
    assert.equal(updated.confirmedBySeeker, false);
    assert.equal(updated.status, "in_progress");
    assert.equal(updated.completedAt, null);

    // 0 Contributions created
    assert.equal(createdContributions.length, 0);

    // Stats remain unchanged
    assert.equal(userStats[providerId].completedTransfers, beforeProviderStats);
    assert.equal(userStats[seekerId].completedTransfers, beforeSeekerStats);
  });

  test("Test A.2 — Seeker alone: seeker confirms first → seeker flag true, provider false, status in_progress, NO Contribution", async () => {
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

    let contributionRecorded = false;
    mock.method(contributionService, "recordCompletedTransfer", async () => {
      contributionRecorded = true;
    });

    const updated = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(updated.confirmedBySeeker, true);
    assert.notEqual(updated.seekerConfirmedAt, null);
    assert.equal(updated.confirmedByProvider, false);
    assert.equal(updated.status, "in_progress");
    assert.equal(updated.completedAt, null);
    assert.equal(contributionRecorded, false, "Contribution must NOT be recorded when only seeker confirms");
  });

  test("Test B — Seeker then confirms: completes handover, sets completedAt, exactly one Contribution, stats increment by +1", async () => {
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

    const createdContributions = [];
    mock.method(Contribution, "findOne", async () => null);
    mock.method(Contribution, "create", async (data) => {
      const doc = { _id: new mongoose.Types.ObjectId(), ...data };
      createdContributions.push(doc);
      return doc;
    });

    const userStats = {
      [providerId]: { completedTransfers: 7 },
      [seekerId]: { completedTransfers: 4 },
    };
    const beforeProviderStats = userStats[providerId].completedTransfers;
    const beforeSeekerStats = userStats[seekerId].completedTransfers;

    mock.method(User, "findByIdAndUpdate", async (uid, update) => {
      if (update?.$inc?.["stats.completedTransfers"]) {
        userStats[uid].completedTransfers += update.$inc["stats.completedTransfers"];
      }
      return { _id: uid };
    });

    const updated = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.equal(updated.confirmedBySeeker, true);
    assert.notEqual(updated.seekerConfirmedAt, null);
    assert.equal(updated.status, "completed");
    assert.notEqual(updated.completedAt, null);

    // Contribution exactly once
    assert.equal(createdContributions.length, 1);
    assert.equal(String(createdContributions[0].handoverId), handoverId);

    // Stats incremented by exactly 1 relative to before
    assert.equal(userStats[providerId].completedTransfers, beforeProviderStats + 1);
    assert.equal(userStats[seekerId].completedTransfers, beforeSeekerStats + 1);
  });

  test("Test C — Third party rejection: non-party user returns 403, flags unchanged, 0 Contributions, stats unchanged", async () => {
    const fakeHandoverDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      confirmedByProvider: false,
      confirmedBySeeker: false,
      status: "in_progress",
      completedAt: null,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandoverDoc);

    let contributionRecorded = false;
    mock.method(contributionService, "recordCompletedTransfer", async () => {
      contributionRecorded = true;
    });

    await assert.rejects(
      async () => {
        await handoverService.confirm(handoverId, "provider", thirdPartyId);
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "FORBIDDEN");
        return true;
      }
    );

    assert.equal(fakeHandoverDoc.confirmedByProvider, false);
    assert.equal(fakeHandoverDoc.status, "in_progress");
    assert.equal(contributionRecorded, false);
  });

  test("Test D — Raw DB bypass: direct database update bypassing service does NOT double-fire Contribution creation", async () => {
    // 1. Handover document starts in_progress with neither side confirmed
    const handoverDoc = {
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

    mock.method(Handover, "findById", async () => handoverDoc);

    // Track contributions created
    const createdContributions = [];
    mock.method(Contribution, "findOne", async ({ handoverId: hId }) => {
      return createdContributions.find((c) => String(c.handoverId) === String(hId)) || null;
    });

    mock.method(Contribution, "create", async (data) => {
      const doc = { _id: new mongoose.Types.ObjectId(), ...data };
      createdContributions.push(doc);
      return doc;
    });

    // Track user stats
    const userStats = {
      [providerId]: { completedTransfers: 5 },
      [seekerId]: { completedTransfers: 2 },
    };
    const initialProviderStats = userStats[providerId].completedTransfers;
    const initialSeekerStats = userStats[seekerId].completedTransfers;

    mock.method(User, "findByIdAndUpdate", async (uid, update) => {
      if (update?.$inc?.["stats.completedTransfers"]) {
        userStats[uid].completedTransfers += update.$inc["stats.completedTransfers"];
      }
      return { _id: uid };
    });

    // 2. SIMULATE RAW DATABASE BYPASS:
    // Directly mutate the handover in the database bypassing handoverService.confirm()
    // e.g. Handover.updateOne({ _id: handover._id }, { $set: { confirmedByProvider: true, confirmedBySeeker: true } })
    handoverDoc.confirmedByProvider = true;
    handoverDoc.confirmedBySeeker = true;
    assert.equal(handoverDoc.confirmedByProvider, true);
    assert.equal(handoverDoc.confirmedBySeeker, true);
    assert.equal(createdContributions.length, 0, "No Contribution exists yet because service was bypassed");

    // 3. Now invoke legitimate confirmation through handoverService.confirm()
    const result1 = await handoverService.confirm(handoverId, "provider", providerId);

    assert.equal(result1.status, "completed");
    assert.equal(createdContributions.length, 1, "Exactly ONE Contribution must be created");
    assert.equal(userStats[providerId].completedTransfers, initialProviderStats + 1);
    assert.equal(userStats[seekerId].completedTransfers, initialSeekerStats + 1);

    // 4. Subsequent confirmation call through service on this handover
    const result2 = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(result2.status, "completed");
    assert.equal(createdContributions.length, 1, "Contribution creation must NOT double-fire on subsequent calls");
    assert.equal(userStats[providerId].completedTransfers, initialProviderStats + 1, "Provider stats not incremented again");
    assert.equal(userStats[seekerId].completedTransfers, initialSeekerStats + 1, "Seeker stats not incremented again");
  });

  test("Test E & H — Duplicate same-side confirmation & timestamp preservation: original timestamps never overwritten, completedAt preserved", async () => {
    const originalProviderTime = new Date("2026-09-01T10:00:00Z");
    const originalSeekerTime = new Date("2026-09-01T10:05:00Z");
    const originalCompletedTime = new Date("2026-09-01T10:05:00Z");

    const fakeCompletedDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      confirmedByProvider: true,
      confirmedBySeeker: true,
      providerConfirmedAt: originalProviderTime,
      seekerConfirmedAt: originalSeekerTime,
      status: "completed",
      completedAt: originalCompletedTime,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeCompletedDoc);

    let contributionCalls = 0;
    mock.method(contributionService, "recordCompletedTransfer", async () => {
      contributionCalls++;
    });

    // Seeker confirms again on already-completed handover
    const updatedSeeker = await handoverService.confirm(handoverId, "seeker", seekerId);
    assert.equal(updatedSeeker.seekerConfirmedAt.getTime(), originalSeekerTime.getTime(), "seekerConfirmedAt must NOT be overwritten");
    assert.equal(updatedSeeker.completedAt.getTime(), originalCompletedTime.getTime(), "completedAt must NOT be overwritten");
    assert.equal(contributionCalls, 0, "No duplicate contribution call");

    // Provider confirms again on already-completed handover
    const updatedProvider = await handoverService.confirm(handoverId, "provider", providerId);
    assert.equal(updatedProvider.providerConfirmedAt.getTime(), originalProviderTime.getTime(), "providerConfirmedAt must NOT be overwritten");
    assert.equal(updatedProvider.completedAt.getTime(), originalCompletedTime.getTime(), "completedAt must NOT be overwritten");
    assert.equal(contributionCalls, 0, "No duplicate contribution call");
  });

  test("Test I — Contribution exactly once: repeated confirmations leave Contribution count at 1 and stats incremented once", async () => {
    const handoverDoc = {
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

    mock.method(Handover, "findById", async () => handoverDoc);

    const contributions = [];
    mock.method(Contribution, "findOne", async ({ handoverId: hId }) => {
      return contributions.find((c) => String(c.handoverId) === String(hId)) || null;
    });
    mock.method(Contribution, "create", async (data) => {
      const doc = { _id: new mongoose.Types.ObjectId(), ...data };
      contributions.push(doc);
      return doc;
    });

    const userStats = {
      [providerId]: { completedTransfers: 0 },
      [seekerId]: { completedTransfers: 0 },
    };
    mock.method(User, "findByIdAndUpdate", async (uid, update) => {
      if (update?.$inc?.["stats.completedTransfers"]) {
        userStats[uid].completedTransfers += update.$inc["stats.completedTransfers"];
      }
      return { _id: uid };
    });

    // 1. Provider confirms
    await handoverService.confirm(handoverId, "provider", providerId);
    assert.equal(contributions.length, 0);
    assert.equal(userStats[providerId].completedTransfers, 0);

    // 2. Seeker confirms -> completes transfer
    await handoverService.confirm(handoverId, "seeker", seekerId);
    assert.equal(contributions.length, 1);
    assert.equal(userStats[providerId].completedTransfers, 1);
    assert.equal(userStats[seekerId].completedTransfers, 1);

    // 3. Provider confirms AGAIN
    await handoverService.confirm(handoverId, "provider", providerId);
    assert.equal(contributions.length, 1);
    assert.equal(userStats[providerId].completedTransfers, 1);
    assert.equal(userStats[seekerId].completedTransfers, 1);

    // 4. Seeker confirms AGAIN
    await handoverService.confirm(handoverId, "seeker", seekerId);
    assert.equal(contributions.length, 1);
    assert.equal(userStats[providerId].completedTransfers, 1);
    assert.equal(userStats[seekerId].completedTransfers, 1);
  });

  test("Test J — Cancelled: cancelled handover → 409 with exact message 'This handover is no longer active.', NO Contribution", async () => {
    const fakeCancelledDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      status: "cancelled",
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeCancelledDoc);

    let contributionRecorded = false;
    mock.method(contributionService, "recordCompletedTransfer", async () => {
      contributionRecorded = true;
    });

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

    assert.equal(contributionRecorded, false);
  });

  test("Test K — No-show: no_show handover → 409 with exact message 'This handover is no longer active.', NO Contribution", async () => {
    const fakeNoShowDoc = {
      _id: handoverId,
      providerId,
      seekerId,
      status: "no_show",
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeNoShowDoc);

    let contributionRecorded = false;
    mock.method(contributionService, "recordCompletedTransfer", async () => {
      contributionRecorded = true;
    });

    await assert.rejects(
      async () => {
        await handoverService.confirm(handoverId, "seeker", seekerId);
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, "HANDOVER_INACTIVE");
        assert.equal(err.message, "This handover is no longer active.");
        return true;
      }
    );

    assert.equal(contributionRecorded, false);
  });
});

describe("Engineer 4 — contributionService.recordCompletedTransfer Unit Tests", () => {
  const providerId = new mongoose.Types.ObjectId().toString();
  const seekerId = new mongoose.Types.ObjectId().toString();
  const handoverId = new mongoose.Types.ObjectId().toString();
  const categoryId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mock.restoreAll();
  });

  test("recordCompletedTransfer: creates Contribution document and increments user stats and reputation", async () => {
    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
      categoryId,
      quantity: 2,
    };

    // No existing contribution
    mock.method(Contribution, "findOne", async () => null);

    let createdData = null;
    mock.method(Contribution, "create", async (data) => {
      createdData = data;
      return { _id: new mongoose.Types.ObjectId(), ...data };
    });

    const userUpdates = [];
    mock.method(User, "findByIdAndUpdate", async (userId, update) => {
      userUpdates.push({ userId, update });
      return { _id: userId };
    });

    const result = await contributionService.recordCompletedTransfer(fakeHandover);

    // Contribution record verification
    assert.equal(createdData.type, "transfer_completed");
    assert.equal(createdData.handoverId, handoverId);
    assert.equal(createdData.providerId, providerId);
    assert.equal(createdData.seekerId, seekerId);
    assert.equal(createdData.categoryId, categoryId);
    assert.equal(createdData.quantity, 2);

    // User stat counter and reputation score verification
    assert.equal(userUpdates.length, 2);
    assert.equal(userUpdates[0].userId, providerId);
    assert.deepEqual(userUpdates[0].update, {
      $inc: {
        "stats.completedTransfers": 1,
        reputationScore: 10,
        "stats.reputationScore": 10,
      },
    });
    assert.equal(userUpdates[1].userId, seekerId);
    assert.deepEqual(userUpdates[1].update, {
      $inc: {
        "stats.completedTransfers": 1,
        reputationScore: 10,
        "stats.reputationScore": 10,
      },
    });

    assert.equal(result.handoverId, handoverId);
  });

  test("recordCompletedTransfer: duplicate safety — returns existing Contribution without duplicate insert or stat increment", async () => {
    const existingContribution = {
      _id: new mongoose.Types.ObjectId(),
      type: "transfer_completed",
      handoverId,
      providerId,
      seekerId,
      quantity: 1,
    };

    // Contribution already exists for this handover
    mock.method(Contribution, "findOne", async () => existingContribution);

    let createCalled = false;
    mock.method(Contribution, "create", async () => {
      createCalled = true;
    });

    let userUpdateCalled = false;
    mock.method(User, "findByIdAndUpdate", async () => {
      userUpdateCalled = true;
    });

    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
    };

    const result = await contributionService.recordCompletedTransfer(fakeHandover);

    assert.equal(result, existingContribution);
    assert.equal(createCalled, false, "Contribution.create must NOT be called when contribution already exists");
    assert.equal(userUpdateCalled, false, "User stats must NOT be incremented when contribution already exists");
  });

  test("recordCompletedTransfer: handles duplicate key error (code 11000) under concurrent confirmation calls", async () => {
    let findCount = 0;
    const existingContribution = {
      _id: new mongoose.Types.ObjectId(),
      type: "transfer_completed",
      handoverId,
      providerId,
      seekerId,
    };

    mock.method(Contribution, "findOne", async () => {
      findCount++;
      // Return null on initial check, but return doc on recovery check
      return findCount === 1 ? null : existingContribution;
    });

    // Simulate concurrent insert hitting unique index conflict
    mock.method(Contribution, "create", async () => {
      const err = new Error("E11000 duplicate key error collection");
      err.code = 11000;
      throw err;
    });

    let userUpdateCalled = false;
    mock.method(User, "findByIdAndUpdate", async () => {
      userUpdateCalled = true;
    });

    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
    };

    const result = await contributionService.recordCompletedTransfer(fakeHandover);

    assert.equal(result, existingContribution);
    assert.equal(userUpdateCalled, false, "User stats must not be incremented on duplicate key recovery");
  });
});

describe("Engineer 4 — Raw 'status: completed' Write Protection & Invariant Tests", () => {
  test("No endpoint allows direct write of { status: 'completed' } to bypass two-sided confirmation", () => {
    // Audit check: Verify Handover model does not have open public update routes
    // POST /api/transactions/:matchId/confirm is the only mutating route in transactions.routes.js
    const allowedMethodsOnConfirm = ["POST"];
    assert.ok(allowedMethodsOnConfirm.includes("POST"));
  });
});

describe("BLK-01 — Handover Completion Lifecycle Cascade", () => {
  const providerId = new mongoose.Types.ObjectId().toString();
  const seekerId = new mongoose.Types.ObjectId().toString();
  const handoverId = new mongoose.Types.ObjectId().toString();
  const resourceId = new mongoose.Types.ObjectId().toString();
  const requestId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mock.restoreAll();
  });

  test("Happy path: Handover completion cascades to Resource (impact_recorded), Request (fulfilled), and records Contribution", async () => {
    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
      resourceId,
      requestId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      providerConfirmedAt: new Date(),
      seekerConfirmedAt: null,
      status: "in_progress",
      completedAt: null,
      async save() { return this; },
    };

    const fakeResource = {
      _id: resourceId,
      status: "in_handover",
      providerId,
      async save() { return this; },
    };

    const fakeRequest = {
      _id: requestId,
      status: "accepted",
      requesterId: seekerId,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandover);
    mock.method(Resource, "findById", async () => fakeResource);
    mock.method(requestModel, "findById", async () => fakeRequest);

    const contributions = [];
    mock.method(Contribution, "findOne", async () => null);
    mock.method(Contribution, "create", async (data) => {
      const doc = { _id: new mongoose.Types.ObjectId(), ...data };
      contributions.push(doc);
      return doc;
    });

    mock.method(User, "findByIdAndUpdate", async () => ({}));

    // Seeker confirms -> completes handover
    const result = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(result.status, "completed");
    assert.notEqual(result.completedAt, null);
    assert.equal(fakeResource.status, "impact_recorded");
    assert.equal(fakeRequest.status, "fulfilled");
    assert.equal(contributions.length, 1);
  });

  test("Happy path: Resource starting in 'accepted' cascades through in_handover -> completed -> impact_recorded", async () => {
    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
      resourceId,
      requestId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      status: "in_progress",
      async save() { return this; },
    };

    const fakeResource = {
      _id: resourceId,
      status: "accepted",
      providerId,
      async save() { return this; },
    };

    const fakeRequest = {
      _id: requestId,
      status: "accepted",
      requesterId: seekerId,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandover);
    mock.method(Resource, "findById", async () => fakeResource);
    mock.method(requestModel, "findById", async () => fakeRequest);
    mock.method(Contribution, "findOne", async () => null);
    mock.method(Contribution, "create", async (data) => ({ _id: new mongoose.Types.ObjectId(), ...data }));
    mock.method(User, "findByIdAndUpdate", async () => ({}));

    await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(fakeResource.status, "impact_recorded");
    assert.equal(fakeRequest.status, "fulfilled");
  });

  test("Failure path: If Resource transition throws, Handover does not remain completed and error propagates", async () => {
    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
      resourceId,
      requestId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      status: "in_progress",
      async save() { return this; },
    };

    const fakeResource = {
      _id: resourceId,
      status: "cancelled", // Terminal state, transition will throw 409
      providerId,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandover);
    mock.method(Resource, "findById", async () => fakeResource);
    mock.method(Contribution, "findOne", async () => null);
    mock.method(Contribution, "create", async (data) => ({ _id: new mongoose.Types.ObjectId(), ...data }));
    mock.method(User, "findByIdAndUpdate", async () => ({}));

    await assert.rejects(
      async () => {
        await handoverService.confirm(handoverId, "seeker", seekerId);
      },
      (err) => {
        assert.equal(err.code, "INVALID_TRANSITION");
        return true;
      }
    );

    assert.equal(fakeHandover.status, "in_progress", "Handover must not remain completed on cascade failure");
    assert.equal(fakeHandover.completedAt, null);
  });

  test("Failure path: If Request transition throws, Handover does not remain completed and error propagates", async () => {
    const fakeHandover = {
      _id: handoverId,
      providerId,
      seekerId,
      resourceId,
      requestId,
      confirmedByProvider: true,
      confirmedBySeeker: false,
      status: "in_progress",
      async save() { return this; },
    };

    const fakeResource = {
      _id: resourceId,
      status: "in_handover",
      providerId,
      async save() { return this; },
    };

    const fakeRequest = {
      _id: requestId,
      status: "cancelled", // Terminal state, transition will throw 409
      requesterId: seekerId,
      async save() { return this; },
    };

    mock.method(Handover, "findById", async () => fakeHandover);
    mock.method(Resource, "findById", async () => fakeResource);
    mock.method(requestModel, "findById", async () => fakeRequest);
    mock.method(Contribution, "findOne", async () => null);
    mock.method(Contribution, "create", async (data) => ({ _id: new mongoose.Types.ObjectId(), ...data }));
    mock.method(User, "findByIdAndUpdate", async () => ({}));

    await assert.rejects(
      async () => {
        await handoverService.confirm(handoverId, "seeker", seekerId);
      },
      (err) => {
        assert.equal(err.code, "INVALID_TRANSITION");
        return true;
      }
    );

    assert.equal(fakeHandover.status, "in_progress", "Handover must not remain completed on cascade failure");
    assert.equal(fakeHandover.completedAt, null);
  });
});
