import Organization from "../models/Organization.js";
import { transitionVerification } from "../services/organizationService.js";

export async function create(req, res, next) {
  try {
    const organization = await Organization.create({
      name: req.body.name, description: req.body.description, contactInfo: req.body.contactInfo, ownerUserId: req.user._id,
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
    for (const field of ["name", "description", "contactInfo"]) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    if (req.body.submittedDocuments !== undefined) {
      changes["verification.submittedDocuments"] = req.body.submittedDocuments;
    }
    const organization = await Organization.findByIdAndUpdate(req.params.id, { $set: changes }, { returnDocument: "after", runValidators: true });
    if (!organization) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Organization not found." } });
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}
export async function getMine(req, res, next) {
  try {
    const organization = await Organization.findOne({ ownerUserId: req.user._id });
    if (!organization) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Organization not found for current user." } });
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}

export async function list(req, res, next) {
  try {
    const query = {};
    if (req.query.status) {
      query["verification.status"] = req.query.status;
    }
    const organizations = await Organization.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: organizations });
  } catch (error) { return next(error); }
}

export async function verify(req, res, next) {
  try {
    const organization = await transitionVerification(req.params.id, req.body.decision, req.body.rejectionReason, req.user._id);
    return res.json({ success: true, data: organization });
  } catch (error) { return next(error); }
}