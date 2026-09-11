import Organization from "../models/Organization.js";
import { transitionVerification } from "../services/organizationService.js";

export async function create(req, res, next) {
  try {
    const organization = await Organization.create({
      name: req.body.name, description: req.body.description, ownerUserId: req.user._id,
      verification: { status: "pending", submittedDocuments: req.body.submittedDocuments || [] },
    });
    return res.status(201).json({ success: true, data: organization });
  } catch (error) { return next(error); }
}
export async function getById(req, res, next) {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Organization not found." } });
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}
export async function update(req, res, next) {
  try {
    const changes = {};
    for (const field of ["name", "description"]) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    if (req.body.submittedDocuments !== undefined) {
      changes["verification.submittedDocuments"] = req.body.submittedDocuments;
    }
    const organization = await Organization.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true });
    if (!organization) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Organization not found." } });
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}
export async function verify(req, res, next) {
  try {
    const organization = await transitionVerification(req.params.id, req.body.decision, req.body.rejectionReason);
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}