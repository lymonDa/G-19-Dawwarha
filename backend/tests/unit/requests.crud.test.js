import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import Organization from "../../src/models/Organization.js";
import requestModel from "../../src/models/Request.js";
import requestRoutes from "../../src/routes/requests.routes.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const JWT_SECRET = "test_secret_for_requests_crud_tests_key!";
process.env.JWT_SECRET = JWT_SECRET;

describe("ENGINEER 3 — Request CRUD, Authorization & Validation Tests (Task 3.A)", () => {
  let mongo;
  let app;
  let server;
  let baseUrl;

  let ownerUser;
  let otherUser;
  let adminUser;
  let ownerToken;
  let otherToken;
  let adminToken;

  let activeCategory;
  let inactiveCategory;
  let approvedOrg;
  let pendingOrg;

  const sign = (user) =>
    jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    app = express();
    app.use(express.json());
    app.use("/api/requests", requestRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Organization.deleteMany({});
    await requestModel.deleteMany({});

    ownerUser = await User.create({
      name: "Request Owner",
      email: "owner@example.com",
      passwordHash: "hash123",
      role: "user",
    });

    otherUser = await User.create({
      name: "Other User",
      email: "other@example.com",
      passwordHash: "hash123",
      role: "user",
    });

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "hash123",
      role: "admin",
    });

    ownerToken = sign(ownerUser);
    otherToken = sign(otherUser);
    adminToken = sign(adminUser);

    activeCategory = await Category.create({
      name: "Active Medical Supplies",
      slug: "active-medical-supplies",
      isActive: true,
    });

    inactiveCategory = await Category.create({
      name: "Inactive Category",
      slug: "inactive-category",
      isActive: false,
    });

    approvedOrg = await Organization.create({
      name: "Approved Health Org",
      ownerUserId: ownerUser._id,
      verification: { status: "approved" },
    });

    pendingOrg = await Organization.create({
      name: "Pending Health Org",
      ownerUserId: ownerUser._id,
      verification: { status: "pending" },
    });
  });

  describe("POST /api/requests — Request Creation & Validation", () => {
    it("successfully creates a request with valid inputs and sets status to draft", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: String(activeCategory._id),
          quantity: 15,
          urgency: "high",
          location: { city: "Amman", area: "Shmeisani" },
          description: "Urgent need for first-aid kits",
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, "draft");
      assert.equal(body.data.quantity, 15);
      assert.equal(body.data.urgency, "high");
      assert.equal(String(body.data.requesterId), String(ownerUser._id));
    });

    it("rejects request creation when categoryId does not exist (400)", async () => {
      const nonexistentId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: nonexistentId,
          quantity: 10,
          urgency: "medium",
          location: { city: "Amman" },
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /Category not found or inactive/i);
    });

    it("rejects request creation when category is inactive (400)", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: String(inactiveCategory._id),
          quantity: 10,
          urgency: "medium",
          location: { city: "Amman" },
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /Category not found or inactive/i);
    });

    it("rejects request creation with non-positive quantity (400)", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: String(activeCategory._id),
          quantity: 0,
          urgency: "medium",
          location: { city: "Amman" },
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    it("rejects request creation with organization not owned by user (403)", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          categoryId: String(activeCategory._id),
          quantity: 5,
          urgency: "low",
          location: { city: "Amman" },
          requesterOrgId: String(approvedOrg._id),
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /belong to or own/i);
    });

    it("rejects request creation with unapproved organization (403)", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: String(activeCategory._id),
          quantity: 5,
          urgency: "low",
          location: { city: "Amman" },
          requesterOrgId: String(pendingOrg._id),
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error.message, /not approved/i);
    });

    it("prevents mass assignment of status (defaults to draft even if fulfilled is passed)", async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          categoryId: String(activeCategory._id),
          quantity: 5,
          urgency: "low",
          location: { city: "Amman" },
          status: "fulfilled",
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.data.status, "draft");
    });
  });

  describe("GET /api/requests — Listing & Pagination", () => {
    beforeEach(async () => {
      await requestModel.create([
        {
          requesterId: ownerUser._id,
          categoryId: activeCategory._id,
          quantity: 1,
          urgency: "low",
          location: { city: "Amman", area: "Abdali" },
          status: "published",
        },
        {
          requesterId: ownerUser._id,
          categoryId: activeCategory._id,
          quantity: 2,
          urgency: "medium",
          location: { city: "Zarqa", area: "Center" },
          status: "published",
        },
        {
          requesterId: otherUser._id,
          categoryId: activeCategory._id,
          quantity: 3,
          urgency: "high",
          location: { city: "Amman", area: "Webdeh" },
          status: "draft",
        },
      ]);
    });

    it("lists requests with pagination and metadata", async () => {
      const res = await fetch(`${baseUrl}/api/requests?page=1&limit=2`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 2);
      assert.equal(body.pagination.page, 1);
      assert.equal(body.pagination.limit, 2);
    });

    it("filters requests by status and city", async () => {
      const res = await fetch(`${baseUrl}/api/requests?status=published&city=Amman`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].location.city, "Amman");
      assert.equal(body.data[0].status, "published");
    });
  });

  describe("PUT & DELETE /api/requests/:id — Authorization & Mutation", () => {
    let reqDoc;

    beforeEach(async () => {
      reqDoc = await requestModel.create({
        requesterId: ownerUser._id,
        categoryId: activeCategory._id,
        quantity: 10,
        urgency: "medium",
        location: { city: "Amman", area: "Abdali" },
        status: "published",
      });
    });

    it("owner can update request details (200)", async () => {
      const res = await fetch(`${baseUrl}/api/requests/${reqDoc._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          quantity: 25,
          urgency: "high",
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.quantity, 25);
      assert.equal(body.data.urgency, "high");
    });

    it("non-owner non-admin cannot update request (403)", async () => {
      const res = await fetch(`${baseUrl}/api/requests/${reqDoc._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          quantity: 99,
        }),
      });

      assert.equal(res.status, 403);
    });

    it("cannot update a request in terminal state (409)", async () => {
      reqDoc.status = "fulfilled";
      await reqDoc.save();

      const res = await fetch(`${baseUrl}/api/requests/${reqDoc._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          quantity: 50,
        }),
      });

      assert.equal(res.status, 409);
    });

    it("owner can cancel request via DELETE (soft cancellation, status -> cancelled)", async () => {
      const res = await fetch(`${baseUrl}/api/requests/${reqDoc._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.status, "cancelled");

      const inDb = await requestModel.findById(reqDoc._id);
      assert.ok(inDb, "Document must remain persisted in DB");
      assert.equal(inDb.status, "cancelled");
    });

    it("non-owner non-admin cannot cancel request (403)", async () => {
      const res = await fetch(`${baseUrl}/api/requests/${reqDoc._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${otherToken}` },
      });

      assert.equal(res.status, 403);
    });
  });
});
