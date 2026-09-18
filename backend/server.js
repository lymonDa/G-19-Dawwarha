import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
