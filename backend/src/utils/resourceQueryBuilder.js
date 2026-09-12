import isValidObjectId from "./objectId.js";

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

const ALLOWED_STATUSES = [
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
];

const ALLOWED_FILTER_KEYS = [
  "category",
  "categoryId",
  "city",
  "area",
  "status",
  "page",
  "limit",
];

/**
 * Reusable, read-only search/filter query builder for resources.
 * Shared by:
 *   1. GET /api/resources
 *   2. Candidate-retrieval queries (e.g. matchingService.generateMatches)
 *
 * PURE FUNCTION: Does NOT perform database operations.
 * Strictly sanitizes and whitelists filter criteria to prevent NoSQL injection.
 *
 * @param {object} [filters={}] - Input filter parameters (e.g. from req.query or service payload)
 * @param {object} [options={}] - Options, e.g. { defaultStatus: true }
 * @returns {object} Safe MongoDB filter object
 */
export function buildResourceQuery(filters = {}, options = {}) {
  if (typeof filters !== "object" || filters === null || Array.isArray(filters)) {
    throw makeError(400, "INVALID_QUERY", "Filters must be a valid object.");
  }

  const queryFilter = {};

  // Validate and sanitize keys and values against injection
  for (const [key, val] of Object.entries(filters)) {
    // Whitelist supported parameters
    if (
      !ALLOWED_FILTER_KEYS.includes(key) ||
      key.includes("$") ||
      key.includes("[") ||
      key.includes("]")
    ) {
      throw makeError(
        400,
        "INVALID_QUERY",
        `Invalid or unsupported query parameter '${key}'.`
      );
    }

    // Disallow nested object injection
    if (typeof val === "object" && val !== null && !isValidObjectId(val)) {
      throw makeError(
        400,
        "INVALID_QUERY",
        `Invalid query parameter for '${key}'.`
      );
    }

    // Disallow MongoDB operators in string values
    if (
      typeof val === "string" &&
      (val.includes("$") || val.includes("{") || val.includes("}"))
    ) {
      throw makeError(
        400,
        "INVALID_QUERY",
        "Query parameter contains invalid operators."
      );
    }
  }

  // 1. Status Filter
  const statusParam = filters.status;
  if (statusParam !== undefined && statusParam !== null) {
    if (typeof statusParam === "string") {
      if (!ALLOWED_STATUSES.includes(statusParam)) {
        throw makeError(400, "INVALID_STATUS", "Invalid status parameter");
      }
      queryFilter.status = statusParam;
    } else if (Array.isArray(statusParam)) {
      for (const s of statusParam) {
        if (!ALLOWED_STATUSES.includes(s)) {
          throw makeError(400, "INVALID_STATUS", `Invalid status parameter '${s}'`);
        }
      }
      queryFilter.status = { $in: statusParam };
    } else {
      throw makeError(400, "INVALID_STATUS", "Invalid status parameter");
    }
  } else if (options.defaultStatus !== false) {
    // Default to browsable public statuses
    queryFilter.status = { $in: ["published", "available"] };
  }

  // 2. Category Filter
  const categoryParam = filters.categoryId || filters.category;
  if (categoryParam !== undefined && categoryParam !== null) {
    const catStr = String(categoryParam);
    if (!isValidObjectId(catStr)) {
      throw makeError(
        400,
        "INVALID_CATEGORY",
        "Category not found or inactive"
      );
    }
    queryFilter.categoryId = catStr;
  }

  // 3. Location Filter (City)
  if (filters.city !== undefined && filters.city !== null) {
    const cityStr = String(filters.city).trim();
    if (cityStr) {
      queryFilter["location.city"] = cityStr;
    }
  }

  // 4. Location Filter (Area)
  if (filters.area !== undefined && filters.area !== null) {
    const areaStr = String(filters.area).trim();
    if (areaStr) {
      queryFilter["location.area"] = areaStr;
    }
  }

  return queryFilter;
}

export default buildResourceQuery;
