import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoURI) {
    throw new Error("MONGODB_URI or DATABASE_URL is not configured");
  }

  try {
    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;