import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["transfer_completed"],
      required: true,
      default: "transfer_completed",
    },

    handoverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Handover",
      required: true,
      unique: true,
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

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "contributions",
    timestamps: false,
  }
);

contributionSchema.index({ handoverId: 1 }, { unique: true });
contributionSchema.index({ providerId: 1, createdAt: -1 });
contributionSchema.index({ seekerId: 1, createdAt: -1 });
contributionSchema.index({ categoryId: 1, createdAt: -1 });

const Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;
