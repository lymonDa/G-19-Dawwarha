import mongoose from "mongoose";

const handoverSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    confirmedByProvider: {
      type: Boolean,
      required: true,
      default: false,
    },

    confirmedBySeeker: {
      type: Boolean,
      required: true,
      default: false,
    },

    providerConfirmedAt: {
      type: Date,
      default: null,
    },

    seekerConfirmedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "cancelled", "no_show"],
      required: true,
      default: "in_progress",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "handovers",
    timestamps: true,
  },
);

handoverSchema.index({ providerId: 1, status: 1 });
handoverSchema.index({ seekerId: 1, status: 1 });

const Handover = mongoose.model("Handover", handoverSchema);

export default Handover;
