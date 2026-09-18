# DAWWARHA — Complete API Specification & Endpoint Reference

> **Authoritative Specification**: Derived from **Section 14 (API Specification)** and **Section 16 (Error Handling)** of the DAWWARHA Backend Implementation Plan.

This document provides the exhaustive specification for all 41 HTTP endpoints implemented across the four backend domains.

---

## Global API Conventions

### Base URL
- Local Development: `http://localhost:5000/api`
- All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

### Standard Response Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Standard Error Envelope (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of error.",
    "details": [ ... ]
  }
}
```

---

## 1. Identity & Organizations Domain (Engineer 1)

### 1.1 `POST /api/auth/register`
- **Auth**: Public
- **Role**: None
- **Body**:
  - `name` (string, required)
  - `email` (string, required, valid email format)
  - `password` (string, required, min 8 characters)
  - `role` (string, optional: "user" | "admin", default: "user")
- **Status Codes**:
  - `201 Created`: User registered successfully, returns `{ user, token }`.
  - `400 Bad Request`: Validation failure (missing name, invalid email, weak password).
  - `409 Conflict`: Email already exists (`EMAIL_EXISTS`).

### 1.2 `POST /api/auth/login`
- **Auth**: Public
- **Role**: None
- **Body**:
  - `email` (string, required)
  - `password` (string, required)
- **Status Codes**:
  - `200 OK`: Valid credentials, returns `{ user, token }`.
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or password (`INVALID_CREDENTIALS`).
  - `403 Forbidden`: Account suspended by administrator (`ACCOUNT_SUSPENDED`).

### 1.3 `POST /api/auth/logout`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self
- **Body**: None
- **Status Codes**:
  - `200 OK`: `{ success: true, data: { message: "Logged out successfully" } }`.
  - `401 Unauthorized`: Missing or invalid JWT.

### 1.4 `GET /api/users/me`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self
- **Query / Body**: None
- **Status Codes**:
  - `200 OK`: Returns authenticated user profile including statistics and badges.
  - `401 Unauthorized`: Unauthenticated.

### 1.5 `PUT /api/users/me`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self
- **Body**: Updatable profile fields:
  - `name` (string, optional)
  - `location` (object, optional: `{ city, area }`)
  - `address` (object, optional)
  - `contactInfo` (object, optional: `{ phone }`)
- **Status Codes**:
  - `200 OK`: Returns updated user object.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Unauthenticated.

### 1.6 `POST /api/organizations`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self &rarr; assigned as `ownerUserId`
- **Body**:
  - `name` (string, required)
  - `description` (string, optional)
  - `contactInfo` (object, optional: `{ phone, email, address }`)
  - `submittedDocuments` (array of strings, optional)
- **Status Codes**:
  - `201 Created`: Returns created organization with `verification.status: "pending"`.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Unauthenticated.

### 1.7 `GET /api/organizations/:id`
- **Auth**: Public
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns public organization details.
  - `400 Bad Request`: Invalid ObjectId format.
  - `404 Not Found`: Organization not found.

### 1.8 `PUT /api/organizations/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Organization Owner or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `name`, `description`, `contactInfo`, `submittedDocuments`
- **Status Codes**:
  - `200 OK`: Returns updated organization.
  - `403 Forbidden`: Authenticated user is neither owner nor admin.
  - `404 Not Found`: Organization not found.

### 1.9 `POST /api/organizations/:id/verify`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Body**:
  - `decision` (string, required: "approved" | "rejected")
  - `rejectionReason` (string, required only when decision is "rejected")
- **Side Effects**: Emits `org_verification_decided` notification to organization owner.
- **Status Codes**:
  - `200 OK`: Returns organization with updated verification status.
  - `400 Bad Request`: Invalid decision or missing rejectionReason on rejection.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: Organization not found.

### 1.10 `GET /api/admin/users`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Query**: `page` (number, default 1), `limit` (number, default 20)
- **Status Codes**:
  - `200 OK`: Returns paginated list of all users.
  - `403 Forbidden`: Non-admin caller.

### 1.11 `PUT /api/admin/users/:id/suspend`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: User status updated to `"suspended"`.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: User not found.

