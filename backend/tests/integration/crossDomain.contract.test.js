import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "../../src/config/database.js";
import User from "../../src/models/User.js";
import Category from "../../src/models/Category.js";
import Resource from "../../src/models/Resource.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import { requestModel } from "../../src/models/Request.js";
import { matchModel } from "../../src/models/Match.js";
import { acceptMatch } from "../../src/services/matchingService.js";
import { confirm } from "../../src/services/handoverService.js";

describe("PHASE 5 — Cross-Domain Integration & Atomic Transaction Contracts", () => {
  const runId = Date.now();
  const createdIds = {
    users: [],
    categories: [],
    resources: [],
    requests: [],
    matches: [],
    handovers: [],
    contributions: [],
  };

  let provider;
  let seeker;
  let category;

  before(async () => {
    await connectDB();

    provider = await User.create({
      name: "Contract Provider",
      email: `contract_p_${runId}@dawwarha.test`,
      passwordHash: "hash",
      role: "user",
      status: "active",
    });
    createdIds.users.push(provider._id);

    seeker = await User.create({
      name: "Contract Seeker",
      email: `contract_s_${runId}@dawwarha.test`,
      passwordHash: "hash",
      role: "user",
      status: "active",
    });
    createdIds.users.push(seeker._id);

    category = await Category.create({
      name: `Contract Category ${runId}`,
      slug: `contract-cat-${runId}`,
    });
    createdIds.categories.push(category._id);
  });

  after(async () => {
    try {
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
      if (createdIds.users.length > 0) {
        await User.deleteMany({ _id: { $in: createdIds.users } });
      }
    } catch {
      // ignore teardown cleanup errors
    }
    await mongoose.disconnect();
  });

  // =========================================================================
  // CONTRACT A: Match Acceptance (Resource + Request + Match + Handover)
  // =========================================================================
  describe("Contract A: Match Acceptance Multi-Document Transaction", () => {
    test("A.1 Happy Path: Atomic transition of Resource, Request, Match, and Handover creation", async () => {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const resource = await Resource.create({
        title: "Atomic Test Resource",
        description: "Atomic Test Resource Description",
        categoryId: category._id,
        providerId: provider._id,
        quantity: 5,
        status: "published",
        location: { city: "Amman", address: "Mecca St" },
        availabilityWindow: { start, end },
      });
      createdIds.resources.push(resource._id);

      const request = await requestModel.create({
        title: "Atomic Test Request",
        categoryId: category._id,
        requesterId: seeker._id,
        quantity: 5,
        status: "published",
        location: { city: "Amman" },
      });
      createdIds.requests.push(request._id);

      const match = await matchModel.create({
        resourceId: resource._id,
        requestId: request._id,
        providerId: provider._id,
        requesterId: seeker._id,
        score: 0.88,
        status: "proposed",
      });
      createdIds.matches.push(match._id);

      // Act: Seeker accepts the match
      const result = await acceptMatch(match._id.toString(), seeker);

      assert.ok(result.handoverId);
      createdIds.handovers.push(result.handoverId);

      // Assert: Verify all 4 documents in MongoDB
      const updatedMatch = await matchModel.findById(match._id);
      const updatedResource = await Resource.findById(resource._id);
      const updatedRequest = await requestModel.findById(request._id);
      const createdHandover = await Handover.findById(result.handoverId);

      assert.equal(updatedMatch.status, "accepted");
      assert.equal(updatedResource.status, "accepted");
      assert.equal(updatedRequest.status, "accepted");
      assert.equal(createdHandover.status, "in_progress");
      assert.equal(String(createdHandover.providerId), String(provider._id));
      assert.equal(String(createdHandover.seekerId), String(seeker._id));
    });

    test("A.2 Rollback Invariant: If request is in invalid state, match acceptance rolls back completely", async () => {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const resource = await Resource.create({
        title: "Rollback Test Resource",
        description: "Rollback Test Resource Description",
        categoryId: category._id,
        providerId: provider._id,
        quantity: 5,
        status: "published",
        location: { city: "Amman", address: "Mecca St" },
        availabilityWindow: { start, end },
      });
      createdIds.resources.push(resource._id);

      // Request is already cancelled (terminal state)
      const request = await requestModel.create({
        title: "Cancelled Request",
        categoryId: category._id,
        requesterId: seeker._id,
        quantity: 5,
        status: "cancelled",
        location: { city: "Amman" },
      });
      createdIds.requests.push(request._id);

      const match = await matchModel.create({
        resourceId: resource._id,
        requestId: request._id,
        providerId: provider._id,
        requesterId: seeker._id,
        score: 0.85,
        status: "proposed",
      });
      createdIds.matches.push(match._id);

      // Act & Assert: acceptance throws error
      await assert.rejects(
        () => acceptMatch(match._id.toString(), seeker),
        (err) => err.code === "INVALID_TRANSITION" || err.statusCode === 409
      );

      // Assert rollback: Resource must remain published, Match must remain proposed, NO Handover created
      const dbMatch = await matchModel.findById(match._id);
      const dbResource = await Resource.findById(resource._id);
      const handovers = await Handover.find({ matchId: match._id });

      assert.equal(dbMatch.status, "proposed");
      assert.equal(dbResource.status, "published");
      assert.equal(handovers.length, 0);
    });
  });

  // =========================================================================
  // CONTRACT B: Handover Confirmation Cascade (Handover -> Contribution -> Resource -> Request)
  // =========================================================================
  describe("Contract B: Handover Confirmation Cascade & Atomicity", () => {
    test("B.1 Happy Path: Two-sided confirmation cascades to Resource impact_recorded, Request fulfilled, Contribution created", async () => {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const resource = await Resource.create({
        title: "Cascade Test Resource",
        description: "Cascade Test Resource Description",
        categoryId: category._id,
        providerId: provider._id,
        quantity: 2,
        status: "accepted",
        location: { city: "Amman", address: "Garden St" },
        availabilityWindow: { start, end },
      });
      createdIds.resources.push(resource._id);

      const request = await requestModel.create({
        title: "Cascade Test Request",
        categoryId: category._id,
        requesterId: seeker._id,
        quantity: 2,
        status: "accepted",
        location: { city: "Amman" },
      });
      createdIds.requests.push(request._id);

      const match = await matchModel.create({
        resourceId: resource._id,
        requestId: request._id,
        providerId: provider._id,
        requesterId: seeker._id,
        score: 0.90,
        status: "accepted",
      });
      createdIds.matches.push(match._id);

      const handover = await Handover.create({
        matchId: match._id,
        resourceId: resource._id,
        requestId: request._id,
        providerId: provider._id,
        seekerId: seeker._id,
        status: "in_progress",
      });
      createdIds.handovers.push(handover._id);

      // Provider confirms first
      const firstConfirm = await confirm(handover._id, "provider", provider._id);
      assert.equal(firstConfirm.status, "in_progress");
      assert.equal(firstConfirm.confirmedByProvider, true);
      assert.equal(firstConfirm.confirmedBySeeker, false);

      // Assert no contribution yet, resource still accepted
      const midContrib = await Contribution.findOne({ handoverId: handover._id });
      assert.equal(midContrib, null);
      const midResource = await Resource.findById(resource._id);
      assert.equal(midResource.status, "accepted");

      // Seeker confirms second
      const secondConfirm = await confirm(handover._id, "seeker", seeker._id);
      assert.equal(secondConfirm.status, "completed");
      assert.equal(secondConfirm.confirmedBySeeker, true);

      // Assert final DB states
      const finalResource = await Resource.findById(resource._id);
      assert.equal(finalResource.status, "impact_recorded");

      const finalRequest = await requestModel.findById(request._id);
      assert.equal(finalRequest.status, "fulfilled");

      const finalContrib = await Contribution.findOne({ handoverId: handover._id });
      assert.ok(finalContrib);
      assert.equal(String(finalContrib.providerId), String(provider._id));
      assert.equal(String(finalContrib.seekerId), String(seeker._id));
      createdIds.contributions.push(finalContrib._id);
    });

    test("B.2 Idempotency: Repeated confirmation does not duplicate Contribution or re-transition", async () => {
      const handovers = await Handover.find({ status: "completed" });
      assert.ok(handovers.length >= 1);
      const completedHandover = handovers[0];

      const repeatConfirm = await confirm(completedHandover._id, "provider", completedHandover.providerId);
      assert.equal(repeatConfirm.status, "completed");

      const contribCount = await Contribution.countDocuments({ handoverId: completedHandover._id });
      assert.equal(contribCount, 1);
    });

    test("B.3 Unauthorized Confirmation Rejection: Non-party receives 403 Forbidden", async () => {
      const handovers = await Handover.find({ status: "in_progress" });
      if (handovers.length > 0) {
        const target = handovers[0];
        const randomUserId = new mongoose.Types.ObjectId();
        await assert.rejects(
          () => confirm(target._id, "provider", randomUserId),
          (err) => err.statusCode === 403
        );
      }
    });
  });
});
