import "dotenv/config";
import http from "node:http";
import mongoose from "mongoose";
import app from "../src/app.js";
import connectDB from "../src/config/database.js";
import { TEST_CREDENTIALS } from "../src/seed/seed-test-users.js";

async function runVerification() {
  console.log("==================================================");
  console.log("Dawwarha Test Credentials Verification");
  console.log("==================================================");

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const summary = [];
  let allPassed = true;

  function record(checkName, passed, details = "") {
    if (!passed) allPassed = false;
    const status = passed ? "PASS" : "FAIL";
    summary.push({ checkName, status, details });
    console.log(`[${status}] ${checkName}${details ? ` - ${details}` : ""}`);
  }

  try {
    let adminToken, orgToken, userToken;
    let adminUser, orgUser, normalUser;

    // 1. Admin Login
    {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_CREDENTIALS.admin.email,
          password: TEST_CREDENTIALS.admin.password,
        }),
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success && Boolean(data.data?.token) && data.data?.user?.role === "admin";
      adminToken = data.data?.token;
      adminUser = data.data?.user;
      record("Admin login", pass, `HTTP ${res.status}, role=${adminUser?.role}`);
    }

    // 2. Organization Login
    {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_CREDENTIALS.organizationUser.email,
          password: TEST_CREDENTIALS.organizationUser.password,
        }),
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success && Boolean(data.data?.token) && data.data?.user?.role === "user";
      orgToken = data.data?.token;
      orgUser = data.data?.user;
      record("Organization login", pass, `HTTP ${res.status}, role=${orgUser?.role}`);
    }

    // 3. Normal User Login
    {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_CREDENTIALS.user.email,
          password: TEST_CREDENTIALS.user.password,
        }),
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success && Boolean(data.data?.token) && data.data?.user?.role === "user";
      userToken = data.data?.token;
      normalUser = data.data?.user;
      record("Normal user login", pass, `HTTP ${res.status}, role=${normalUser?.role}`);
    }

    // 4. Admin Authorization (GET /api/admin/users)
    {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success && Array.isArray(data.data);
      record("Admin authorization", pass, `HTTP ${res.status}, users returned=${data.data?.length}`);
    }

    // 5. Organization Authorization (GET /api/organizations/mine)
    {
      const res = await fetch(`${baseUrl}/api/organizations/mine`, {
        headers: { Authorization: `Bearer ${orgToken}` },
      });
      const data = await res.json();
      const pass =
        res.status === 200 &&
        data.success &&
        data.data?.name === TEST_CREDENTIALS.organization.name &&
        data.data?.verification?.status === "approved" &&
        String(data.data?.ownerUserId) === String(orgUser?._id || orgUser?.id);
      record("Organization authorization", pass, `HTTP ${res.status}, org="${data.data?.name}", status="${data.data?.verification?.status}"`);
    }

    // 6. Normal User Authorization (GET /api/users/me)
    {
      const res = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success && data.data?.email === TEST_CREDENTIALS.user.email;
      record("Normal user authorization", pass, `HTTP ${res.status}, email=${data.data?.email}`);
    }

    // 7. Normal User Blocked From Admin Endpoint (GET /api/admin/users -> 403)
    {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      const pass = res.status === 403 && !data.success && data.error?.code === "FORBIDDEN";
      record("Normal user blocked from admin endpoint", pass, `HTTP ${res.status}, code=${data.error?.code}`);
    }

    // 8. Normal User Has No Organization (GET /api/organizations/mine -> 404)
    {
      const res = await fetch(`${baseUrl}/api/organizations/mine`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      const pass = res.status === 404 && !data.success && data.error?.code === "NOT_FOUND";
      record("Normal user has no organization", pass, `HTTP ${res.status}, code=${data.error?.code}`);
    }

    console.log("==================================================");
    console.log(`Overall Result: ${allPassed ? "ALL VERIFICATIONS PASSED" : "FAILURES DETECTED"}`);
    console.log("==================================================");

  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  }

  if (!allPassed) process.exit(1);
}

runVerification().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
