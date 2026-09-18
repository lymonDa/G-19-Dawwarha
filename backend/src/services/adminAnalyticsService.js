import mongoose from "mongoose";
import User from "../models/User.js";
import Handover from "../models/Handover.js";
import Report from "../models/Report.js";
import Contribution from "../models/Contribution.js";
import Organization from "../models/Organization.js";
import  matchModel  from "../models/Match.js";
import  requestModel  from "../models/Request.js";

/**
 * Execute aggregation pipeline on the un-modeled resources collection.
 * Uses Mongoose connection collection or registered model if present.
 */
async function aggregateResources(pipeline) {
  if (mongoose.models.Resource) {
    return await mongoose.models.Resource.aggregate(pipeline);
  }
  const col = mongoose.connection.collection("resources");
  const cursor = col.aggregate(pipeline);
  return typeof cursor.toArray === "function" ? await cursor.toArray() : await cursor;
}

/**
 * Count documents in resources collection.
 */
async function countResources(filter = {}) {
  if (mongoose.models.Resource) {
    return await mongoose.models.Resource.countDocuments(filter);
  }
  const col = mongoose.connection.collection("resources");
  if (typeof col.countDocuments === "function") {
    return await col.countDocuments(filter);
  }
  const cursor = col.aggregate([{ $match: filter }, { $count: "count" }]);
  const res = typeof cursor.toArray === "function" ? await cursor.toArray() : await cursor;
  return res && res[0]?.count ? res[0].count : 0;
}

/**
 * Pipeline 1: Admin Dashboard Summary (DB Plan Section 14)
 * Section 25 metrics: Total Users, Active Users, Resources Published, Completed Transfers,
 * Requests Created, Open Reports, Registered Organizations.
 * Parallel $count / $group queries running concurrently.
 */
async function getSummary() {
  const [
    totalUsers,
    activeUsers,
    resourcesPublished,
    completedTransfers,
    requestsCreated,
    openReports,
    registeredOrganizations,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: "active" }),
    countResources({ status: { $ne: "draft" } }),
    Handover.countDocuments({ status: "completed" }),
    requestModel.countDocuments({ status: { $ne: "draft" } }),
    Report.countDocuments({ status: "open" }),
    Organization.countDocuments({}),
  ]);

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    resourcesPublished: resourcesPublished || 0,
    completedTransfers: completedTransfers || 0,
    requestsCreated: requestsCreated || 0,
    openReports: openReports || 0,
    registeredOrganizations: registeredOrganizations || 0,
  };
}

/**
 * Pipeline 2: Resources published vs. fulfilled by category (DB Plan Section 14)
 * "undersupplied categories" insight (brief Section 25)
 * $group by categoryId, $count by status
 * Produces table for admin with published vs fulfilled rollup per category.
 */
async function getResourcesByCategory() {
  const pipeline = [
    {
      $match: {
        status: { $ne: "draft" },
      },
    },
    {
      $group: {
        _id: {
          categoryId: "$categoryId",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.categoryId",
        categoryId: { $first: "$_id.categoryId" },
        total: { $sum: "$count" },
        published: {
          $sum: {
            $cond: [
              { $in: ["$_id.status", ["published", "matched", "accepted"]] },
              "$count",
              0,
            ],
          },
        },
        fulfilled: {
          $sum: {
            $cond: [
              { $in: ["$_id.status", ["completed", "fulfilled"]] },
              "$count",
              0,
            ],
          },
        },
        byStatus: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: { $ifNull: ["$categoryId", "$_id"] },
        published: 1,
        fulfilled: 1,
        total: 1,
        byStatus: 1,
      },
    },
    {
      $sort: { total: -1 },
    },
  ];

  const results = await aggregateResources(pipeline);
  return Array.isArray(results) ? results : [];
}

/**
 * Pipeline 3: Category-level impact (DB Plan Section 14)
 * Impact Metrics (brief Section 26)
 * contributions: $group by categoryId, $sum: quantity, $count
 * Result: Cumulative completed transfers per category.
 */
async function getCategoryImpact() {
  const pipeline = [
    {
      $match: {
        type: "transfer_completed",
      },
    },
    {
      $group: {
        _id: "$categoryId",
        categoryId: { $first: "$categoryId" },
        completedTransfers: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: { $ifNull: ["$categoryId", "$_id"] },
        completedTransfers: 1,
        totalQuantity: 1,
      },
    },
    {
      $sort: { completedTransfers: -1 },
    },
  ];

  const results = await Contribution.aggregate(pipeline);
  return Array.isArray(results) ? results : [];
}

/**
 * Pipeline 4: Match acceptance rate (DB Plan Section 14)
 * "matching quality" admin decision input
 * matches: $group by status, $count
 * Result: proposed vs accepted vs rejected ratio.
 */
async function getMatchAcceptance() {
  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
    {
      $sort: { status: 1 },
    },
  ];

  const statusCounts = await matchModel.aggregate(pipeline);
  const byStatus = Array.isArray(statusCounts) ? statusCounts : [];

  let total = 0;
  let proposed = 0;
  let accepted = 0;
  let rejected = 0;

  for (const item of byStatus) {
    const c = Number(item.count) || 0;
    total += c;
    if (item.status === "proposed") proposed = c;
    else if (item.status === "accepted") accepted = c;
    else if (item.status === "rejected") rejected = c;
  }

  const decided = accepted + rejected;
  const acceptanceRate = decided > 0 ? Number((accepted / decided).toFixed(4)) : 0;

  return {
    total,
    proposed,
    accepted,
    rejected,
    acceptanceRate,
    byStatus,
  };
}

/**
 * Get all analytics dynamically from existing collections.
 * Read-only: zero database mutation.
 */
async function getAnalytics() {
  const [summary, resourcesByCategory, categoryImpact, matchAcceptance] =
    await Promise.all([
      getSummary(),
      getResourcesByCategory(),
      getCategoryImpact(),
      getMatchAcceptance(),
    ]);

  return {
    summary,
    resourcesByCategory,
    categoryImpact,
    matchAcceptance,
  };
}

export default {
  getSummary,
  getResourcesByCategory,
  getCategoryImpact,
  getMatchAcceptance,
  getAnalytics,
};