### 1.12 `PUT /api/admin/users/:id/reactivate`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: User status updated to `"active"`.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: User not found.

---

## 2. Categories & Resources Domain (Engineer 2)

### 2.1 `GET /api/categories`
- **Auth**: Public
- **Status Codes**:
  - `200 OK`: Returns list of all active taxonomy categories.

### 2.2 `GET /api/categories/:id`
- **Auth**: Public
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns category details.
  - `400 Bad Request`: Invalid ObjectId.
  - `404 Not Found`: Category not found.

### 2.3 `POST /api/categories`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Body**:
  - `name` (string, required)
  - `slug` (string, required, unique)
  - `description` (string, optional)
- **Status Codes**:
  - `201 Created`: Returns created category.
  - `400 Bad Request`: Missing required fields.
  - `403 Forbidden`: Non-admin caller.
  - `409 Conflict`: Category slug or name already exists.

### 2.4 `PUT /api/categories/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `name`, `description`, `isActive`
- **Status Codes**:
  - `200 OK`: Returns updated category.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: Category not found.

### 2.5 `DELETE /api/categories/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Behavior**: Soft-delete; sets `isActive: false`.
- **Status Codes**:
  - `200 OK`: Returns deactivated category.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: Category not found.

### 2.6 `GET /api/resources`
- **Auth**: Public
- **Query**: `category` (ObjectId), `city` (string), `area` (string), `status` (string), `page`, `limit`
- **Security**: Strict whitelist filtering; NoSQL operators (`$gt`, `$ne`) are rejected with 400.
- **Status Codes**:
  - `200 OK`: Returns paginated, filtered resources.
  - `400 Bad Request`: Invalid query operator or invalid categoryId.

### 2.7 `POST /api/resources`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self &rarr; assigned as `providerId`
- **Body**:
  - `title` (string, required)
  - `description` (string, required)
  - `categoryId` (ObjectId, required, must be active)
  - `quantity` (number, required, integer >= 1)
  - `unit` (string, optional)
  - `location` (object, required: `{ city, address, area }`)
  - `availabilityWindow` (object, required: `{ start, end }`)
- **Status Codes**:
  - `201 Created`: Created with status `"draft"`.
  - `400 Bad Request`: Validation failure or category inactive.
  - `401 Unauthorized`: Unauthenticated.

### 2.8 `GET /api/resources/:id`
- **Auth**: Public
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns resource document.
  - `400 Bad Request`: Invalid ObjectId.
  - `404 Not Found`: Resource not found.

### 2.9 `PUT /api/resources/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Resource Provider or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Body**: Updatable non-lifecycle fields (`title`, `description`, `quantity`, `location`, `availabilityWindow`).
- **Protection**: Cannot modify lifecycle status directly; rejected on terminal states.
- **Status Codes**:
  - `200 OK`: Returns updated resource.
  - `400 Bad Request`: Validation error.
  - `403 Forbidden`: Non-owner caller.
  - `404 Not Found`: Resource not found.
  - `409 Conflict`: Cannot update resource in terminal state.

### 2.10 `PUT /api/resources/:id/status`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Resource Provider or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `{ "action": "publish" | "cancel" }`
- **Status Codes**:
  - `200 OK`: Transitions resource (`draft` &rarr; `available`, or to `cancelled`).
  - `400 Bad Request`: Invalid action enum.
  - `403 Forbidden`: Non-owner caller.
  - `409 Conflict`: Invalid state transition.

### 2.11 `DELETE /api/resources/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Resource Provider or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Behavior**: Soft cancellation via `resourceLifecycleService.transitionResource(resource, "cancel")`. Document preserved for audit and contribution history.
- **Status Codes**:
  - `200 OK`: Returns resource with status `"cancelled"`.
  - `403 Forbidden`: Non-owner caller.
  - `404 Not Found`: Resource not found.

---

## 3. Demand & Matching Domain (Engineer 3)

### 3.1 `POST /api/requests`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self &rarr; assigned as `requesterId`
- **Body**:
  - `title` (string, required)
  - `description` (string, optional)
  - `categoryId` (ObjectId, required, must be active)
  - `quantity` (number, required, integer >= 1)
  - `urgency` (string, required: "low" | "medium" | "high" | "urgent")
  - `location` (object, required: `{ city, area }`)
