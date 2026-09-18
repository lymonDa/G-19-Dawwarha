import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import requestModel from "../../src/models/Request.js";
import {
  transitionRequest,
  transitions,
  TERMINAL_STATES,
  SYSTEM_ONLY_ACTIONS,
} from "../../src/services/requestLifecycleService.js";

describe("ENGINEER 3 — Request Lifecycle State Machine Tests (DB Plan 9.3)", () => {
  let mongo;
  let ownerUser;
  let otherUser;
  let adminUser;
  let systemActor;
  let category;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
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

    systemActor = { role: "system" };

    category = await Category.create({
      name: "Medical Supplies",
      slug: "medical-supplies",
      isActive: true,
    });
  });

  const createTestRequest = (status = "draft") => {
    return requestModel.create({
      requesterId: ownerUser._id,
      categoryId: category._id,
      quantity: 5,
      urgency: "medium",
      location: { city: "Amman", area: "Jabal Amman" },
      status,
    });
  };

  describe("Valid Lifecycle Transitions", () => {
    it("draft -> publish -> published (by owner)", async () => {
      const req = await createTestRequest("draft");
      const updated = await transitionRequest(req, "publish", ownerUser);
      assert.equal(updated.status, "published");
    });

    it("draft -> cancel -> cancelled (by owner)", async () => {
      const req = await createTestRequest("draft");
      const updated = await transitionRequest(req, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("published -> match -> matched (by system actor)", async () => {
      const req = await createTestRequest("published");
      const updated = await transitionRequest(req, "match", systemActor);
      assert.equal(updated.status, "matched");
    });

    it("published -> cancel -> cancelled (by owner)", async () => {
      const req = await createTestRequest("published");
      const updated = await transitionRequest(req, "cancel", ownerUser);
      assert.equal(updated.status, "cancelled");
    });

    it("published -> expire -> expired (by system actor)", async () => {
      const req = await createTestRequest("published");
      const updated = await transitionRequest(req, "expire", systemActor);
      assert.equal(updated.status, "expired");
    });

    it("matched -> accept -> accepted (by owner)", async () => {
      const req = await createTestRequest("matched");
      const updated = await transitionRequest(req, "accept", ownerUser);
      assert.equal(updated.status, "accepted");
    });

    it("matched -> reject -> published (when match is rejected)", async () => {
      const req = await createTestRequest("matched");
      const updated = await transitionRequest(req, "reject", ownerUser);
      assert.equal(updated.status, "published");
    });

    it("matched -> release -> published (when match is released)", async () => {
      const req = await createTestRequest("matched");
      const updated = await transitionRequest(req, "release", ownerUser);
      assert.equal(updated.status, "published");
    });

    it("matched -> cancel -> cancelled (by admin)", async () => {
      const req = await createTestRequest("matched");
      const updated = await transitionRequest(req, "cancel", adminUser);
      assert.equal(updated.status, "cancelled");
    });

    it("accepted -> complete -> fulfilled (when handover completes)", async () => {
      const req = await createTestRequest("accepted");
      const updated = await transitionRequest(req, "complete", systemActor);
      assert.equal(updated.status, "fulfilled");
    });
  });

  describe("System-Only Action Enforcement", () => {
    it("rejects non-system non-admin actor from calling 'expire' (403)", async () => {
      const req = await createTestRequest("published");
      await assert.rejects(
        () => transitionRequest(req, "expire", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.equal(err.code, "FORBIDDEN");
          assert.match(err.message, /system or admin/i);
          return true;
        }
      );
    });

    it("rejects non-system non-admin actor from calling 'match' (403)", async () => {
      const req = await createTestRequest("published");
      await assert.rejects(
        () => transitionRequest(req, "match", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.equal(err.code, "FORBIDDEN");
          return true;
        }
      );
    });

    it("allows admin to trigger system actions", async () => {
      const req = await createTestRequest("published");
      const updated = await transitionRequest(req, "expire", adminUser);
      assert.equal(updated.status, "expired");
    });
  });

  describe("Ownership & Authorization Enforcement", () => {
    it("rejects non-owner non-admin actor from calling 'publish' or 'cancel' (403)", async () => {
      const req = await createTestRequest("draft");
      await assert.rejects(
        () => transitionRequest(req, "publish", otherUser),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.equal(err.code, "FORBIDDEN");
          return true;
        }
      );
    });

    it("allows admin to transition request owned by another user", async () => {
      const req = await createTestRequest("draft");
      const updated = await transitionRequest(req, "publish", adminUser);
      assert.equal(updated.status, "published");
    });
  });

  describe("Terminal States & Invalid Transitions", () => {
    it("rejects any transition attempt on fulfilled request (409)", async () => {
      const req = await createTestRequest("fulfilled");
      await assert.rejects(
        () => transitionRequest(req, "publish", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 409);
          assert.equal(err.code, "INVALID_TRANSITION");
          assert.match(err.message, /terminal state: 'fulfilled'/i);
          return true;
        }
      );
    });

    it("rejects any transition attempt on cancelled request (409)", async () => {
      const req = await createTestRequest("cancelled");
      await assert.rejects(
        () => transitionRequest(req, "publish", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 409);
          assert.equal(err.code, "INVALID_TRANSITION");
          assert.match(err.message, /terminal state: 'cancelled'/i);
          return true;
        }
      );
    });

    it("rejects any transition attempt on expired request (409)", async () => {
      const req = await createTestRequest("expired");
      await assert.rejects(
        () => transitionRequest(req, "publish", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 409);
          assert.equal(err.code, "INVALID_TRANSITION");
          return true;
        }
      );
    });

    it("rejects invalid action for current status (e.g. draft -> accept) with 409", async () => {
      const req = await createTestRequest("draft");
      await assert.rejects(
        () => transitionRequest(req, "accept", ownerUser),
        (err) => {
          assert.equal(err.statusCode, 409);
          assert.equal(err.code, "INVALID_TRANSITION");
          assert.match(err.message, /Invalid transition: draft -> accept/i);
          return true;
        }
      );
    });
  });
});
