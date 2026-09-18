import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Organization from "../../src/models/Organization.js";
import Notification from "../../src/models/Notification.js";

const JWT_SECRET = "test-jwt-secret-for-eng1-testing-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENG-01 — Identity, Organizations & Admin API Route Unit Tests", () => {
  let server;
  let baseUrl;

  const adminId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  const orgId = new mongoose.Types.ObjectId().toString();

  let adminToken;
  let userToken;
  let otherToken;

  before(async () => {
    adminToken = jwt.sign({ sub: adminId, role: "admin" }, JWT_SECRET);
    userToken = jwt.sign({ sub: userId, role: "user" }, JWT_SECRET);
    otherToken = jwt.sign({ sub: otherUserId, role: "user" }, JWT_SECRET);

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

    // Default User.findById for authentication middleware
    mock.method(User, "findById", async (id) => {
      const strId = String(id);
      if (strId === adminId) return { _id: adminId, role: "admin", status: "active" };
      if (strId === userId) return { _id: userId, role: "user", status: "active" };
      if (strId === otherUserId) return { _id: otherUserId, role: "user", status: "active" };
      return null;
    });

    // Default Notification.create for org verification notifications
    mock.method(Notification, "create", async (data) => ({
      _id: new mongoose.Types.ObjectId(),
      ...data,
    }));
  });

  // ==========================================
  // 1. AUTH CONTROLLER
  // ==========================================
  describe("Auth Routes", () => {
    test("POST /api/auth/register — registers user successfully (201)", async () => {
      mock.method(User, "findOne", async () => null);
      mock.method(User, "create", async (data) => ({
        _id: userId,
        name: data.name,
        email: data.email,
        role: "user",
        status: "active",
        toObject: () => ({ _id: userId, name: data.name, email: data.email, role: "user", status: "active" }),
      }));

      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Register",
          email: "register@example.com",
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.user.email, "register@example.com");
      assert.equal(typeof json.data.token, "string");
    });

    test("POST /api/auth/register — duplicate email returns 409", async () => {
      mock.method(User, "findOne", async () => ({ _id: userId, email: "existing@example.com" }));

      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Register",
          email: "existing@example.com",
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 409);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "DUPLICATE_EMAIL");
    });

    test("POST /api/auth/register — validation failure (400)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "invalid-email",
          password: "short",
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "VALIDATION_ERROR");
    });

    test("POST /api/auth/login — authenticates user (200)", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      mock.method(User, "findOne", () => ({
        select: async () => ({
          _id: userId,
          email: "user@example.com",
          passwordHash: hashedPassword,
          role: "user",
          status: "active",
          toObject: () => ({ _id: userId, email: "user@example.com", role: "user", status: "active" }),
        }),
      }));

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(typeof json.data.token, "string");
    });

    test("POST /api/auth/login — wrong password returns 401", async () => {
      const hashedPassword = await bcrypt.hash("DifferentPassword123!", 10);
      mock.method(User, "findOne", () => ({
        select: async () => ({
          _id: userId,
          email: "user@example.com",
          passwordHash: hashedPassword,
          role: "user",
          status: "active",
        }),
      }));

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "WrongPassword123!",
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "INVALID_CREDENTIALS");
    });

    test("POST /api/auth/login — short wrong password (< 8 chars) returns 401 not 400", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      mock.method(User, "findOne", () => ({
        select: async () => ({
          _id: userId,
          email: "user@example.com",
          passwordHash: hashedPassword,
          role: "user",
          status: "active",
        }),
      }));

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "wrong",
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "INVALID_CREDENTIALS");
    });

    test("POST /api/auth/login — unknown user returns 401", async () => {
      mock.method(User, "findOne", () => ({
        select: async () => null,
      }));

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "unknown@example.com",
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "INVALID_CREDENTIALS");
    });

    test("POST /api/auth/login — malformed payload returns 400", async () => {
      // Missing password
      const noPass = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com" }),
      });
      assert.equal(noPass.status, 400);

      // Invalid email syntax
      const badEmail = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email", password: "Password123!" }),
      });
      assert.equal(badEmail.status, 400);

      // Missing email
      const noEmail = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "Password123!" }),
      });
      assert.equal(noEmail.status, 400);
    });

    test("POST /api/auth/login — suspended user returns 403", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      mock.method(User, "findOne", () => ({
        select: async () => ({
          _id: userId,
          email: "suspended@example.com",
          passwordHash: hashedPassword,
          role: "user",
          status: "suspended",
        }),
      }));

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "suspended@example.com",
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "ACCOUNT_SUSPENDED");
    });

    test("POST /api/auth/logout — clears session (200)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
    });

    test("POST /api/auth/logout — unauthenticated returns 401", async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
    });
  });

  // ==========================================
  // 2. USER PROFILE CONTROLLER
  // ==========================================
  describe("User Profile Routes", () => {
    test("GET /api/users/me — returns current user profile (200)", async () => {
      const res = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data._id, userId);
      assert.equal(json.data.password, undefined);
    });

    test("GET /api/users/me — unauthenticated returns 401", async () => {
      const res = await fetch(`${baseUrl}/api/users/me`);
      assert.equal(res.status, 401);
    });

    test("PUT /api/users/me — updates allowed profile fields (200)", async () => {
      mock.method(User, "findByIdAndUpdate", async (id, update) => ({
        _id: userId,
        name: update.$set.name,
        role: "user",
        status: "active",
      }));

      const res = await fetch(`${baseUrl}/api/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.name, "Updated Name");
    });
  });

  // ==========================================
  // 3. ORGANIZATION CONTROLLER
  // ==========================================
  describe("Organization Routes", () => {
    test("POST /api/organizations — creates organization with pending status (201)", async () => {
      mock.method(Organization, "create", async (data) => ({
        _id: orgId,
        name: data.name,
        ownerUserId: data.ownerUserId,
        verification: { status: "pending" },
      }));

      const res = await fetch(`${baseUrl}/api/organizations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Community NGO",
          description: "Distributing food surplus",
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.name, "Test Community NGO");
      assert.equal(json.data.verification.status, "pending");
    });

    test("POST /api/organizations — unauthenticated returns 401", async () => {
      const res = await fetch(`${baseUrl}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Community NGO" }),
      });

      assert.equal(res.status, 401);
    });

    test("GET /api/organizations/:id — public fetch returns organization (200)", async () => {
      mock.method(Organization, "findById", async (id) => ({
        _id: id,
        name: "Test Community NGO",
        verification: { status: "approved" },
      }));

      const res = await fetch(`${baseUrl}/api/organizations/${orgId}`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data._id, orgId);
    });

    test("GET /api/organizations/:id — invalid ObjectId format returns 400", async () => {
      const res = await fetch(`${baseUrl}/api/organizations/invalid-id-format`);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "VALIDATION_ERROR");
    });

    test("GET /api/organizations/:id — not found returns 404", async () => {
      mock.method(Organization, "findById", async () => null);

      const notFoundId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/organizations/${notFoundId}`);
      assert.equal(res.status, 404);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "NOT_FOUND");
    });

    test("PUT /api/organizations/:id — owner can update organization (200)", async () => {
      mock.method(Organization, "findById", async () => ({
        _id: orgId,
        ownerUserId: userId,
      }));
      mock.method(Organization, "findByIdAndUpdate", async (id, update) => ({
        _id: orgId,
        name: update.$set.name || "Test NGO",
        description: update.$set.description,
        ownerUserId: userId,
      }));

      const res = await fetch(`${baseUrl}/api/organizations/${orgId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: "Updated description" }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.description, "Updated description");
    });

    test("PUT /api/organizations/:id — non-owner receives 403 Forbidden", async () => {
      mock.method(Organization, "findById", async () => ({
        _id: orgId,
        ownerUserId: userId,
      }));

      const res = await fetch(`${baseUrl}/api/organizations/${orgId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${otherToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: "Unauthorized edit" }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FORBIDDEN");
    });

    test("POST /api/organizations/:id/verify — admin approves organization (200)", async () => {
      const mockOrgDoc = {
        _id: orgId,
        ownerUserId: userId,
        verification: { status: "pending" },
        save: async function () {
          return this;
        },
      };

      mock.method(Organization, "findById", async () => mockOrgDoc);

      const res = await fetch(`${baseUrl}/api/organizations/${orgId}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "approved" }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.verification.status, "approved");
    });

    test("POST /api/organizations/:id/verify — admin rejects without reason returns 400", async () => {
      const mockOrgDoc = {
        _id: orgId,
        ownerUserId: userId,
        verification: { status: "pending" },
      };
      mock.method(Organization, "findById", async () => mockOrgDoc);

      const res = await fetch(`${baseUrl}/api/organizations/${orgId}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "rejected" }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "REJECTION_REASON_REQUIRED");
    });

    test("POST /api/organizations/:id/verify — non-admin receives 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/organizations/${orgId}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "approved" }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });

  // ==========================================
  // 4. ADMIN USER MANAGEMENT
  // ==========================================
  describe("Admin User Management Routes", () => {
    test("GET /api/admin/users — admin lists users with pagination (200)", async () => {
      mock.method(User, "find", () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [
              { _id: adminId, role: "admin" },
              { _id: userId, role: "user" },
            ],
          }),
        }),
      }));
      mock.method(User, "countDocuments", async () => 2);

      const res = await fetch(`${baseUrl}/api/admin/users?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.length, 2);
      assert.equal(json.pagination.total, 2);
    });

    test("GET /api/admin/users — admin filters users by role and search", async () => {
      let capturedFilter = null;
      mock.method(User, "find", (filter) => {
        capturedFilter = filter;
        return {
          sort: () => ({
            skip: () => ({
              limit: async () => [{ _id: userId, role: "user", name: "Sarah" }],
            }),
          }),
        };
      });
      mock.method(User, "countDocuments", async (filter) => 1);

      const res = await fetch(`${baseUrl}/api/admin/users?role=user&search=Sarah`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(capturedFilter.role, "user");
      assert.ok(capturedFilter.$or);
    });

    test("GET /api/admin/users — non-admin receives 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FORBIDDEN");
    });

    test("PUT /api/admin/users/:id/suspend — admin suspends user (200)", async () => {
      mock.method(User, "findByIdAndUpdate", async (id, update) => ({
        _id: id,
        status: "suspended",
      }));

      const res = await fetch(`${baseUrl}/api/admin/users/${userId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, "suspended");
    });

    test("PUT /api/admin/users/:id/reactivate — admin reactivates user (200)", async () => {
      mock.method(User, "findByIdAndUpdate", async (id, update) => ({
        _id: id,
        status: "active",
      }));

      const res = await fetch(`${baseUrl}/api/admin/users/${userId}/reactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, "active");
    });
  });
});
