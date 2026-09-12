import mongoose from "mongoose";

const URL_MAX_LENGTH = 2048;

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactInfo: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Contact email must be valid"],
      },
      phone: { type: String, trim: true, maxlength: 30 },
      website: { type: String, trim: true, maxlength: URL_MAX_LENGTH },
    },

    verification: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        required: true,
        default: "pending",
      },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true, default: "Jordan" },
      },
      rejectionReason: {
        type: String,
        default: null,
        maxlength: 500,
        validate: {
          validator: function (value) {
            const status = this.verification?.status || this.status;
            return status !== "rejected" || Boolean(value?.trim());
          },
          message: "A rejection reason is required for rejected organizations",
        },
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
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

organizationSchema.index({ ownerUserId: 1 });
organizationSchema.index({ "verification.status": 1, createdAt: 1 });

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
