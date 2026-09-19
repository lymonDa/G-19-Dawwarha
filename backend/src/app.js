import express from "express";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organizations.routes.js";
import resourceRoutes from "./routes/resources.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import userRoutes from "./routes/users.routes.js";
import contributionRoutes from "./routes/contributions.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import transactionRoutes from "./routes/transactions.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import requestRoutes from "./routes/requests.routes.js";
import matchRoutes from "./routes/matches.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", contributionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorHandler);
export default app;