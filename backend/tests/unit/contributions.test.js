import { test, describe, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Handover from "../../src/models/Handover.js";
import Contribution from "../../src/models/Contribution.js";
import contributionService from "../../src/services/contributionService.js";

const JWT_SECRET = "test-jwt-secret-for-testing-only-12345";
process.env.JWT_SECRET = JWT_SECRET;

describe("Task 4.D — Contributions Service, Ledger & Endpoint Test Suite", () => {
  let server;
  let baseUrl;

  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const userCId = new mongoose.Types.ObjectId().toString();

  let userAToken;
  let userBToken;

  before(async () => {
    userAToken = jwt.sign({ sub: userAId, role: "user" }, JWT_SECRET);
    userBToken = jwt.sign({ sub: userBId, role: "user" }, JWT_SECRET);

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

    // Default User.findById mock
    mock.method(User, "findById", (id) => {
      const strId = String(id);
      let foundUser = null;
      if (strId === userAId) {
        foundUser = {
          _id: userAId,
          role: "user",
          status: "active",
          name: "User A",
          stats: { completedTransfers: 0, completed: 0, reputationScore: 0 },
          reputationScore: 0,
        };
      } else if (strId === userBId) {
        foundUser = {
          _id: userBId,
          role: "user",
          status: "active",
          name: "User B",
          stats: { completedTransfers: 0, completed: 0, reputationScore: 0 },
          reputationScore: 0,
        };
      }
      return {
        ...foundUser,
        lean: async () => foundUser,
      };
    });
  });

  // =========================================================================
  // 1. Existing recordCompletedTransfer Invariants
  // =========================================================================
  describe("Existing recordCompletedTransfer Behavior (Task 4.A Preservation)", () => {
    test("1 & 2. Completed handover creates exactly one Contribution and duplicate invocation is idempotent", async () => {
      const handoverId = new mongoose.Types.ObjectId();
      const providerId = new mongoose.Types.ObjectId();
      const seekerId = new mongoose.Types.ObjectId();
      const categoryId = new mongoose.Types.ObjectId();

      const fakeHandover = {
        _id: handoverId,
        providerId,
        seekerId,
        categoryId,
        quantity: 2,
        status: "completed",
      };

      const ledger = [];
      mock.method(Contribution, "findOne", async ({ handoverId: hId }) => {
        return ledger.find((c) => String(c.handoverId) === String(hId)) || null;
      });

      mock.method(Contribution, "create", async (data) => {
        const doc = { _id: new mongoose.Types.ObjectId(), ...data };
        ledger.push(doc);
        return doc;
      });

      const userStats = {
        [String(providerId)]: { completedTransfers: 0, reputationScore: 0 },
        [String(seekerId)]: { completedTransfers: 0, reputationScore: 0 },
      };

      mock.method(User, "findByIdAndUpdate", async (uid, update) => {
        const strUid = String(uid);
        if (userStats[strUid] && update?.$inc) {
          userStats[strUid].completedTransfers += update.$inc["stats.completedTransfers"] || 0;
          userStats[strUid].reputationScore += update.$inc.reputationScore || 0;
        }
        return { _id: uid };
      });

      // First call -> creates contribution and increments counters
      const firstResult = await contributionService.recordCompletedTransfer(fakeHandover);
      assert.ok(firstResult);
      assert.equal(ledger.length, 1);
      assert.equal(userStats[String(providerId)].completedTransfers, 1);
      assert.equal(userStats[String(seekerId)].completedTransfers, 1);
      assert.equal(userStats[String(providerId)].reputationScore, 10);

      // Second call -> returns existing without creating second contribution or incrementing counters
      const secondResult = await contributionService.recordCompletedTransfer(fakeHandover);
      assert.ok(secondResult);
      assert.equal(ledger.length, 1, "Duplicate invocation must not create second Contribution");
      assert.equal(userStats[String(providerId)].completedTransfers, 1);
      assert.equal(userStats[String(seekerId)].completedTransfers, 1);
      assert.equal(userStats[String(providerId)].reputationScore, 10);
    });
  });

  // =========================================================================
  // 2. getContributionHistory Service & GET /api/users/me/contributions
  // =========================================================================
  describe("getContributionHistory & GET /api/users/me/contributions", () => {
    const makeFakeContribution = (id, providerId, seekerId, date) => ({
      _id: id,
      type: "transfer_completed",
      handoverId: new mongoose.Types.ObjectId(),
      providerId: new mongoose.Types.ObjectId(String(providerId)),
      seekerId: new mongoose.Types.ObjectId(String(seekerId)),
      categoryId: new mongoose.Types.ObjectId(),
      quantity: 1,
      createdAt: new Date(date),
    });

    test("4 & 5. Authenticated user retrieves their own contribution history with correct contributions", async () => {
      const c1 = makeFakeContribution(new mongoose.Types.ObjectId().toString(), userAId, userBId, "2026-03-01T10:00:00Z");
      const c2 = makeFakeContribution(new mongoose.Types.ObjectId().toString(), userBId, userAId, "2026-03-02T10:00:00Z");
      const c3 = makeFakeContribution(new mongoose.Types.ObjectId().toString(), userBId, userCId, "2026-03-03T10:00:00Z"); // userA not involved

      const mockDocs = [c2, c1]; // userA is involved in c1 and c2

      let passedQuery = null;
      mock.method(Contribution, "find", (query) => {
        passedQuery = query;
        return {
          sort: () => ({
            skip: () => ({
              limit: async () => mockDocs,
            }),
          }),
        };
      });
      mock.method(Contribution, "countDocuments", async () => 2);

      const res = await fetch(`${baseUrl}/api/users/me/contributions`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.length, 2);
      assert.deepEqual(json.pagination, {
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      // Verify query is strictly restricted to userA
      assert.deepEqual(passedQuery, {
        $or: [
          { providerId: new mongoose.Types.ObjectId(userAId) },
          { seekerId: new mongoose.Types.ObjectId(userAId) },
        ],
      });
    });

    test("6 & 7. Pagination works correctly with page and limit query parameters", async () => {
      let passedSkip = null;
      let passedLimit = null;

      mock.method(Contribution, "find", () => ({
        sort: () => ({
          skip: (s) => ({
            limit: async (l) => {
              passedSkip = s;
              passedLimit = l;
              return [];
            },
          }),
        }),
      }));
      mock.method(Contribution, "countDocuments", async () => 50);

      const res = await fetch(`${baseUrl}/api/users/me/contributions?page=2&limit=15`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(passedSkip, 15);
      assert.equal(passedLimit, 15);
      assert.deepEqual(json.pagination, {
        total: 50,
        page: 2,
        limit: 15,
        totalPages: 4,
      });
    });

    test("8 & 9. Invalid page/limit are normalized to safe defaults", async () => {
      let passedSkip = null;
      let passedLimit = null;

      mock.method(Contribution, "find", () => ({
        sort: () => ({
          skip: (s) => ({
            limit: async (l) => {
              passedSkip = s;
              passedLimit = l;
              return [];
            },
          }),
        }),
      }));
      mock.method(Contribution, "countDocuments", async () => 0);

      const res = await fetch(`${baseUrl}/api/users/me/contributions?page=-5&limit=invalid`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.equal(res.status, 200);
      assert.equal(passedSkip, 0); // page 1 -> skip 0
      assert.equal(passedLimit, 20); // default limit 20
    });

    test("10. Excessive limit is constrained to maximum allowable limit (100)", async () => {
      let passedLimit = null;

      mock.method(Contribution, "find", () => ({
        sort: () => ({
          skip: () => ({
            limit: async (l) => {
              passedLimit = l;
              return [];
            },
          }),
        }),
      }));
      mock.method(Contribution, "countDocuments", async () => 0);

      const res = await fetch(`${baseUrl}/api/users/me/contributions?limit=9999999`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.equal(res.status, 200);
      assert.equal(passedLimit, 100);
    });

    test("11. Unauthenticated request to /api/users/me/contributions returns HTTP 401", async () => {
      const res = await fetch(`${baseUrl}/api/users/me/contributions`);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, "UNAUTHORIZED");
    });

    test("12. User spoofing protection: client sending ?userId=<someone_else> is ignored", async () => {
      let passedQuery = null;
      mock.method(Contribution, "find", (query) => {
        passedQuery = query;
        return {
          sort: () => ({
            skip: () => ({
              limit: async () => [],
            }),
          }),
        };
      });
      mock.method(Contribution, "countDocuments", async () => 0);

      const maliciousTargetId = new mongoose.Types.ObjectId().toString();

      const res = await fetch(`${baseUrl}/api/users/me/contributions?userId=${maliciousTargetId}`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.equal(res.status, 200);
      // Query MUST use userAToken identity, never the query parameter!
      assert.deepEqual(passedQuery, {
        $or: [
          { providerId: new mongoose.Types.ObjectId(userAId) },
          { seekerId: new mongoose.Types.ObjectId(userAId) },
        ],
      });
      assert.notEqual(String(passedQuery.$or[0].providerId), maliciousTargetId);
    });

    test("13. MongoDB operator injection protection: arbitrary query operators are ignored", async () => {
      let passedQuery = null;
      mock.method(Contribution, "find", (query) => {
        passedQuery = query;
        return {
          sort: () => ({
            skip: () => ({
              limit: async () => [],
            }),
          }),
        };
      });
      mock.method(Contribution, "countDocuments", async () => 0);

      const res = await fetch(
        `${baseUrl}/api/users/me/contributions?$where=sleep(1000)&quantity[$gt]=0&evilField=true`,
        {
          headers: {
            Authorization: `Bearer ${userAToken}`,
          },
        }
      );

      assert.equal(res.status, 200);
      assert.equal(passedQuery.$where, undefined);
      assert.equal(passedQuery.evilField, undefined);
      assert.equal(passedQuery.quantity, undefined);
    });

    test("14. Deterministic sort ordering: query sorts by createdAt descending", async () => {
      let passedSort = null;
      mock.method(Contribution, "find", () => ({
        sort: (sortObj) => {
          passedSort = sortObj;
          return {
            skip: () => ({
              limit: async () => [],
            }),
          };
        },
      }));
      mock.method(Contribution, "countDocuments", async () => 0);

      await fetch(`${baseUrl}/api/users/me/contributions`, {
        headers: {
          Authorization: `Bearer ${userAToken}`,
        },
      });

      assert.deepEqual(passedSort, { createdAt: -1 });
    });
  });

  // =========================================================================
  // 3. rebuildStatsCache Invariants
  // =========================================================================
  describe("rebuildStatsCache Invariants & Idempotency", () => {
    test("15 & 16. Rebuild calculates stats directly from ledger and does not blindly increment", async () => {
      const testUserId = new mongoose.Types.ObjectId().toString();

      // Mock 3 completed transfers in the ledger
      mock.method(Contribution, "countDocuments", async (filter) => {
        assert.equal(filter.type, "transfer_completed");
        return 3;
      });

      let updatedFields = null;
      mock.method(User, "findByIdAndUpdate", async (id, update) => {
        assert.equal(String(id), testUserId);
        updatedFields = update.$set;
        return { _id: id, stats: updatedFields };
      });

      const result = await contributionService.rebuildStatsCache(testUserId);
      assert.ok(result);
      assert.equal(result.stats.completedTransfers, 3);
      assert.equal(result.stats.completed, 3);
      assert.equal(result.stats.reputationScore, 30);
      assert.deepEqual(updatedFields, {
        "stats.completedTransfers": 3,
        "stats.completed": 3,
        "stats.reputationScore": 30,
        reputationScore: 30,
      });
    });

    test("17. Running rebuildStatsCache twice is strictly idempotent and produces identical results", async () => {
      const testUserId = new mongoose.Types.ObjectId().toString();

      mock.method(Contribution, "countDocuments", async () => 5);

      let lastSet = null;
      mock.method(User, "findByIdAndUpdate", async (id, update) => {
        lastSet = update.$set;
        return { _id: id, stats: lastSet };
      });

      // Run 1
      const res1 = await contributionService.rebuildStatsCache(testUserId);
      assert.equal(res1.stats.completedTransfers, 5);
      assert.equal(res1.stats.reputationScore, 50);

      // Run 2
      const res2 = await contributionService.rebuildStatsCache(testUserId);
      assert.equal(res2.stats.completedTransfers, 5);
      assert.equal(res2.stats.reputationScore, 50);

      assert.deepEqual(res1.stats, res2.stats);
    });

    test("18. Corrects drifted or corrupted user stats back to the source-of-truth ledger", async () => {
      const testUserId = new mongoose.Types.ObjectId().toString();

      // Ledger has 2 contributions, but user cache was corrupted to 9999
      mock.method(Contribution, "countDocuments", async () => 2);

      let savedUpdate = null;
      mock.method(User, "findByIdAndUpdate", async (id, update) => {
        savedUpdate = update.$set;
        return { _id: id, stats: savedUpdate };
      });

      const result = await contributionService.rebuildStatsCache(testUserId);
      assert.equal(result.stats.completedTransfers, 2);
      assert.equal(result.stats.reputationScore, 20);
      assert.equal(savedUpdate["stats.completedTransfers"], 2);
    });

    test("19. Rebuild does not insert or alter Contribution documents", async () => {
      const testUserId = new mongoose.Types.ObjectId().toString();

      let contributionCreateCalled = false;
      mock.method(Contribution, "create", async () => {
        contributionCreateCalled = true;
      });
      mock.method(Contribution, "countDocuments", async () => 1);
      mock.method(User, "findByIdAndUpdate", async (id, update) => ({ _id: id }));

      await contributionService.rebuildStatsCache(testUserId);
      assert.equal(contributionCreateCalled, false, "Rebuild must never create Contribution documents");
    });

    test("Invalid userId passed to rebuildStatsCache throws HTTP 400", async () => {
      await assert.rejects(
        async () => {
          await contributionService.rebuildStatsCache("not-valid-id");
        },
        { statusCode: 400, code: "VALIDATION_ERROR" }
      );
    });
  });
});
