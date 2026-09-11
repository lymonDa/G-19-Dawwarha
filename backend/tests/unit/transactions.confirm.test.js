import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("Step 1: POST /api/transactions/:matchId/confirm", () => {
  let server;
  let baseUrl;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const validMatchId = new mongoose.Types.ObjectId().toString();
  let authToken;

  before(async () => {
    authToken = jwt.sign({ sub: mockUserId, role: "user" }, JWT_SECRET);
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
    // Default: User.findById returns an active user matching mockUserId
    mock.method(User, "findById", async (id) => {
      if (String(id) === mockUserId) {
        return { _id: mockUserId, role: "user", status: "active" };
      }
      return null;
    });
  });

  test("Test 1 — Valid matchId: reaches controller, queries Handover by matchId, and returns handover", async () => {
    const fakeHandover = {
      _id: new mongoose.Types.ObjectId().toString(),
      matchId: validMatchId,
      resourceId: new mongoose.Types.ObjectId().toString(),
      requestId: new mongoose.Types.ObjectId().toString(),
      providerId: mockUserId,
      seekerId: new mongoose.Types.ObjectId().toString(),
      confirmedByProvider: false,
      confirmedBySeeker: false,
      status: "in_progress",
    };

    let queriedFilter = null;
    mock.method(Handover, "findOne", async (filter) => {
      queriedFilter = filter;
      return fakeHandover;
    });

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.matchId, validMatchId);
    assert.deepEqual(queriedFilter, { matchId: validMatchId });
  });

  test("Test 2 — Invalid ObjectId: returns HTTP 400 with standard validation error", async () => {
    const res = await fetch(`${baseUrl}/api/transactions/not-a-valid-object-id/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.match(body.error.message, /invalid match id/i);
  });

  test("Test 3 — No handover: valid ObjectId with no matching handover returns HTTP 404", async () => {
    mock.method(Handover, "findOne", async () => null);

    const nonExistentMatchId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/api/transactions/${nonExistentMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "NOT_FOUND");
    assert.equal(body.error.message, "No handover found for this match");
  });

  test("Test 4 — Authentication: request without token returns HTTP 401", async () => {
    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
    assert.equal(body.error.message, "Authentication is required.");
  });

  test("Test 5 — Authentication: request with invalid token returns HTTP 401", async () => {
    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-token-string",
        "Content-Type": "application/json",
      },
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  test("Test 6 — Security: client-provided body (side, status) is ignored and database is not mutated", async () => {
    let updateCalled = false;
    mock.method(Handover, "findOneAndUpdate", async () => {
      updateCalled = true;
    });
    mock.method(Handover, "updateOne", async () => {
      updateCalled = true;
    });

    const fakeHandover = {
      _id: new mongoose.Types.ObjectId().toString(),
      matchId: validMatchId,
      status: "in_progress",
      confirmedByProvider: false,
      confirmedBySeeker: false,
    };

    mock.method(Handover, "findOne", async () => fakeHandover);

    const res = await fetch(`${baseUrl}/api/transactions/${validMatchId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        side: "provider",
        status: "completed",
        providerConfirmed: true,
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(updateCalled, false);
  });
});
