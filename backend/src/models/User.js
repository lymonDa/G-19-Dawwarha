import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be a valid email address"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "provider", "seeker", "admin"],
      required: true,
      default: "user",
    },

    location: {
      city: {
        type: String,
        required: false,
      },

      area: {
        type: String,
        required: false,
      },
    },

    address: {
      street: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      area: { type: String, trim: true, maxlength: 100 },
      country: { type: String, trim: true, maxlength: 100 },
    },

    contactInfo: {
      phone: { type: String, trim: true, maxlength: 30 },
      alternateEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Alternate email must be valid"],
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

userSchema.index({ status: 1 });

const User = mongoose.model("User", userSchema);

export default User;
