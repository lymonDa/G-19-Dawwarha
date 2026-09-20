import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requesterOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
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
    },

    urgency: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    location: {
      city: {
        type: String,
        required: true,
      },

      area: {
        type: String,
      },
    },

    description: {
      type: String,
      maxlength: 500,
    },

    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "published",
        "matched",
        "accepted",
        "fulfilled",
        "cancelled",
        "expired",
      ],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({
  status: 1,
  categoryId: 1,
  urgency: -1,
  createdAt: -1,
});

requestSchema.index({
  requesterId: 1,
  status: 1,
});

requestSchema.index({
  "location.city": 1,
  "location.area": 1,
  status: 1,
});

const requestModel = mongoose.model("Request", requestSchema);

export  {requestModel} ;
export default requestModel;
