import Organization from "../models/Organization.js";

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
  return organization.save();
}