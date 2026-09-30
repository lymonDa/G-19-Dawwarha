import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment configuration (.env in backend/ or root as fallback)
const localEnvPath = path.resolve(__dirname, ".env");
const rootEnvPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

// ─── Serve Angular frontend static files (Hostinger unified deployment) ───
// Look for frontend build in: ./public, ../public, or ../frontend
const publicCandidates = [
  path.resolve(__dirname, "public"),
  path.resolve(__dirname, "..", "public"),
  path.resolve(__dirname, "..", "frontend"),
];
const publicDir = publicCandidates.find((p) => fs.existsSync(path.join(p, "index.html")));

if (publicDir) {
  console.log(`Serving static frontend from: ${publicDir}`);
  app.use(express.static(publicDir));

  // SPA fallback: any route that is NOT /api/* and NOT /health → return index.html
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  console.log("No frontend build found. Running API-only mode.");
}

const port = process.env.PORT || 5000;
let server;

// Connect to database and start HTTP server
connectDB()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server listening on port ${port} (mode: ${process.env.NODE_ENV || "development"})`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });

// Graceful shutdown handler for production process managers (PM2, Passenger, Docker, Systemd)
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    });

    // Enforce shutdown timeout if connections hang
    setTimeout(() => {
      console.error("Graceful shutdown timeout exceeded. Forcefully terminating.");
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
