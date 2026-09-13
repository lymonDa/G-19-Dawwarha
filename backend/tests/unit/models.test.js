import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Organization from "../../src/models/Organization.js";
import { transitionVerification } from "../../src/services/organizationService.js";
import User from "../../src/models/User.js";

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
  await Organization.init();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("MongoDB foundation", () => {
  it("creates a user and hides passwordHash from normal queries", async () => {
    await User.create({ name: "Test User", email: "test@example.com", passwordHash: "hash" });
    const user = await User.findOne({ email: "test@example.com" });
    assert.ok(user);
    assert.equal(user.passwordHash, undefined);
  });

  it("validates email, name, role, status, and location shape", async () => {
    const invalid = new User({
      name: "x",
      email: "not-an-email",
      passwordHash: "hash",
      role: "invalid",
      status: "invalid",
      location: { city: "Cairo", country: "Egypt" },
    });

    it("requires an email when creating a user", () => {
      const error = new User({ name: "No Email", passwordHash: "hash" }).validateSync();
      assert.ok(error?.errors.email);
    });
    const error = invalid.validateSync();
    assert.ok(error);
    assert.ok(error.errors.email);
    assert.ok(error.errors.name);
    assert.ok(error.errors.role);
    assert.ok(error.errors.status);
    assert.equal(invalid.location.area, undefined);

    const legacyRole = new User({
      name: "Legacy Role",
      email: "legacy-role@example.com",
      passwordHash: "hash",
      role: "provider",
    });
    assert.ok(legacyRole.validateSync()?.errors.role);
  });

  it("provides the shared user stats counters", () => {
    const user = new User({
      name: "Stats User",
      email: "stats@example.com",
      passwordHash: "hash",
    });
    assert.equal(user.role, "user");
    assert.equal(user.stats.requests, 0);
    assert.equal(user.stats.completed, 0);
    assert.equal(user.stats.completedTransfers, 0);
    assert.equal(user.stats.failedTransfers, 0);
    assert.equal(user.stats.reputationScore, 0);
  });

  it("rejects duplicate email addresses", async () => {
    await assert.rejects(
      User.create({ name: "Another User", email: "test@example.com", passwordHash: "hash" }),
      (error) => error.code === 11000,
    );
  });

  it("creates pending organizations and validates rejected reasons", async () => {
    const owner = await User.create({ name: "Owner User", email: "owner@example.com", passwordHash: "hash" });
    const pending = await Organization.create({ name: "Pending Org", ownerUserId: owner._id });
    assert.equal(pending.verification.status, "pending");

    const rejected = new Organization({
      name: "Rejected Org",
      ownerUserId: owner._id,
      verification: { status: "rejected" },
    });
    assert.ok(rejected.validateSync().errors["verification.rejectionReason"]);
    assert.equal(Organization.schema.path("ownerUserId").options.ref, "User");
  });

  it("records the reviewer and timestamp during verification", async () => {
    const owner = await User.create({ name: "Review Owner", email: "review-owner@example.com", passwordHash: "hash" });
    const reviewer = await User.create({ name: "Reviewer", email: "reviewer@example.com", passwordHash: "hash", role: "admin" });
    const organization = await Organization.create({ name: "Review Org", ownerUserId: owner._id });
    const updated = await transitionVerification(organization._id, "approved", undefined, reviewer._id);
    assert.equal(String(updated.verification.reviewedBy), String(reviewer._id));
    assert.ok(updated.verification.reviewedAt instanceof Date);
  });

  it("allows approved organizations to be suspended and rejects invalid transitions", async () => {
    const owner = await User.create({ name: "Lifecycle Owner", email: "lifecycle-owner@example.com", passwordHash: "hash" });
    const reviewer = await User.create({ name: "Lifecycle Reviewer", email: "lifecycle-reviewer@example.com", passwordHash: "hash", role: "admin" });
    const organization = await Organization.create({
      name: "Lifecycle Org",
      ownerUserId: owner._id,
      verification: { status: "approved" },
    });

    const suspended = await transitionVerification(organization._id, "suspended", undefined, reviewer._id);
    assert.equal(suspended.verification.status, "suspended");
    await assert.rejects(
      transitionVerification(organization._id, "approved", undefined, reviewer._id),
      (error) => error.code === "INVALID_TRANSITION" && error.statusCode === 409,
    );
  });

  it("defines the verification queue and ownership indexes", () => {
    const indexes = Organization.schema.indexes().map(([fields]) => fields);
    assert.deepEqual(indexes, [
      { ownerUserId: 1 },
      { "verification.status": 1, createdAt: 1 },
    ]);
    assert.ok(User.schema.indexes().some(([fields]) => fields.status === 1));
  });

  it("persists organization contactInfo with physical address", async () => {
    const owner = await User.create({ name: "Contact Owner", email: "contact-owner@example.com", passwordHash: "hash" });
    const org = await Organization.create({
      name: "Address Org",
      ownerUserId: owner._id,
      contactInfo: {
        email: "org@example.com",
        phone: "+9626123456",
        address: {
          street: "Al-Madina St",
          city: "Amman",
          state: "Amman",
          postalCode: "11180",
          country: "Jordan",
        },
      },
    });
    assert.equal(org.contactInfo.email, "org@example.com");
    assert.equal(org.contactInfo.phone, "+9626123456");
    assert.equal(org.contactInfo.address.city, "Amman");
    assert.equal(org.contactInfo.address.country, "Jordan");
  });
});
