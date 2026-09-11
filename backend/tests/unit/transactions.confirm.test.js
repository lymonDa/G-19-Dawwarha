import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import handoverService from "../../src/services/handoverService.js";
import contributionService from "../../src/services/contributionService.js";

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

describe("Engineer 4 Step 3 — Handover Confirmation & Contribution Integration (Tests A - F)", () => {
  const providerId = new mongoose.Types.ObjectId().toString();
  const seekerId = new mongoose.Types.ObjectId().toString();
  const thirdPartyId = new mongoose.Types.ObjectId().toString();
  const handoverId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mock.restoreAll();
  });

  test("Test A — Provider confirmation: provider confirms → provider flag true, seeker flag false, status in_progress, NO Contribution", async () => {
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

    const updated = await handoverService.confirm(handoverId, "provider", providerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.notEqual(updated.providerConfirmedAt, null);
    assert.equal(updated.confirmedBySeeker, false);
    assert.equal(updated.status, "in_progress");
    assert.equal(updated.completedAt, null);
    assert.equal(contributionRecorded, false, "Contribution must NOT be recorded when only provider confirms");
  });

  test("Test B — Seeker confirmation: seeker confirms after provider → both flags true, status completed, completedAt exists, exactly ONE Contribution", async () => {
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

    let contributionCalls = 0;
    let handoverPassedToContribution = null;
    mock.method(contributionService, "recordCompletedTransfer", async (handover) => {
      contributionCalls++;
      handoverPassedToContribution = handover;
      return { _id: new mongoose.Types.ObjectId(), handoverId: handover._id };
    });

    const updated = await handoverService.confirm(handoverId, "seeker", seekerId);

    assert.equal(updated.confirmedByProvider, true);
    assert.equal(updated.confirmedBySeeker, true);
    assert.notEqual(updated.seekerConfirmedAt, null);
    assert.equal(updated.status, "completed");
    assert.notEqual(updated.completedAt, null);
    assert.equal(contributionCalls, 1, "Exactly one Contribution must be recorded upon two-sided completion");
    assert.equal(handoverPassedToContribution._id, handoverId);
    assert.equal(handoverPassedToContribution.status, "completed");
  });

  test("Test C — Duplicate confirmation: same side confirms again → no duplicate Contribution, no duplicate stat increment, timestamp unchanged", async () => {
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
    assert.equal(updatedSeeker.seekerConfirmedAt.getTime(), originalSeekerTime.getTime(), "Seeker timestamp must not change");
    assert.equal(updatedSeeker.completedAt.getTime(), originalCompletedTime.getTime(), "completedAt timestamp must not change");
    assert.equal(contributionCalls, 0, "No duplicate contribution call on re-confirmation");

    // Provider confirms again on already-completed handover
    const updatedProvider = await handoverService.confirm(handoverId, "provider", providerId);
    assert.equal(updatedProvider.providerConfirmedAt.getTime(), originalProviderTime.getTime(), "Provider timestamp must not change");
    assert.equal(contributionCalls, 0, "No duplicate contribution call on re-confirmation");
  });

  test("Test D — Third-party: third-party confirms → 403, no handover mutation, NO Contribution", async () => {
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

  test("Test E — Cancelled: cancelled handover → 409, NO Contribution", async () => {
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

  test("Test F — No-show: no_show handover → 409, NO Contribution", async () => {
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
