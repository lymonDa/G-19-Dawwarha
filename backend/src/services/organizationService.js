import Organization from "../models/Organization.js";
import notificationService from "./notificationService.js";

const makeError = (statusCode, code, message) => Object.assign(new Error(message), { statusCode, code });
const transitions = {
  pending: { approved: "approved", rejected: "rejected" },
  rejected: { approved: "approved", rejected: "rejected" },
  approved: { suspended: "suspended" },
  suspended: {},
};

export async function transitionVerification(id, decision, rejectionReason, reviewerId) {
  const organization = await Organization.findById(id);
  if (!organization) throw makeError(404, "NOT_FOUND", "Organization not found.");
  if (decision === "rejected" && !rejectionReason?.trim()) {
    throw makeError(400, "REJECTION_REASON_REQUIRED", "A rejection reason is required.");
  }
  const next = transitions[organization.verification.status]?.[decision];
  if (!next) throw makeError(409, "INVALID_TRANSITION", "This verification transition is not allowed.");
  organization.verification.status = next;
  organization.verification.rejectionReason = decision === "rejected" ? rejectionReason.trim() : null;
  organization.verification.reviewedBy = reviewerId;
  organization.verification.reviewedAt = new Date();
  const savedOrg = await organization.save();

  if (savedOrg.ownerUserId) {
    try {
      await notificationService.notify({
        recipientId: savedOrg.ownerUserId,
        type: "org_verification_decided",
        title: `Organization Verification: ${next.toUpperCase()}`,
        message:
          decision === "rejected"
            ? `Your organization verification was rejected: ${rejectionReason.trim()}`
            : `Your organization verification status is now ${next}.`,
        relatedEntity: { type: "organization", id: savedOrg._id },
      });
    } catch {
      // Non-fatal notification error
    }
  }

  return savedOrg;
}