- **Status Codes**:
  - `201 Created`: Created with status `"draft"`.
  - `400 Bad Request`: Missing fields or invalid category.
  - `401 Unauthorized`: Unauthenticated.

### 3.2 `GET /api/requests`
- **Auth**: Authenticated (Bearer JWT)
- **Query**: `category`, `city`, `urgency`, `status`, `page`, `limit`
- **Status Codes**:
  - `200 OK`: Returns paginated requests matching criteria.
  - `401 Unauthorized`: Unauthenticated.

### 3.3 `GET /api/requests/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns request details.
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: Request not found.

### 3.4 `PUT /api/requests/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Request Owner or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Body**: Updatable fields (`title`, `description`, `quantity`, `urgency`, `location`).
- **Status Codes**:
  - `200 OK`: Returns updated request.
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Non-owner caller.
  - `404 Not Found`: Request not found.

### 3.5 `PUT /api/requests/:id/status`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Request Owner or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `{ "action": "publish" | "cancel" }`
- **Status Codes**:
  - `200 OK`: Transitions request (`draft` &rarr; `published`, or to `cancelled`).
  - `400 Bad Request`: Invalid action enum.
  - `403 Forbidden`: Non-owner caller.
  - `409 Conflict`: Invalid state transition.

### 3.6 `DELETE /api/requests/:id`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Request Owner or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Behavior**: Soft cancellation via `requestLifecycleService.transitionRequest(request, "cancel")`.
- **Status Codes**:
  - `200 OK`: Returns request with status `"cancelled"`.
  - `403 Forbidden`: Non-owner caller.
  - `404 Not Found`: Request not found.

### 3.7 `POST /api/matches/:resourceId/generate`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Resource Provider or Admin
- **Params**: `resourceId` (MongoDB ObjectId)
- **Logic**: Executes rule-based explainable matching formula across active published requests. Persists matches with `scoreBreakdown` (Category: 0.35, Location: 0.25, Quantity: 0.20, Urgency: 0.10, Availability: 0.10).
- **Side Effects**: Generates `match_created` notification for each matched requester.
- **Status Codes**:
  - `200 OK`: Returns ranked array of generated matches (sorted by score descending).
  - `400 Bad Request`: Invalid resource ID.
  - `403 Forbidden`: Non-owner caller.
  - `404 Not Found`: Resource not found.
  - `409 Conflict`: Resource is not in an available state.

### 3.8 `GET /api/matches`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Party to match (inbox isolation; admin can view all with `?all=true`)
- **Query**: `status`, `page`, `limit`
- **Status Codes**:
  - `200 OK`: Returns paginated matches for the authenticated user.
  - `401 Unauthorized`: Unauthenticated.

### 3.9 `PUT /api/matches/:id/accept`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Either participant in the match (Provider or Seeker) or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Transaction**: Executes atomic MongoDB multi-document transaction across 4 collections:
  1. `matches` &rarr; status becomes `"accepted"`
  2. `resources` &rarr; transitions to `"accepted"`
  3. `requests` &rarr; transitions to `"accepted"`
  4. `handovers` &rarr; created via `handoverService.createHandoverForMatch` with status `"in_progress"`
- **Side Effects**: Emits `match_accepted` notification to the counter-party.
- **Status Codes**:
  - `200 OK`: Returns `{ match, handoverId, handover }`.
  - `403 Forbidden`: Caller is not a participant in the match.
  - `404 Not Found`: Match, Resource, or Request not found.
  - `409 Conflict`: Match already accepted or entities no longer available.

### 3.10 `PUT /api/matches/:id/reject`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Either participant in the match or Admin
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns rejected match.
  - `403 Forbidden`: Caller is not a participant.
  - `409 Conflict`: Match is already in an accepted state.

---

## 4. Transfer, Trust & Impact Domain (Engineer 4)

