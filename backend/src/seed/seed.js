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

  await Organization.findOneAndUpdate(
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
};

try {
  await seed();
  console.log("Seed completed successfully");
} finally {
  await mongoose.disconnect();
}