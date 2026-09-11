import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },

    location: {
      city: {
        type: String,
        required: false,
      },

      country: {
        type: String,
        required: false,
      },
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      required: true,
      default: "active",
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    stats: {
      requests: {
        type: Number,
        default: 0,
      },

      completed: {
        type: Number,
        default: 0,
      },

      reputationScore: {
        type: Number,
        default: 0,
      },

      completedTransfers: {
        type: Number,
        default: 0,
      },

      failedTransfers: {
        type: Number,
        default: 0,
      },
    },

    reputationScore: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