### 4.1 `POST /api/transactions/:matchId/confirm`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Participant Only (Provider or Seeker)
- **Params**: `matchId` (MongoDB ObjectId)
- **Body**: None (server derives `side` from `req.user._id` to prevent spoofing)
- **Logic**:
  - Provider confirms &rarr; sets `confirmedByProvider: true`, status remains `"in_progress"`.
  - Seeker confirms &rarr; sets `confirmedBySeeker: true`, status remains `"in_progress"`.
  - Both confirm &rarr; executes atomic completion cascade:
    1. Handover status &rarr; `"completed"`
    2. Resource status &rarr; `"impact_recorded"`
    3. Request status &rarr; `"fulfilled"`
    4. Contribution recorded &rarr; idempotent record created via `contributionService`
    5. User stats incremented &rarr; `completedTransfers + 1`, `reputationScore + 10`
- **Status Codes**:
  - `200 OK`: Returns updated handover state with `bothConfirmed` flag.
  - `403 Forbidden`: Caller is not a participant in the handover.
  - `404 Not Found`: No handover found for the given matchId.
  - `409 Conflict`: Handover is cancelled or inactive.

### 4.2 `POST /api/reports`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Authenticated user
- **Body**:
  - `targetType` (string, required: "user" | "resource" | "request")
  - `targetId` (ObjectId, required, target MUST exist in database)
  - `reason` (string, required: "inappropriate_content" | "fraud" | "harassment" | "safety_hazard" | "other")
  - `description` (string, optional)
- **Validation**: Enforces polymorphic integrity; report fails with 400 if `targetId` does not exist in the target collection.
- **Status Codes**:
  - `201 Created`: Returns created report with status `"open"`.
  - `400 Bad Request`: Validation failure or target entity does not exist (`TARGET_NOT_FOUND`).
  - `401 Unauthorized`: Unauthenticated.

### 4.3 `GET /api/reports`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Query**: `status` ("open" | "reviewed" | "resolved"), `targetType`, `page`, `limit`
- **Status Codes**:
  - `200 OK`: Returns paginated list of reports.
  - `403 Forbidden`: Non-admin caller.

### 4.4 `PUT /api/reports/:id/resolve`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Params**: `id` (MongoDB ObjectId)
- **Body**:
  - `resolution` (string, required, admin resolution notes)
  - `status` (string, optional: "reviewed" | "resolved", default "resolved")
- **Side Effects**: Emits `report_resolved` notification to the reporting user.
- **Status Codes**:
  - `200 OK`: Returns resolved report document.
  - `400 Bad Request`: Missing resolution notes.
  - `403 Forbidden`: Non-admin caller.
  - `404 Not Found`: Report not found.

### 4.5 `GET /api/users/me/contributions`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self
- **Query**: None
- **Status Codes**:
  - `200 OK`: Returns user's completed contributions history, category impact badges, and transfer totals.
  - `401 Unauthorized`: Unauthenticated.

### 4.6 `GET /api/admin/analytics`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Administrator only (`admin`)
- **Behavior**: Read-only aggregation across existing collections (zero dedicated analytics collection per DB Plan Section 14). Runs 4 parallel pipelines:
  1. `summary`: Total users, active users, resources published, completed transfers, requests created, open reports, registered organizations.
  2. `resourcesByCategory`: Published vs. fulfilled counts per category.
  3. `categoryImpact`: Completed transfer quantities and recipient counts per category.
  4. `matchAcceptance`: Proposed, accepted, rejected counts and acceptance rate percentage.
- **Status Codes**:
  - `200 OK`: Returns `{ summary, resourcesByCategory, categoryImpact, matchAcceptance }`.
  - `403 Forbidden`: Non-admin caller.

### 4.7 `GET /api/notifications`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self (Strict recipient isolation; users only retrieve their own notifications)
- **Query**: `page` (default 1), `limit` (default 20), `unreadOnly` (boolean, optional)
- **Status Codes**:
  - `200 OK`: Returns paginated notifications for the authenticated user.
  - `401 Unauthorized`: Unauthenticated.

### 4.8 `PATCH /api/notifications/:id/read`
- **Auth**: Authenticated (Bearer JWT)
- **Role**: Self (Notification Owner)
- **Params**: `id` (MongoDB ObjectId)
- **Status Codes**:
  - `200 OK`: Returns updated notification with `readAt` timestamp.
  - `404 Not Found`: Notification not found or not owned by caller.
