import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "match_created",
        "match_accepted",
        "report_resolved",
        "org_verification_decided",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    relatedEntity: {
      type: new mongoose.Schema(
        {
          type: {
            type: String,
            required: false,
          },
          id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
          },
        },
        { _id: false }
      ),
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: "notifications",
    timestamps: false,
  }
);

notificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
