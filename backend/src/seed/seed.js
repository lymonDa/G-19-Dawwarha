import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import Handover from "../models/Handover.js";
import Contribution from "../models/Contribution.js";
import Notification from "../models/Notification.js";
import requestModel from "../models/Request.js";
import matchModel from "../models/Match.js";

// Production Safety Guard per Section 16/19
if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script execution aborted: Cannot seed database in production environment.");
}

const userDefinitions = [
  { key: "admin", name: "Dawwarha Admin", email: "admin@dawwarha.example", role: "admin" },
  { key: "provider", name: "Demo Provider", email: "provider@dawwarha.example", role: "user" },
  { key: "seeker", name: "Demo Seeker", email: "user@dawwarha.example", role: "user" },
];

const categoryDefinitions = [
  { name: "Food & Produce", slug: "food-produce", description: "Surplus meals, produce, and packaged foods." },
  { name: "Books & Media", slug: "books-media", description: "Educational books, literature, and media." },
  { name: "Furniture", slug: "furniture", description: "Desks, chairs, tables, and home furnishings." },
  { name: "Clothing & Textiles", slug: "clothing-textiles", description: "Clean garments, winter wear, and blankets." },
  { name: "School Supplies", slug: "school-supplies", description: "Notebooks, pens, backpacks, and stationery." },
  { name: "Office Equipment", slug: "office-equipment", description: "Electronics, printers, monitors, and fixtures." },
  { name: "Other", slug: "other", description: "Miscellaneous surplus and reusable items." },
];

