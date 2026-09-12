import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import bcrypt from "bcrypt";
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

describe("TASK 4.F / Section 21 — Cross-Cutting E2E Demo Journey Integration Test Suite", () => {
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

  // Test actor credentials & tokens
  let providerUser;
  let providerToken;

  let seekerUser;
  let seekerToken;

  let thirdPartyUser;
  let thirdPartyToken;

  let adminUser;
  let adminToken;

  let testCategory;
  let approvedOrg;
  let publishedResource;
  let publishedRequest;
  let liveMatch;
  let liveHandover;

  before(async () => {
    // 1. Connect to MongoDB test database
    await connectDB();

    // 2. Start Express application on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    // Isolated cleanup of documents created during this test run
    try {
      if (createdIds.reports.length > 0) {
        await Report.deleteMany({ _id: { $in: createdIds.reports } });
      }
      if (createdIds.contributions.length > 0) {
        await Contribution.deleteMany({ _id: { $in: createdIds.contributions } });
      }
      if (createdIds.handovers.length > 0) {
        await Handover.deleteMany({ _id: { $in: createdIds.handovers } });
      }
      if (createdIds.matches.length > 0) {
        await matchModel.deleteMany({ _id: { $in: createdIds.matches } });
      }
      if (createdIds.requests.length > 0) {
        await requestModel.deleteMany({ _id: { $in: createdIds.requests } });
      }
      if (createdIds.resources.length > 0) {
        await Resource.deleteMany({ _id: { $in: createdIds.resources } });
      }
      if (createdIds.categories.length > 0) {
        await Category.deleteMany({ _id: { $in: createdIds.categories } });
      }
      if (createdIds.organizations.length > 0) {
        await Organization.deleteMany({ _id: { $in: createdIds.organizations } });
      }
      if (createdIds.notifications.length > 0) {
        await Notification.deleteMany({ _id: { $in: createdIds.notifications } });
      }
      if (createdIds.users.length > 0) {
        await User.deleteMany({ _id: { $in: createdIds.users } });
      }
    } catch (cleanupErr) {
      console.error("E2E Teardown cleanup error:", cleanupErr.message);
    }

    // Close HTTP server and disconnect mongoose
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  // =========================================================================
  // STEP 1 — Identity & Authentication Flow (Engineer 1)
  // =========================================================================
  describe("Step 1: Identity & Authentication (FR-001–FR-003, Eng 1)", () => {
    test("1.1 Register Provider via POST /api/auth/register", async () => {
      const email = `e2e_${runId}_provider@dawwarha.test`;
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Provider",
          email,
          password: "ProviderPassword123!",
          location: { city: "Cairo", country: "Egypt" },
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.ok(body.data.token);
      assert.equal(body.data.user.email, email);
      assert.equal(body.data.user.role, "user");
      assert.equal(body.data.user.passwordHash, undefined);

      providerUser = body.data.user;
      providerToken = body.data.token;
      createdIds.users.push(new mongoose.Types.ObjectId(providerUser._id));
    });

    test("1.2 Register Seeker via POST /api/auth/register", async () => {
      const email = `e2e_${runId}_seeker@dawwarha.test`;
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Seeker",
          email,
          password: "SeekerPassword123!",
          location: { city: "Cairo", country: "Egypt" },
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      seekerUser = body.data.user;
      seekerToken = body.data.token;
      createdIds.users.push(new mongoose.Types.ObjectId(seekerUser._id));
    });

    test("1.3 Register Third-Party (uninvolved) user via POST /api/auth/register", async () => {
      const email = `e2e_${runId}_thirdparty@dawwarha.test`;
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E ThirdParty",
          email,
          password: "ThirdPartyPassword123!",
          location: { city: "Alexandria", country: "Egypt" },
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      thirdPartyUser = body.data.user;
      thirdPartyToken = body.data.token;
      createdIds.users.push(new mongoose.Types.ObjectId(thirdPartyUser._id));
    });

    test("1.4 Duplicate email registration rejected with HTTP 409", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate User",
          email: providerUser.email,
          password: "Password123!",
        }),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "DUPLICATE_EMAIL");
    });

    test("1.5 Seed Admin user and authenticate via POST /api/auth/login", async () => {
      const adminEmail = `e2e_${runId}_admin@dawwarha.test`;
      const adminPass = "AdminMasterPass123!";
      const passwordHash = await bcrypt.hash(adminPass, 10);

      adminUser = await User.create({
        name: "E2E Platform Admin",
        email: adminEmail,
        passwordHash,
        role: "admin",
        status: "active",
      });
      createdIds.users.push(adminUser._id);

      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPass,
        }),
      });

      assert.equal(loginRes.status, 200);
      const loginBody = await loginRes.json();
      assert.equal(loginBody.success, true);
      assert.ok(loginBody.data.token);
      assert.equal(loginBody.data.user.role, "admin");
      adminToken = loginBody.data.token;
    });

    test("1.6 Fetch authenticated user profile via GET /api/users/me", async () => {
      const res = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.email, providerUser.email);
    });
  });

  // =========================================================================
  // STEP 2 — Organization Lifecycle Flow (Engineer 1)
  // =========================================================================
  describe("Step 2: Organization Creation & Admin Approval (FR-016–FR-017, Eng 1)", () => {
    test("2.1 Seeker creates an Organization via POST /api/organizations", async () => {
      const res = await fetch(`${baseUrl}/api/organizations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${seekerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Hope Community NGO ${runId}`,
          description: "Distributing food and clothes to families in need",
          submittedDocuments: ["https://example.org/docs/license.pdf"],
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.verification.status, "pending");
      approvedOrg = body.data;
      createdIds.organizations.push(new mongoose.Types.ObjectId(approvedOrg._id));
    });

    test("2.2 Admin approves Organization verification via POST /api/organizations/:id/verify", async () => {
      const res = await fetch(`${baseUrl}/api/organizations/${approvedOrg._id}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "approved" }),
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.verification.status, "approved");
    });
  });

  // =========================================================================
  // STEP 3 — Categories & Resource Creation (Engineer 2)
  // =========================================================================
  describe("Step 3: Categories & Resource Management (FR-004–FR-006, Eng 2)", () => {
    test("3.1 Admin creates category via POST /api/categories", async () => {
      const res = await fetch(`${baseUrl}/api/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Produce & Bakery ${runId}`,
          slug: `produce-bakery-${runId}`,
          description: "Fresh surplus meals, bread and bakery items.",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      testCategory = body.data;
      createdIds.categories.push(new mongoose.Types.ObjectId(testCategory._id));
    });

    test("3.2 Provider creates a draft Resource via POST /api/resources", async () => {
      const res = await fetch(`${baseUrl}/api/resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Surplus Bakery Goods ${runId}`,
          categoryId: testCategory._id,
          quantity: 20,
          location: { city: "Cairo", area: "Maadi" },
          description: "Fresh bread packages from morning bake.",
          availabilityWindow: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 86400000 * 3).toISOString(),
          },
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "draft");
      publishedResource = body.data;
      createdIds.resources.push(new mongoose.Types.ObjectId(publishedResource._id));
    });

    test("3.3 Provider publishes Resource via PUT /api/resources/:id/status", async () => {
      const res = await fetch(`${baseUrl}/api/resources/${publishedResource._id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "publish" }),
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.ok(["published", "available"].includes(body.data.status));
    });
  });

  // =========================================================================
  // STEP 4 — Demand / Request Lifecycle Flow (Engineer 3)
  // =========================================================================
  describe("Step 4: Demand / Request Creation & Publishing (FR-007–FR-008, Eng 3)", () => {
    test("4.1 Seeker creates a draft Request via POST /api/requests", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${seekerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Urgent Food Supplies ${runId}`,
          categoryId: testCategory._id,
          quantity: 15,
          urgency: "high",
          location: { city: "Cairo", area: "Maadi" },
          description: "Need urgent bread supplies for community center",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "draft");
      publishedRequest = body.data;
      createdIds.requests.push(new mongoose.Types.ObjectId(publishedRequest._id));
    });

    test("4.2 Seeker transitions Request to 'published' via PUT /api/requests/:id/status", async () => {
      const res = await fetch(`${baseUrl}/api/requests/${publishedRequest._id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${seekerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "publish" }),
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "published");
    });
  });

  // =========================================================================
  // STEP 5 — Matching & Acceptance Flow (Engineer 3)
  // =========================================================================
  describe("Step 5: Matching Generation & Transactional Acceptance (FR-009–FR-012, Eng 3)", () => {
    test("5.1 Provider triggers match generation via POST /api/matches/:resourceId/generate", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${publishedResource._id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 1, "Expected at least 1 match proposed");

      liveMatch = body.data[0];
      assert.equal(String(liveMatch.resourceId), String(publishedResource._id));
      assert.equal(String(liveMatch.requestId), String(publishedRequest._id));
      assert.equal(liveMatch.status, "proposed");
      assert.ok(liveMatch.score >= 0.50);
      createdIds.matches.push(new mongoose.Types.ObjectId(liveMatch._id));
    });

    test("5.2 Seeker accepts the proposed match via PUT /api/matches/:matchId/accept", async () => {
      const res = await fetch(`${baseUrl}/api/matches/${liveMatch._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${seekerToken}`,
        },
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.ok(body.data.handoverId);

      // Verify connected Handover was created
      liveHandover = await Handover.findById(body.data.handoverId);
      assert.ok(liveHandover);
      assert.equal(liveHandover.status, "in_progress");
      assert.equal(String(liveHandover.matchId), String(liveMatch._id));
      assert.equal(String(liveHandover.resourceId), String(publishedResource._id));
      assert.equal(String(liveHandover.requestId), String(publishedRequest._id));
      createdIds.handovers.push(liveHandover._id);

      // Verify Match status in DB
      const dbMatch = await matchModel.findById(liveMatch._id);
      assert.equal(dbMatch.status, "accepted");
    });
  });

  // =========================================================================
  // STEP 6 — Handover & Two-Sided Confirmation Flow (FR-013, Engineer 4)
  // =========================================================================
  describe("Step 6: Handover Confirmation & Lifecycle Cascade (FR-013, Eng 4)", () => {
    test("6.1 Unauthenticated POST /api/transactions/:matchId/confirm returns HTTP 401", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${liveMatch._id}/confirm`, {
        method: "POST",
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "UNAUTHORIZED");
    });

    test("6.2 Third-party uninvolved user returns HTTP 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${liveMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${thirdPartyToken}` },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "FORBIDDEN");
    });

    test("6.3 Provider confirms alone: status remains 'in_progress', bothConfirmed=false", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${liveMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "in_progress");
      assert.equal(body.data.bothConfirmed, false);

      // Verify DB state
      const dbHandover = await Handover.findById(liveHandover._id);
      assert.equal(dbHandover.confirmedByProvider, true);
      assert.equal(dbHandover.confirmedBySeeker, false);
      assert.equal(dbHandover.status, "in_progress");
      assert.equal(dbHandover.completedAt, null);

      // Verify no Contribution created yet
      const contribCount = await Contribution.countDocuments({ handoverId: liveHandover._id });
      assert.equal(contribCount, 0);
    });

    test("6.4 Seeker then confirms: completes handover and triggers lifecycle cascades", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${liveMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${seekerToken}` },
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "completed");
      assert.equal(body.data.bothConfirmed, true);

      // Verify DB Handover state
      const dbHandover = await Handover.findById(liveHandover._id);
      assert.equal(dbHandover.confirmedByProvider, true);
      assert.equal(dbHandover.confirmedBySeeker, true);
      assert.equal(dbHandover.status, "completed");
      assert.ok(dbHandover.completedAt instanceof Date);

      // Verify BLK-01 Cascade: Resource must be transitioned to final state impact_recorded
      const dbResource = await Resource.findById(publishedResource._id);
      assert.equal(dbResource.status, "impact_recorded");

      // Verify BLK-01 Cascade: Request must be transitioned to fulfilled
      const dbRequest = await requestModel.findById(publishedRequest._id);
      assert.equal(dbRequest.status, "fulfilled");
    });

    test("6.5 Duplicate confirmation by Provider is idempotent and preserves 'completed' state", async () => {
      const res = await fetch(`${baseUrl}/api/transactions/${liveMatch._id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, "completed");
      assert.equal(body.data.bothConfirmed, true);
    });
  });

  // =========================================================================
  // STEP 7 — Contributions & Impact Ledger Flow (FR-018, Engineer 4)
  // =========================================================================
  describe("Step 7: Contributions & Impact Ledger (FR-018, Eng 4)", () => {
    test("7.1 Completed transfer automatically created exactly one Contribution in MongoDB", async () => {
      const contribs = await Contribution.find({ handoverId: liveHandover._id });
      assert.equal(contribs.length, 1);
      const contrib = contribs[0];

      assert.equal(String(contrib.providerId), String(providerUser._id));
      assert.equal(String(contrib.seekerId), String(seekerUser._id));
      assert.equal(contrib.type, "transfer_completed");
      createdIds.contributions.push(contrib._id);
    });

    test("7.2 User stats cache incremented on both Provider and Seeker", async () => {
      const dbProvider = await User.findById(providerUser._id);
      const dbSeeker = await User.findById(seekerUser._id);

      assert.equal(dbProvider.stats.completedTransfers, 1);
      assert.equal(dbSeeker.stats.completedTransfers, 1);
    });

    test("7.3 Provider retrieves contribution history via GET /api/users/me/contributions", async () => {
      const res = await fetch(`${baseUrl}/api/users/me/contributions`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.equal(body.pagination.total, 1);
      assert.equal(String(body.data[0].handoverId), String(liveHandover._id));
    });

    test("7.4 Seeker retrieves contribution history via GET /api/users/me/contributions", async () => {
      const res = await fetch(`${baseUrl}/api/users/me/contributions`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.equal(body.pagination.total, 1);
      assert.equal(String(body.data[0].handoverId), String(liveHandover._id));
    });
  });

  // =========================================================================
  // STEP 8 — Trust & Safety / Reports Flow (FR-014–FR-015, Engineer 4)
  // =========================================================================
  describe("Step 8: Moderation & Reports Flow (FR-014–FR-015, Eng 4)", () => {
    let reportDoc;

    test("8.1 Authenticated user submits a Report via POST /api/reports", async () => {
      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${seekerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: providerUser._id,
          reason: "safety",
          description: "E2E safety report for demo journey test",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "open");
      assert.equal(body.data.reason, "safety");
      reportDoc = body.data;
      createdIds.reports.push(new mongoose.Types.ObjectId(reportDoc._id));
    });

    test("8.2 Non-admin cannot view reports via GET /api/reports (403 Forbidden)", async () => {
      const res = await fetch(`${baseUrl}/api/reports`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      assert.equal(res.status, 403);
    });

    test("8.3 Admin views open reports via GET /api/reports?status=open", async () => {
      const res = await fetch(`${baseUrl}/api/reports?status=open`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      const found = body.data.find((r) => String(r._id) === String(reportDoc._id));
      assert.ok(found);
    });

    test("8.4 Admin resolves report via PUT /api/reports/:id/resolve", async () => {
      const res = await fetch(`${baseUrl}/api/reports/${reportDoc._id}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution: "E2E verified: account inspected and cleared.",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);
      assert.equal(body.data.status, "resolved");
      assert.equal(String(body.data.reviewedBy), String(adminUser._id));
    });
  });

  // =========================================================================
  // STEP 9 — Admin Platform Analytics Flow (FR-019, Engineer 4)
  // =========================================================================
  describe("Step 9: Admin Platform Analytics (FR-019, DB Plan Section 14, Eng 4)", () => {
    test("9.1 Non-admin cannot access GET /api/admin/analytics (403 Forbidden)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${seekerToken}` },
      });
      assert.equal(res.status, 403);
    });

    test("9.2 Admin accesses GET /api/admin/analytics reflecting the live completed journey", async () => {
      const res = await fetch(`${baseUrl}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.equal(body.success, true);

      const { summary, resourcesByCategory, categoryImpact, matchAcceptance } = body.data;

      // Assert Summary metrics reflect live database state
      assert.ok(summary.totalUsers >= 3, `Expected totalUsers >= 3, got ${summary.totalUsers}`);
      assert.ok(summary.activeUsers >= 3, `Expected activeUsers >= 3, got ${summary.activeUsers}`);
      assert.ok(summary.completedTransfers >= 1, `Expected completedTransfers >= 1, got ${summary.completedTransfers}`);
      assert.ok(summary.requestsCreated >= 1, `Expected requestsCreated >= 1, got ${summary.requestsCreated}`);
      assert.ok(summary.registeredOrganizations >= 1, `Expected registeredOrganizations >= 1, got ${summary.registeredOrganizations}`);

      // Category-level impact reflects completed transfer
      assert.ok(Array.isArray(categoryImpact));

      // Match acceptance reflects live match state
      assert.ok(matchAcceptance.total >= 1);
      assert.ok(matchAcceptance.accepted >= 1);
    });
  });
});
