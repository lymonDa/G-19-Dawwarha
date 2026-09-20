import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["resource", "request", "user"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reason: {
      type: String,
      enum: ["spam", "fraud", "inappropriate", "safety", "other"],
      required: true,
    },

    description: {
      type: String,
      maxlength: 500,
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "reviewed", "resolved"],
      default: "open",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolution: {
      type: String,
      default: null,
    },
  },
  {
    collection: "reports",
    timestamps: true,
  }
);

reportSchema.pre("save", function (next) {
  if (this.status !== "open") {
    if (!this.reviewedBy) {
      const err = new Error("reviewedBy is required when report status is not open.");
      if (typeof next === "function") return next(err);
      throw err;
    }
    if (!this.resolution || typeof this.resolution !== "string" || !this.resolution.trim()) {
      const err = new Error("resolution is required when report status is not open.");
      if (typeof next === "function") return next(err);
      throw err;
    }
  }
  if (typeof next === "function") return next();
});

reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