export const seed = async () => {
  await connectDB();
  const passwordHash = await bcrypt.hash("DawwarhaDemo123!", 10);
  const seededUsers = {};

  // 1. Seed Core Accounts (Admin, Provider, Seeker)
  for (const def of userDefinitions) {
    seededUsers[def.key] = await User.findOneAndUpdate(
      { email: def.email },
      {
        $setOnInsert: {
          name: def.name,
          email: def.email,
          role: def.role,
          passwordHash,
          status: "active",
          stats: { completedTransfers: 0, reputationScore: 100 },
          reputationScore: 100,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  // 2. Seed Verified Organization (owned by Seeker, approved by Admin)
  const org = await Organization.findOneAndUpdate(
    { name: "Dawwarha Demo Organization" },
    {
      $setOnInsert: {
        name: "Dawwarha Demo Organization",
        description: "Pre-approved non-profit community aid organization for live demo.",
        ownerUserId: seededUsers.seeker._id,
        contactInfo: {
          email: "contact@dawwarha.example",
          phone: "+9626000000",
          address: {
            street: "King Hussein St",
            city: "Amman",
            state: "Amman",
            postalCode: "11118",
            country: "Jordan",
          },
        },
        verification: {
          status: "approved",
          reviewedBy: seededUsers.admin._id,
          reviewedAt: new Date(),
        },
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // 3. Seed 7 Taxonomy Categories
  const seededCategories = {};
  for (const cat of categoryDefinitions) {
    seededCategories[cat.slug] = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        $setOnInsert: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  const foodCategory = seededCategories["food-produce"];
  const clothingCategory = seededCategories["clothing-textiles"];

  // 4. Seed Live Demo Pair (Surplus Bread & Bread Request - Proposed Match)
  const demoResource = await Resource.findOneAndUpdate(
    { title: "Demo Surplus Bread" },
    {
      $setOnInsert: {
        title: "Demo Surplus Bread",
        description: "Fresh bakery surplus bread packages from morning bake.",
        providerId: seededUsers.provider._id,
        categoryId: foodCategory._id,
        quantity: 20,
        location: { city: "Amman", area: "Abdali" },
        availabilityWindow: {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: "available",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const demoRequest = await requestModel.findOneAndUpdate(
    { description: "Community bread assistance need" },
    {
      $setOnInsert: {
        title: "Community Bread Assistance Need",
        requesterId: seededUsers.seeker._id,
        requesterOrgId: org._id,
        categoryId: foodCategory._id,
        quantity: 10,
        urgency: "high",
        location: { city: "Amman", area: "Abdali" },
        description: "Community bread assistance need",
        status: "published",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await matchModel.findOneAndUpdate(
    { resourceId: demoResource._id, requestId: demoRequest._id },
    {
      $setOnInsert: {
        resourceId: demoResource._id,
        requestId: demoRequest._id,
        providerId: demoResource.providerId,
        requesterId: demoRequest.requesterId,
        score: 0.95,
        scoreBreakdown: {
          category: 1,
          location: 1,
          quantity: 1,
          urgency: 1,
          availability: 1,
        },
        status: "proposed",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // 5. Seed Pre-Completed Transfer (Resource: impact_recorded, Request: fulfilled, Handover: completed, Contribution: transfer_completed)
  // Guarantees non-zero dashboard metrics on first load per Section 16/19
  const completedResource = await Resource.findOneAndUpdate(
    { title: "Winter Relief Blankets" },
    {
      $setOnInsert: {
        title: "Winter Relief Blankets",
        description: "Heavy fleece winter blankets for cold weather assistance.",
        providerId: seededUsers.provider._id,
        categoryId: clothingCategory._id,
        quantity: 25,
        location: { city: "Amman", area: "Sweifieh" },
        status: "impact_recorded",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const completedRequest = await requestModel.findOneAndUpdate(
    { description: "Shelter winter warmth supplies need" },
    {
      $setOnInsert: {
        title: "Shelter Winter Warmth Supplies Need",
        requesterId: seededUsers.seeker._id,
        requesterOrgId: org._id,
        categoryId: clothingCategory._id,
        quantity: 25,
        urgency: "urgent",
        location: { city: "Amman", area: "Sweifieh" },
        description: "Shelter winter warmth supplies need",
        status: "fulfilled",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const completedMatch = await matchModel.findOneAndUpdate(
    { resourceId: completedResource._id, requestId: completedRequest._id },
    {
      $setOnInsert: {
        resourceId: completedResource._id,
        requestId: completedRequest._id,
        providerId: completedResource.providerId,
        requesterId: completedRequest.requesterId,
        score: 0.98,
        scoreBreakdown: { category: 1, location: 1, quantity: 1, urgency: 1, availability: 1 },
        status: "accepted",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const completedHandover = await Handover.findOneAndUpdate(
    { matchId: completedMatch._id },
    {
      $setOnInsert: {
        matchId: completedMatch._id,
        resourceId: completedResource._id,
        requestId: completedRequest._id,
        providerId: seededUsers.provider._id,
        seekerId: seededUsers.seeker._id,
        confirmedByProvider: true,
        confirmedBySeeker: true,
        providerConfirmedAt: new Date(Date.now() - 3600000 * 2),
        seekerConfirmedAt: new Date(Date.now() - 3600000),
        status: "completed",
        completedAt: new Date(Date.now() - 3600000),
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await Contribution.findOneAndUpdate(
    { handoverId: completedHandover._id },
    {
      $setOnInsert: {
        type: "transfer_completed",
        handoverId: completedHandover._id,
        providerId: seededUsers.provider._id,
        seekerId: seededUsers.seeker._id,
        categoryId: clothingCategory._id,
        quantity: 25,
        createdAt: new Date(Date.now() - 3600000),
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // Update user stats for the completed transfer
  await User.findByIdAndUpdate(seededUsers.provider._id, {
    $set: { "stats.completedTransfers": 1, reputationScore: 110, "stats.reputationScore": 110 },
  });
  await User.findByIdAndUpdate(seededUsers.seeker._id, {
    $set: { "stats.completedTransfers": 1, reputationScore: 110, "stats.reputationScore": 110 },
  });

  // 6. Seed Demo Notifications
  await Notification.findOneAndUpdate(
    { title: "Organization Verification: APPROVED", recipientId: seededUsers.seeker._id },
    {
      $setOnInsert: {
        recipientId: seededUsers.seeker._id,
        type: "org_verification_decided",
        title: "Organization Verification: APPROVED",
        message: "Your organization verification status is now approved.",
        relatedEntity: { type: "organization", id: org._id },
        readAt: new Date(),
        createdAt: new Date(Date.now() - 7200000),
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await Notification.findOneAndUpdate(
    { title: "New Match Found: Demo Surplus Bread", recipientId: seededUsers.seeker._id },
    {
      $setOnInsert: {
        recipientId: seededUsers.seeker._id,
        type: "match_created",
        title: "New Match Found: Demo Surplus Bread",
        message: "A potential match has been proposed for your request with a score of 95%.",
        relatedEntity: { type: "match", id: demoResource._id },
        readAt: null,
        createdAt: new Date(Date.now() - 1800000),
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return {
    users: Object.keys(seededUsers).length,
    organizations: 1,
    categories: Object.keys(seededCategories).length,
    resources: 2,
    requests: 2,
    matches: 2,
    handovers: 1,
    contributions: 1,
    notifications: 2,
  };
};

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  try {
    const stats = await seed();
    console.log("Seed completed successfully:", JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("Seed execution failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

export default seed;