import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verification: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        required: true,
        default: "pending",
      },

      rejectionReason: {
        type: String,
        default: null,
      },

      submittedDocuments: {
        type: [String],
        required: true,
        default: [],
        validate: {
          validator: function (documents) {
            return documents.length <= 10;
          },
          message: "Maximum 10 submitted documents are allowed",
        },
      },
    },
  },
  {
    collection: "organizations",
    timestamps: true,
  },
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
