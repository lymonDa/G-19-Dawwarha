import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import mongoose from "mongoose";
import connectDB from "../src/config/database.js";

afterEach(async () => {
  delete process.env.MONGODB_URI;
  await mongoose.disconnect();
});

describe("database connection", () => {
  it("fails clearly when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI;
    await assert.rejects(connectDB(), /MONGODB_URI is not configured/);
  });

  it("fails when MongoDB cannot be reached", async () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:1/unreachable?serverSelectionTimeoutMS=1000";
    await assert.rejects(connectDB());
  });
});
