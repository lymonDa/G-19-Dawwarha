import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be greater than 0"],
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      area: {
        type: String,
        trim: true,
      },
    },
    availabilityWindow: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
        validate: {
          validator: function (value) {
            const start = this.availabilityWindow?.start;
            return !start || value > start;
          },
          message: "Availability end date must be after start date",
        },
      },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "published",
        "available",
        "matched",
        "accepted",
        "in_handover",
        "completed",
        "impact_recorded",
        "expired",
        "cancelled",
        "unavailable",
      ],
      default: "draft",
    },
    safetyDisclosure: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "resources",
  }
);

resourceSchema.index({ status: 1, categoryId: 1, createdAt: -1 });
resourceSchema.index({ providerId: 1, status: 1 });
resourceSchema.index({ "location.city": 1, "location.area": 1, status: 1 });
resourceSchema.index({ "availabilityWindow.end": 1 });

const Resource = mongoose.model("Resource", resourceSchema);
try {
  mongoose.model("resources", resourceSchema);
} catch (e) {
  // Alias already registered
}

export default Resource;
export { Resource, Resource as resourceModel };
