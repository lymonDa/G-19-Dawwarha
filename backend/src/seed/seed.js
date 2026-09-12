import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/database.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const users = [
  { name: "Dawwarha Admin", email: "admin@dawwarha.example", role: "admin" },
  { name: "Demo User", email: "provider@dawwarha.example", role: "user" },
  { name: "Demo User", email: "user@dawwarha.example", role: "user" },
];

import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import requestModel from "../models/Request.js";
import matchModel from "../models/Match.js";

const seed = async () => {
  await connectDB();
  const passwordHash = await bcrypt.hash("DawwarhaDemo123!", 10);
  const seededUsers = {};

  for (const definition of users) {
    seededUsers[definition.role] = await User.findOneAndUpdate(
      { email: definition.email },
      { $setOnInsert: { ...definition, passwordHash, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const org = await Organization.findOneAndUpdate(
    { name: "Dawwarha Demo Organization" },
    {
      $setOnInsert: {
        name: "Dawwarha Demo Organization",
        description: "Pre-approved organization for local development.",
        ownerUserId: seededUsers.user._id,
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
        verification: { status: "approved", reviewedBy: seededUsers.admin._id, reviewedAt: new Date() },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const category = await Category.findOneAndUpdate(
    { name: "Food & Produce" },
    {
      $setOnInsert: {
        name: "Food & Produce",
        slug: "food-produce",
        description: "Surplus meals, produce, and packaged foods.",
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const resource = await Resource.findOneAndUpdate(
    { title: "Demo Surplus Bread" },
    {
      $setOnInsert: {
        title: "Demo Surplus Bread",
        description: "Fresh bakery surplus bread packages.",
        providerId: seededUsers.user._id,
        categoryId: category._id,
        quantity: 20,
        location: { city: "Amman", area: "Abdali" },
        availabilityWindow: {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: "available",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const request = await requestModel.findOneAndUpdate(
    { description: "Community bread assistance need" },
    {
      $setOnInsert: {
        requesterId: seededUsers.user._id,
        requesterOrgId: org._id,
        categoryId: category._id,
        quantity: 10,
        urgency: "high",
        location: { city: "Amman", area: "Abdali" },
        description: "Community bread assistance need",
        status: "published",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await matchModel.findOneAndUpdate(
    { resourceId: resource._id, requestId: request._id },
    {
      $setOnInsert: {
        resourceId: resource._id,
        requestId: request._id,
        providerId: resource.providerId,
        requesterId: request.requesterId,
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
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};


try {
  await seed();
  console.log("Seed completed successfully");
} finally {
  await mongoose.disconnect();
}