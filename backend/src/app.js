import express from "express";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organizations.routes.js";
import userRoutes from "./routes/users.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);
export default app;