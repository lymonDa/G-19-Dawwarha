import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

dotenv.config();

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
