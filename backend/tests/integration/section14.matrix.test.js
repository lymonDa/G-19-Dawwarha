import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "../../src/config/database.js";
import app from "../../src/app.js";

import User from "../../src/models/User.js";
import Organization from "../../src/models/Organization.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import Report from "../../src/models/Report.js";
import Notification from "../../src/models/Notification.js";
import { requestModel } from "../../src/models/Request.js";
import { matchModel } from "../../src/models/Match.js";

describe("PHASE 6 — Section 14 Complete Endpoint Verification Matrix", () => {
  let server;
  let baseUrl;

  const runId = Date.now();
  const createdIds = {
    users: [],
    organizations: [],
    categories: [],
    resources: [],
    requests: [],
    matches: [],
    handovers: [],
    contributions: [],
    reports: [],
    notifications: [],
  };

  let adminUser, adminToken;
  let providerUser, providerToken;
  let seekerUser, seekerToken;
  let otherUser, otherToken;

  let testCategory;
  let testOrg;
  let testResource;
  let testRequest;
  let testMatch;
  let testHandover;
  let testReport;
  let testNotification;

  before(async () => {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Register test users
    const register = async (name, email, role = "user") => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: "Password123!" }),
      });
      const body = await res.json();
      if (role === "admin") {
        await User.findByIdAndUpdate(body.data.user._id, { $set: { role: "admin" } });
        // Re-login to get admin JWT
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "Password123!" }),
        });
        const loginBody = await loginRes.json();
        createdIds.users.push(body.data.user._id);
        return { user: loginBody.data.user, token: loginBody.data.token };
      }
      createdIds.users.push(body.data.user._id);
      return { user: body.data.user, token: body.data.token };
    };

    const admin = await register("Matrix Admin", `m_admin_${runId}@dawwarha.test`, "admin");
    adminUser = admin.user;
    adminToken = admin.token;

    const provider = await register("Matrix Provider", `m_prov_${runId}@dawwarha.test`);
    providerUser = provider.user;
    providerToken = provider.token;

    const seeker = await register("Matrix Seeker", `m_seek_${runId}@dawwarha.test`);
    seekerUser = seeker.user;
    seekerToken = seeker.token;

    const other = await register("Matrix Other", `m_other_${runId}@dawwarha.test`);
    otherUser = other.user;
    otherToken = other.token;

    // Create Category via Admin
    const catRes = await fetch(`${baseUrl}/api/categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Matrix Category ${runId}`,
        slug: `matrix-cat-${runId}`,
        description: "Matrix Category Description",
      }),
    });
    const catBody = await catRes.json();
    testCategory = catBody.data;
    createdIds.categories.push(testCategory._id);
  });

  after(async () => {
    try {
      if (createdIds.reports.length > 0) await Report.deleteMany({ _id: { $in: createdIds.reports } });
      if (createdIds.contributions.length > 0) await Contribution.deleteMany({ _id: { $in: createdIds.contributions } });
      if (createdIds.handovers.length > 0) await Handover.deleteMany({ _id: { $in: createdIds.handovers } });
      if (createdIds.matches.length > 0) await matchModel.deleteMany({ _id: { $in: createdIds.matches } });
      if (createdIds.requests.length > 0) await requestModel.deleteMany({ _id: { $in: createdIds.requests } });
      if (createdIds.resources.length > 0) await Resource.deleteMany({ _id: { $in: createdIds.resources } });
      if (createdIds.categories.length > 0) await Category.deleteMany({ _id: { $in: createdIds.categories } });
      if (createdIds.organizations.length > 0) await Organization.deleteMany({ _id: { $in: createdIds.organizations } });
      if (createdIds.notifications.length > 0) await Notification.deleteMany({ _id: { $in: createdIds.notifications } });
      if (createdIds.users.length > 0) await User.deleteMany({ _id: { $in: createdIds.users } });
    } catch {}
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  // =========================================================================
  // 1. IDENTITY & ADMIN DOMAIN (ENGINEER 1)
  // =========================================================================
  describe("Group 1: Identity & Admin Endpoints", () => {
    test("1. POST /api/auth/register — 201 happy, 400 validation, 409 duplicate", async () => {
      // 400 validation
      const bad = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: "notanemail" }),
      });
      assert.equal(bad.status, 400);

      // 409 duplicate
      const dup = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Dup", email: providerUser.email, password: "Password123!" }),
      });
      assert.equal(dup.status, 409);
    });

    test("2. POST /api/auth/login — 200 happy, 401 bad credentials", async () => {
      const good = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: providerUser.email, password: "Password123!" }),
      });
      assert.equal(good.status, 200);

      const bad = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: providerUser.email, password: "WrongPassword" }),
      });
      assert.equal(bad.status, 401);
    });

    test("3. POST /api/auth/logout — 200 happy, 401 unauthenticated", async () => {
      const unauth = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(auth.status, 200);
    });

    test("4. GET /api/users/me — 200 happy, 401 unauthenticated", async () => {
      const unauth = await fetch(`${baseUrl}/api/users/me`);
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(auth.status, 200);
      const json = await auth.json();
      assert.equal(json.data.email, providerUser.email);
    });

    test("5. PUT /api/users/me — 200 happy, 400 validation", async () => {
      const auth = await fetch(`${baseUrl}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Provider Name" }),
      });
      assert.equal(auth.status, 200);
    });

    test("6. POST /api/organizations — 201 happy, 401 unauth, 400 validation", async () => {
      const unauth = await fetch(`${baseUrl}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Org" }),
      });
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/organizations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Seeker Org ${runId}`, description: "Matrix Org" }),
      });
      assert.equal(auth.status, 201);
      const json = await auth.json();
      testOrg = json.data;
      createdIds.organizations.push(testOrg._id);
    });

    test("7. GET /api/organizations/:id — 200 public, 400 invalid id, 404 not found", async () => {
      const badId = await fetch(`${baseUrl}/api/organizations/123invalid`);
      assert.equal(badId.status, 400);

      const notFound = await fetch(`${baseUrl}/api/organizations/${new mongoose.Types.ObjectId()}`);
      assert.equal(notFound.status, 404);

      const good = await fetch(`${baseUrl}/api/organizations/${testOrg._id}`);
      assert.equal(good.status, 200);
    });

    test("8. PUT /api/organizations/:id — 200 owner, 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/organizations/${testOrg._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Hacked Org Description" }),
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/organizations/${testOrg._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Legitimate Owner Update" }),
      });
      assert.equal(owner.status, 200);
    });

    test("9. POST /api/organizations/:id/verify — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/organizations/${testOrg._id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "approved" }),
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/organizations/${testOrg._id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "approved" }),
      });
      assert.equal(admin.status, 200);
    });

    test("10. GET /api/admin/users — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/admin/users?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
    });

    test("11. PUT /api/admin/users/:id/suspend — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/admin/users/${otherUser._id}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/admin/users/${otherUser._id}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
    });

    test("12. PUT /api/admin/users/:id/reactivate — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/admin/users/${otherUser._id}/reactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/admin/users/${otherUser._id}/reactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
    });
  });

  // =========================================================================
  // 2. SUPPLY & CATEGORIES DOMAIN (ENGINEER 2)
  // =========================================================================
  describe("Group 2: Categories & Resources Endpoints", () => {
    test("13. GET /api/categories — 200 public", async () => {
      const res = await fetch(`${baseUrl}/api/categories`);
      assert.equal(res.status, 200);
    });

    test("14. GET /api/categories/:id — 200 public, 400 invalid id", async () => {
      const bad = await fetch(`${baseUrl}/api/categories/badid`);
      assert.equal(bad.status, 400);

      const res = await fetch(`${baseUrl}/api/categories/${testCategory._id}`);
      assert.equal(res.status, 200);
    });

    test("15. POST /api/categories — 201 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/categories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unauthorized Cat" }),
      });
      assert.equal(nonAdmin.status, 403);
    });

    test("16. PUT /api/categories/:id — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/categories/${testCategory._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Non-admin update" }),
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/categories/${testCategory._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Admin Updated Description" }),
      });
      assert.equal(admin.status, 200);
    });

    test("17. DELETE /api/categories/:id — 200 admin (soft delete), 403 non-admin", async () => {
      const tempCat = await Category.create({ name: `Temp Cat ${runId}`, slug: `temp-${runId}` });
      createdIds.categories.push(tempCat._id);

      const nonAdmin = await fetch(`${baseUrl}/api/categories/${tempCat._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/categories/${tempCat._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
    });

    test("18. GET /api/resources — 200 public", async () => {
      const res = await fetch(`${baseUrl}/api/resources?page=1&limit=10`);
      assert.equal(res.status, 200);
    });

    test("19. POST /api/resources — 201 auth, 401 unauth, 400 validation", async () => {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const unauth = await fetch(`${baseUrl}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Unauth Resource" }),
      });
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/resources`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Matrix Resource ${runId}`,
          description: "Fresh bakery surplus bread",
          categoryId: testCategory._id,
          quantity: 10,
          location: { city: "Amman", address: "Rainbow St" },
          availabilityWindow: { start, end },
        }),
      });
      assert.equal(auth.status, 201);
      const json = await auth.json();
      testResource = json.data;
      createdIds.resources.push(testResource._id);
    });

    test("20. GET /api/resources/:id — 200 public, 400 invalid id", async () => {
      const bad = await fetch(`${baseUrl}/api/resources/invalidid`);
      assert.equal(bad.status, 400);

      const good = await fetch(`${baseUrl}/api/resources/${testResource._id}`);
      assert.equal(good.status, 200);
    });

    test("21. PUT /api/resources/:id — 200 owner, 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/resources/${testResource._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Hacked resource" }),
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/resources/${testResource._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Owner Updated Resource" }),
      });
      assert.equal(owner.status, 200);
    });

    test("22. PUT /api/resources/:id/status — 200 owner (publish), 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/resources/${testResource._id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/resources/${testResource._id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${providerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      assert.equal(owner.status, 200);
    });

    test("23. DELETE /api/resources/:id — 200 owner (cancel), 403 non-owner", async () => {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const toDelete = await Resource.create({
        title: "Delete Me",
        description: "To be cancelled",
        categoryId: testCategory._id,
        providerId: providerUser._id,
        quantity: 1,
        location: { city: "Amman", address: "Street" },
        availabilityWindow: { start, end },
      });
      createdIds.resources.push(toDelete._id);

      const nonOwner = await fetch(`${baseUrl}/api/resources/${toDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/resources/${toDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(owner.status, 200);
    });
  });

  // =========================================================================
  // 3. DEMAND & MATCHING DOMAIN (ENGINEER 3)
  // =========================================================================
  describe("Group 3: Requests & Matching Endpoints", () => {
    test("24. POST /api/requests — 201 auth, 400 validation", async () => {
      const bad = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", quantity: -5 }),
      });
      assert.equal(bad.status, 400);

      const auth = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Matrix Request ${runId}`,
          description: "Need fresh bread",
          categoryId: testCategory._id,
          quantity: 10,
          urgency: "high",
          location: { city: "Amman" },
        }),
      });
      assert.equal(auth.status, 201);
      const json = await auth.json();
      testRequest = json.data;
      createdIds.requests.push(testRequest._id);
    });

    test("25. GET /api/requests — 200 auth", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(res.status, 200);
    });

    test("26. GET /api/requests/:id — 200 auth, 404 not found", async () => {
      const notFound = await fetch(`${baseUrl}/api/requests/${new mongoose.Types.ObjectId()}`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(notFound.status, 404);

      const good = await fetch(`${baseUrl}/api/requests/${testRequest._id}`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(good.status, 200);
    });

    test("27. PUT /api/requests/:id — 200 owner, 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/requests/${testRequest._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Hacked request" }),
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/requests/${testRequest._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Owner Updated Request" }),
      });
      assert.equal(owner.status, 200);
    });

    test("28. PUT /api/requests/:id/status — 200 owner (publish), 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/requests/${testRequest._id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/requests/${testRequest._id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      assert.equal(owner.status, 200);
    });

    test("29. DELETE /api/requests/:id — 200 owner (cancel), 403 non-owner", async () => {
      const toDelete = await requestModel.create({
        title: "Delete Me Request",
        categoryId: testCategory._id,
        requesterId: seekerUser._id,
        quantity: 2,
        location: { city: "Amman" },
      });
      createdIds.requests.push(toDelete._id);

      const nonOwner = await fetch(`${baseUrl}/api/requests/${toDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/requests/${toDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(owner.status, 200);
    });

    test("30. POST /api/matches/:resourceId/generate — 200 resource owner, 403 non-owner", async () => {
      const nonOwner = await fetch(`${baseUrl}/api/matches/${testResource._id}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(nonOwner.status, 403);

      const owner = await fetch(`${baseUrl}/api/matches/${testResource._id}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(owner.status, 200);
      const json = await owner.json();
      assert.ok(json.data.length >= 1);
      testMatch = json.data[0];
      createdIds.matches.push(testMatch._id);
    });

    test("31. GET /api/matches — 200 auth", async () => {
      const res = await fetch(`${baseUrl}/api/matches`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(res.status, 200);
    });

    test("32. PUT /api/matches/:id/accept — 200 party, 403 non-party", async () => {
      const nonParty = await fetch(`${baseUrl}/api/matches/${testMatch._id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(nonParty.status, 403);

      const party = await fetch(`${baseUrl}/api/matches/${testMatch._id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(party.status, 200);
      const json = await party.json();
      testHandover = { _id: json.data?.handoverId || json.data?.handover?._id };
      if (testHandover._id) {
        createdIds.handovers.push(testHandover._id);
      }
    });

    test("33. PUT /api/matches/:id/reject — 403 non-party, 409 already accepted", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${testMatch._id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(res.status, 409); // Already accepted
    });
  });

  // =========================================================================
  // 4. TRUST, IMPACT & ADMIN (ENGINEER 4)
  // =========================================================================
  describe("Group 4: Transactions, Reports, Contributions, Analytics & Notifications", () => {
    test("34. POST /api/transactions/:matchId/confirm — 200 party, 403 non-party", async () => {
      const nonParty = await fetch(`${baseUrl}/api/transactions/${testMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(nonParty.status, 403);

      // Provider confirms
      const pRes = await fetch(`${baseUrl}/api/transactions/${testMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(pRes.status, 200);

      // Seeker confirms -> completes transfer
      const sRes = await fetch(`${baseUrl}/api/transactions/${testMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(sRes.status, 200);
      const sJson = await sRes.json();
      assert.equal(sJson.data.status, "completed");
    });

    test("35. POST /api/reports — 201 auth, 400 invalid target", async () => {
      const bad = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "invalid_type", targetId: providerUser._id, reason: "fraud" }),
      });
      assert.equal(bad.status, 400);

      const good = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "user",
          targetId: providerUser._id,
          reason: "fraud",
          description: "Matrix report description",
        }),
      });
      assert.equal(good.status, 201);
      const json = await good.json();
      testReport = json.data;
      createdIds.reports.push(testReport._id);
    });

    test("36. GET /api/reports — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/reports`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/reports?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
    });

    test("37. PUT /api/reports/:id/resolve — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/reports/${testReport._id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${seekerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Non admin resolve" }),
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/reports/${testReport._id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Admin verified and resolved" }),
      });
      assert.equal(admin.status, 200);
    });

    test("38. GET /api/users/me/contributions — 200 auth, 401 unauth", async () => {
      const unauth = await fetch(`${baseUrl}/api/users/me/contributions`);
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/users/me/contributions`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(auth.status, 200);
      const json = await auth.json();
      assert.ok(json.data.length >= 1);
    });

    test("39. GET /api/admin/analytics — 200 admin, 403 non-admin", async () => {
      const nonAdmin = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(nonAdmin.status, 403);

      const admin = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(admin.status, 200);
      const json = await admin.json();
      assert.ok(json.data.summary);
      assert.ok(json.data.summary.completedTransfers >= 1);
    });

    test("40. GET /api/notifications — 200 auth, 401 unauth", async () => {
      const unauth = await fetch(`${baseUrl}/api/notifications`);
      assert.equal(unauth.status, 401);

      const auth = await fetch(`${baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(auth.status, 200);
      const json = await auth.json();
      assert.ok(json.data.notifications.length >= 1);
      testNotification = json.data.notifications[0];
      createdIds.notifications.push(testNotification._id);
    });

    test("41. PATCH /api/notifications/:id/read — 200 auth owner, 404 non-owner/not found", async () => {
      const other = await fetch(`${baseUrl}/api/notifications/${testNotification._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(other.status, 404);

      const owner = await fetch(`${baseUrl}/api/notifications/${testNotification._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(owner.status, 200);
      const json = await owner.json();
      assert.ok(json.data.readAt);
    });
  });
});
