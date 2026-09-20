import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

// Production Safety Guard
if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script execution aborted: Cannot seed database in production environment.");
}

export const TEST_CREDENTIALS = {
  admin: {
    name: "Dawwarha Test Admin",
    email: "admin@dawwarha.test",
    password: "Admin@12345",
    role: "admin",
  },
  organizationUser: {
    name: "Dawwarha Test Organization User",
    email: "organization@dawwarha.test",
    password: "Organization@12345",
    role: "user",
  },
  organization: {
    name: "Dawwarha Test Organization",
    description: "Test Civil Society Organization for development and verification testing.",
    contactInfo: {
      email: "contact@dawwarha.test",
      phone: "+96265000001",
      address: {
        street: "123 Test Street",
        city: "Amman",
        state: "Amman",
        postalCode: "11181",
        country: "Jordan",
      },
    },
    verification: {
      status: "approved",
      submittedDocuments: ["https://example.com/test-org-license.pdf"],
    },
  },
  user: {
    name: "Dawwarha Test User",
    email: "user@dawwarha.test",
    password: "User@12345",
    role: "user",
  },
};

export async function seedTestUsers({ quiet = false } = {}) {
  await connectDB();

  const results = {
    admin: null,
    organizationUser: null,
    organization: null,
    user: null,
    statuses: {},
  };

  // 1. Admin Account
  const adminData = TEST_CREDENTIALS.admin;
  let adminUser = await User.findOne({ email: adminData.email }).select("+passwordHash");
  if (!adminUser) {
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    adminUser = await User.create({
      name: adminData.name,
      email: adminData.email,
      passwordHash,
      role: adminData.role,
      status: "active",
    });
    results.statuses.admin = "Created Admin";
  } else {
    let modified = false;
    if (adminUser.role !== adminData.role) {
      adminUser.role = adminData.role;
      modified = true;
    }
    if (adminUser.status !== "active") {
      adminUser.status = "active";
      modified = true;
    }
    const isPasswordValid = await bcrypt.compare(adminData.password, adminUser.passwordHash);
    if (!isPasswordValid) {
      adminUser.passwordHash = await bcrypt.hash(adminData.password, 10);
      modified = true;
    }
    if (modified) await adminUser.save();
    results.statuses.admin = "Admin already exists";
  }
  results.admin = adminUser;

  // 2. Organization User Account
  const orgUserData = TEST_CREDENTIALS.organizationUser;
  let orgUser = await User.findOne({ email: orgUserData.email }).select("+passwordHash");
  if (!orgUser) {
    const passwordHash = await bcrypt.hash(orgUserData.password, 10);
    orgUser = await User.create({
      name: orgUserData.name,
      email: orgUserData.email,
      passwordHash,
      role: orgUserData.role,
      status: "active",
    });
    results.statuses.organizationUser = "Created Organization User";
  } else {
    let modified = false;
    if (orgUser.role !== orgUserData.role) {
      orgUser.role = orgUserData.role;
      modified = true;
    }
    if (orgUser.status !== "active") {
      orgUser.status = "active";
      modified = true;
    }
    const isPasswordValid = await bcrypt.compare(orgUserData.password, orgUser.passwordHash);
    if (!isPasswordValid) {
      orgUser.passwordHash = await bcrypt.hash(orgUserData.password, 10);
      modified = true;
    }
    if (modified) await orgUser.save();
    results.statuses.organizationUser = "Organization User already exists";
  }
  results.organizationUser = orgUser;

  // 3. Organization Record (Linked to Organization User, Approved by Admin)
  const orgData = TEST_CREDENTIALS.organization;
  let org = await Organization.findOne({ name: orgData.name });
  if (!org) {
    org = await Organization.create({
      name: orgData.name,
      description: orgData.description,
      ownerUserId: orgUser._id,
      contactInfo: orgData.contactInfo,
      verification: {
        status: orgData.verification.status,
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        submittedDocuments: orgData.verification.submittedDocuments,
      },
    });
    results.statuses.organization = "Created Organization";
  } else {
    let modified = false;
    if (String(org.ownerUserId) !== String(orgUser._id)) {
      org.ownerUserId = orgUser._id;
      modified = true;
    }
    if (org.verification?.status !== "approved") {
      if (!org.verification) org.verification = {};
      org.verification.status = "approved";
      org.verification.reviewedBy = adminUser._id;
      org.verification.reviewedAt = new Date();
      modified = true;
    }
    if (modified) await org.save();
    results.statuses.organization = "Organization already exists";
  }
  results.organization = org;

  // 4. Normal User Account
  const normalUserData = TEST_CREDENTIALS.user;
  let normalUser = await User.findOne({ email: normalUserData.email }).select("+passwordHash");
  if (!normalUser) {
    const passwordHash = await bcrypt.hash(normalUserData.password, 10);
    normalUser = await User.create({
      name: normalUserData.name,
      email: normalUserData.email,
      passwordHash,
      role: normalUserData.role,
      status: "active",
    });
    results.statuses.user = "Created Normal User";
  } else {
    let modified = false;
    if (normalUser.role !== normalUserData.role) {
      normalUser.role = normalUserData.role;
      modified = true;
    }
    if (normalUser.status !== "active") {
      normalUser.status = "active";
      modified = true;
    }
    const isPasswordValid = await bcrypt.compare(normalUserData.password, normalUser.passwordHash);
    if (!isPasswordValid) {
      normalUser.passwordHash = await bcrypt.hash(normalUserData.password, 10);
      modified = true;
    }
    if (modified) await normalUser.save();
    results.statuses.user = "Normal User already exists";
  }
  results.user = normalUser;

  if (!quiet) {
    console.log(results.statuses.admin);
    console.log(results.statuses.organization);
    console.log(results.statuses.organizationUser);
    console.log(results.statuses.user);
  }

  return results;
}

// Auto-run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await seedTestUsers();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Test users seeding failed:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}
