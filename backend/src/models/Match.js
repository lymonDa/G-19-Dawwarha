import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
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

    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    scoreBreakdown: {
      category: {
        type: Number,
        min: 0,
        max: 1,
      },

      location: {
        type: Number,
        min: 0,
        max: 1,
      },

      quantity: {
        type: Number,
        min: 0,
        max: 1,
      },

      urgency: {
        type: Number,
        min: 0,
        max: 1,
      },

      availability: {
        type: Number,
        min: 0,
        max: 1,
      },
    },

    status: {
      type: String,
      required: true,
      enum: [
        "proposed",
        "accepted",
        "rejected",
        "expired",
      ],
      default: "proposed",
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({
  resourceId: 1,
  status: 1,
});

matchSchema.index({
  requestId: 1,
  status: 1,
});

matchSchema.index({
  providerId: 1,
  status: 1,
  createdAt: -1,
});

matchSchema.index({
  requesterId: 1,
  status: 1,
  createdAt: -1,
});

matchSchema.index({
  status: 1,
  expiresAt: 1,
});

matchSchema.index(
  {
    resourceId: 1,
    requestId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "proposed",
    },
  }
);

const matchModel = mongoose.model("Match", matchSchema);

export  default matchModel;