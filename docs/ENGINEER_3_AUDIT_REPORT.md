# Engineer 3 — Complete Audit Report

> **Auditor**: Senior Backend Engineer / Code Reviewer & QA Auditor  
> **Auditee**: Engineer 3 — Demand / Matching Side (دينا عبد الله عليان محمد)  
> **Repository**: `G-19-Dawarhaa`  
> **Commit Inspected**: `5486e73` (`A Implement requests and matches`) and current `main` (`ba728aa`)  
> **Audit Type**: Strict Read-Only Verification (No application source files modified)

---

## 1. Executive Summary

Engineer 3 was assigned the flagship domain of the platform: **Community Needs & Explainable Matching (Demand & Matching)**, representing Phase 3 of the backend architecture. This scope includes the `requests` collection, the `matches` collection, the rule-based explainable scoring engine (`calculateScore`, `generateMatches`), request lifecycle management (`requestLifecycleService`), HTTP controllers and routes for requests and matches, input validation, and the critical atomic match-acceptance transaction that bridges Demand/Supply to downstream Handovers (Engineer 4).

An exhaustive, read-only audit of Engineer 3's implementation in `backend/` reveals that while the basic database schema definitions and the scoring formula structure were outlined, **the implementation suffers from critical security vulnerabilities, broken cross-domain contracts, schema naming inconsistencies, non-functional transaction boundaries, and a complete absence of unit/integration tests**:

1. **Missing Authentication on All Match Endpoints**: None of the routes in `src/routes/matches.routes.js` apply the `authenticate` middleware. Any unauthenticated public request to `GET /api/matches`, `PUT /api/matches/:id/accept`, or `PUT /api/matches/:id/reject` crashes with an unhandled `TypeError: Cannot read properties of undefined (reading '_id')` (returning **HTTP 500 INTERNAL_ERROR**). Furthermore, `POST /api/matches/:resourceId/generate` is completely unprotected, allowing anonymous internet callers to trigger expensive matching operations on any resource.
2. **Critical IDOR & Missing Ownership Checks on Request Mutation**: `PUT /api/requests/:id`, `PUT /api/requests/:id/status`, and `DELETE /api/requests/:id` perform mutations without verifying whether the authenticated user is the requester or an administrator. Any authenticated user can modify, advance the status of, or cancel any other user's request.
3. **Missing Cross-Domain Match-Acceptance Transaction & Handover Creation**: Backend Implementation Plan Task 3.B and MongoDB Implementation Plan Section 15 mandate that `acceptMatch` execute an atomic multi-document transaction across three collections (`matches`, `resources`, `requests`) and invoke `handoverService.createHandoverForMatch(match, session)`. Instead, `matches.controller.js` performs an isolated, non-transactional `match.status = 'accepted'; match.save();`. Neither `resources` nor `requests` are transitioned, and no `Handover` document is ever created, completely severing the downstream transfer workflow.
4. **Mongoose Model Registration & Schema Reference Inconsistency (`MissingSchemaError`)**:
   - `Request.js` registers the model as `mongoose.model("requests", requestSchema)`.
   - `Match.js` registers the model as `mongoose.model("matches", matchSchema)`.
   - `Handover.js` and `Match.js` define schema references using PascalCase singular `ref: "Request"` and `ref: "Match"`. Because the models are registered in lowercase plural, any `.populate("requestId")` or `mongoose.model("Request")` lookup crashes with `MissingSchemaError: Schema hasn't been registered for model "Request"`.
   - `matchingService.js` lines 97 and 117 attempt to load `mongoose.model("resources")` without importing the model, crashing with `MissingSchemaError: Schema hasn't been registered for model "resources"`.
5. **Mass Assignment Vulnerability on Request Creation**: `addRequest` uses `new requestModel({ ...req.body, requesterId: req.user._id })`. Clients can supply `{ status: "fulfilled" }` in the payload, bypassing the draft-published-matched-accepted lifecycle entirely.
6. **Dead Code & Flawed Scoring Logic in Matching**: In `calculateScore`, the location area comparison sets `locationScore = 1`, but `locationScore` was already set to `1` by the city match, rendering the area check completely dead. Furthermore, the `availabilityWindow` (dates) is never inspected; availability score is hardcoded to 1.0 based solely on `resource.status === 'available'`.
7. **Zero Tests**: Engineer 3 contributed **0 unit tests** and **0 integration tests**. All 95 passing tests in `tests/unit/` belong to Engineer 4.

---

## 2. Engineer 3 Scope

Authoritative specifications defining Engineer 3's deliverables:
- **Product Brief v1.0**: FR-007, FR-008, FR-009, FR-010, FR-011, FR-020, FR-021, FR-022, Section 11, Section 12 (Matching System & Scoring Model).
- **Backend Implementation Plan v1.0**: Phase 3 (Demand & Matching), Task 3.A (Request CRUD Routes), Task 3.B (Matching Engine HTTP Surface), Section 07.4, Section 13 (Transaction Boundaries), Section 15, Section 17.
- **MongoDB Implementation Plan v1.0**: Tasks 3.1 & 3.2 (Pages 42–43), Section 6.5 (Requests Indexes), Section 6.6 (Matches Indexes), Section 8.5 (Request Schema), Section 8.6 (Match Schema), Section 9.3 (Request Lifecycle Table), Section 9.4 (Match Lifecycle Table), Section 10 (Index Strategy), Section 15 (Transaction Strategy), Section 16 (Seed Strategy).

### Deliverables Inventory
1. **Schemas & Models**:
   - `src/models/Request.js` (requests collection, fields, indexes per Section 8.5 & 6.5).
   - `src/models/Match.js` (matches collection, fields, embedded `scoreBreakdown`, indexes per Section 8.6 & 6.6, partial unique index).
2. **Services & Business Logic**:
   - `src/services/requestLifecycleService.js` (table-driven lifecycle transitions: `draft -> published -> matched -> accepted -> fulfilled`, `cancelled`, `expired`).
   - `src/services/matchingService.js` (`calculateScore` with normalized weights W1–W5, `generateMatches` candidate query and ranking, `acceptMatch` multi-document transaction).
3. **Controllers & Validators**:
   - `src/controllers/requests.controller.js` (request CRUD, status transition, cancellation).
   - `src/controllers/matches.controller.js` (generate, list user matches, accept, reject).
   - `src/validators/request.validators.js` (input validation for request creation, update, status change).
   - `src/validators/match.validators.js` (input validation for match generation and ID params).
4. **Routes**:
   - `src/routes/requests.routes.js` (mounted at `/api/requests`).
   - `src/routes/matches.routes.js` (mounted at `/api/matches`).
5. **Seeding & Tests**:
   - Seed requests and demo-match pair in `src/seed/seed.js`.
   - Comprehensive unit and integration tests covering calculation formulas, candidate queries, partial unique index enforcement, and transactional rollback.

---

## 3. Requirements Traceability Matrix

| Requirement | Source Reference | Expected Behavior | Actual Implementation | Status | Severity | Evidence |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Request Schema** | DB Plan 8.5 | `requesterId`, `requesterOrgId`, `categoryId`, `quantity`, `urgency`, `location`, `description`, `status` | Implemented in `src/models/Request.js` | **PASS** | — | Schema fields match specification |
| **Request Model Name** | DB Plan 8.5 | Registered as `"Request"` (PascalCase singular) | Registered as `mongoose.model("requests", requestSchema)` | **FAIL** | **HIGH** | `Match.js` `ref: "Request"` crashes on populate |
| **Request Indexes** | DB Plan 6.5 / 10 | ESR matching index, `requesterId`, `location` | Declared in `Request.js` lines 72–88 | **PASS** | — | All 3 compound/single indexes declared |
| **Match Schema** | DB Plan 8.6 | `resourceId`, `requestId`, `providerId`, `requesterId`, `score`, `scoreBreakdown`, `status`, `expiresAt` | Implemented in `src/models/Match.js` | **PASS** | — | Schema fields match specification |
| **Match Model Name** | DB Plan 8.6 | Registered as `"Match"` (PascalCase singular) | Registered as `mongoose.model("matches", matchSchema)` | **FAIL** | **HIGH** | `Handover.js` `ref: "Match"` crashes on populate |
| **Match Partial Unique Index** | DB Plan 6.6 / 10 | Unique index on `(resourceId, requestId)` with `partialFilterExpression: { status: "proposed" }` | Declared in `Match.js` lines 116–127 | **PASS** | — | Prevents duplicate active proposed matches |
| **Request Lifecycle Service** | DB Plan 9.3 | Table-driven transitions matching Section 9.3 | Implemented in `requestLifecycleService.js` | **PARTIAL** | **HIGH** | Transitions table implemented, but `actor` is ignored and `session` option is unsupported |
| **Request CRUD API** | Backend Plan 3.A | `GET /api/requests`, `POST /api/requests`, `GET /:id`, `PUT /:id`, `PUT /:id/status`, `DELETE /:id` | Implemented in `requests.controller.js` & `requests.routes.js` | **PARTIAL** | **CRITICAL** | Endpoints exist, but IDOR on PUT/DELETE, no pagination, mass assignment |
| **Request Ownership Verification** | Backend Plan 3.A | Update/delete/status restricted to owner or admin | No ownership check in controller or route middleware | **FAIL** | **CRITICAL** | `requests.controller.js` lines 81, 112, 142 allow any user to mutate any request |
| **Request Input Validation** | Backend Plan 3.A | Validate quantity >= 1, valid category, urgency enum, location | `request.validators.js` requires phantom `title`, misses `location`, allows invalid urgency `'critical'` | **FAIL** | **HIGH** | Validator schema conflicts with `Request.js` |
| **Matching Scoring Model** | Product Brief 12 | Formula: $\sum (W_i \times S_i)$, normalized weights, explainable breakdown | Implemented in `matchingService.js:calculateScore` | **PARTIAL** | **HIGH** | Weights defined, but area check is dead code and `availabilityWindow` date is ignored |
| **Match Generation Endpoint** | Backend Plan 3.B | `POST /api/matches/:resourceId/generate` (resource owner or admin) | Implemented in `matches.controller.js` | **FAIL** | **CRITICAL** | No `authenticate` middleware; unhandled `MissingSchemaError` returns HTTP 500 |
| **Match Listing Endpoint** | Backend Plan 3.B | `GET /api/matches` for authenticated user (own matches) or admin | Implemented in `matches.controller.js` | **FAIL** | **CRITICAL** | No `authenticate` middleware; crashes with HTTP 500 when `req.user` is undefined |
| **Atomic Match Acceptance** | Backend Plan 3.B / Section 13 | Multi-document transaction updating match, resource, request, and creating Handover | Not implemented; does isolated single-doc update | **FAIL** | **CRITICAL** | `matches.controller.js:82` sets `match.status = 'accepted'`; never creates Handover |
| **Match Rejection Endpoint** | Backend Plan 3.B | `PUT /api/matches/:id/reject` transitions match and releases resource to `available` | Implemented in `matches.controller.js` | **PARTIAL** | **HIGH** | Updates match status to `rejected`, but never releases resource back to `available` |
| **Match Parameter Validation** | Backend Plan 3.B | Validate `:resourceId` and `:id` are valid ObjectIds | `match.validators.js` created but never imported or used | **FAIL** | **MEDIUM** | Zero validation middleware mounted on `matches.routes.js` |
| **Seed Data for Demand** | DB Plan Task 3.1 / 16 | Seed requests and demo-match pair | Missing from `src/seed/seed.js` | **MISSING** | **MEDIUM** | `seed.js` contains 0 requests and 0 matches |
| **Unit & Integration Tests** | Backend Plan 3.A / 3.B | Unit tests for scoring, lifecycle, transaction rollback | Zero tests implemented | **MISSING** | **CRITICAL** | 0 test files created by Engineer 3 |

---

## 4. Demand / Request Audit

### Request Creation (`POST /api/requests`)
- **Controller**: `src/controllers/requests.controller.js:addRequest` (lines 51–71).
- **Vulnerabilities & Defects**:
  1. **Mass Assignment Vulnerability**: `const request = new requestModel({ ...req.body, requesterId: req.user._id })`. The spread operator directly passes all client properties to Mongoose. A malicious client can submit `{ "status": "fulfilled" }` or `{ "status": "accepted" }`, bypassing the entire lifecycle state machine.
  2. **Unverified Organization Association (Org Spoofing)**: If the client passes `requesterOrgId`, `addRequest` never checks whether the organization exists, whether `req.user._id` is the owner or an approved member, or whether the organization is verified.
  3. **Foreign Key Integrity Missing**: No check is performed to verify that `categoryId` exists in the database.
  4. **Validator Schema Discrepancy**: `src/validators/request.validators.js:createRequestValidation` requires a `title` field (`Title is required`), but `src/models/Request.js` has no `title` field in its schema! Clients adhering to the specification are rejected with HTTP 400. Furthermore, the validator does not validate `location.city` (which is required by the Mongoose schema), and permits `urgency: 'critical'` which Mongoose rejects.

### Request Retrieval (`GET /api/requests` & `GET /api/requests/:id`)
- **`GET /api/requests`**:
  - Unbounded query: executes `requestModel.find()` without pagination (`page`, `limit`, `skip`).
  - Missing filters: Ignores query parameters (`category`, `city`, `area`, `status`), violating FR-022.
  - Eager Population: Populates `requesterId`, `categoryId`, and `requesterOrgId` indiscriminately. Populating `categoryId` fails if Category is not registered.
  - Missing response metadata envelope (`total`, `page`, `limit`).
- **`GET /api/requests/:id`**:
  - Missing route parameter validation middleware.
  - If an invalid ObjectId is supplied, Mongoose throws a `CastError`, caught by `.catch((err) => res.status(400).json({ success: false, message: err.message }))`, which leaks internal Mongoose model and path details directly to the client.

### Request Update (`PUT /api/requests/:id`)
- **Controller**: `src/controllers/requests.controller.js:updateRequest` (lines 73–109).
- **Critical IDOR**: `requestModel.findByIdAndUpdate(req.params.id, updateData, ...)` executes without checking if `request.requesterId` equals `req.user._id` or if `req.user.role === 'admin'`. Any authenticated user can modify any other user's request.
- **Terminal State Violation**: Updates are not blocked on terminal states (`fulfilled`, `cancelled`).

### Request Status & Lifecycle (`PUT /api/requests/:id/status`)
- **Controller**: `src/controllers/requests.controller.js:changeRequestStatus` (lines 111–140).
- **Critical IDOR**: Any authenticated user can change the status of any request on the platform.
- **Ignored Actor Parameter**: In `requestLifecycleService.js`, `transitionRequest(request, action, actor)` accepts `actor` as line 22 argument, but never references it. Role or ownership rules are completely unenforced.

### Request Deletion (`DELETE /api/requests/:id`)
- **Controller**: `src/controllers/requests.controller.js:deleteRequest` (lines 142–171).
- **Critical IDOR**: Any authenticated user can cancel any other user's request.
- **Incorrect Error Code**: Catches `CastError` on invalid ID and returns HTTP 409 instead of HTTP 400.

---

## 5. Matching Engine Audit

### Matching Trigger (`POST /api/matches/:resourceId/generate`)
- **Missing Authentication**: `src/routes/matches.routes.js:12` mounts `matchRouter.post("/:resourceId/generate", generateResourceMatches)` without `authenticate`.
- **Missing Ownership Check**: Never verifies that the caller owns the resource.
- **Runtime Crash**: Synchronously invokes `matchingService.generateMatches(resourceId)`, which executes `const Resource = mongoose.model("resources")` (lines 97 & 117). Because `resources` is unregistered, Mongoose throws `MissingSchemaError`, crashing into `errorHandler` as **HTTP 500 INTERNAL_ERROR**.
- **Missing Validation Middleware**: `generateMatchValidation` from `match.validators.js` was never mounted on the route.

### Match Acceptance (`PUT /api/matches/:id/accept`)
- **Controller**: `src/controllers/matches.controller.js:acceptMatch` (lines 51–100).
- **Critical Architectural Violation**: Backend Plan Task 3.B explicitly mandates:
  > *"Calls matchingService.acceptMatch(matchId, actingUser) which opens a MongoDB session and: a. matches.status: 'proposed' -> 'accepted', b. resources.status: transitions via resourceLifecycleService, c. requests.status: transitions via requestLifecycleService, d. calls handoverService.createHandoverForMatch(match, session) to create the handovers document in the SAME transaction. If any step fails, session.abortTransaction()."*
- **Actual Reality**:
  ```javascript
  match.status = "accepted";
  return match.save();
  ```
  1. No session is opened (`mongoose.startSession()`).
  2. No transaction is executed (`session.withTransaction()`).
  3. `resources.status` is NOT transitioned.
  4. `requests.status` is NOT transitioned.
  5. `handoverService.createHandoverForMatch` is NEVER called (it is not even imported).
  6. **No Handover document is created**. This breaks the entire downstream flow for Engineer 4 (Handover confirmations, contribution records, user stats, and admin analytics).

### Match Rejection (`PUT /api/matches/:id/reject`)
- **Controller**: `src/controllers/matches.controller.js:rejectMatch` (lines 102–151).
- **Incomplete Flow**: Sets `match.status = "rejected"`, but fails to call `resourceLifecycleService` to return the resource to `available`.

### Match Inbox Retrieval (`GET /api/matches`)
- **Controller**: `src/controllers/matches.controller.js:getMatches` (lines 25–49).
- **Unhandled Crash**: Route lacks `authenticate`. Accessing `req.user._id` when unauthenticated throws `TypeError: Cannot read properties of undefined (reading '_id')`, returning HTTP 500.
- **Missing Admin Override**: Does not implement the required query parameter allowing administrators to inspect all matches across the platform.

---

## 6. Matching Algorithm Audit

File: [`src/services/matchingService.js`](file:///home/lymon/G-19-Dawarhaa/backend/src/services/matchingService.js)

### Weights & Threshold Configuration
- Declared as named constants at the top of the file:
  - `W1 = 0.30` (category)
  - `W2 = 0.20` (location)
  - `W3 = 0.15` (quantity)
  - `W4 = 0.20` (urgency)
  - `W5 = 0.15` (availability)
  - `MIN_SCORE = 0.50`
  - Sum of weights: $0.30 + 0.20 + 0.15 + 0.20 + 0.15 = 1.0$.

### Line-by-Line Formula Evaluation

| Criterion | Specification | Actual Implementation | Correct? | Severity | Code Location & Evidence |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Category** | Match: 1, Mismatch: 0 | `String(resource.categoryId) === String(request.categoryId) ? 1 : 0` | **YES** | — | `matchingService.js:24–29` |
| **Location** | Proximity / area match | Checks `city === city` then sets `locationScore = 1`. Then checks `area === area` and sets `locationScore = 1` again. | **NO** | **HIGH** | `matchingService.js:32–46`. Area check is dead code; same city with different area receives identical score (1.0) to same area. |
| **Quantity** | Offered vs requested amount | `resource.quantity >= request.quantity ? 1 : 0` | **PARTIAL** | **LOW** | `matchingService.js:49–55`. All-or-nothing check; no proportional sub-score if resource provides partial fulfillment. |
| **Urgency** | Urgency of request | `high: 1.0`, `medium: 0.7`, `low: 0.4` | **YES** | — | `matchingService.js:58–64` |
| **Availability** | Window date comparison | `resource.status === 'available' ? 1 : 0` | **NO** | **HIGH** | `matchingService.js:67–69`. Fails to compare dates in `availabilityWindow: { start, end }`. Always returns 1.0 since unavailable resources are excluded earlier. |

### Query & Insertion Logic Defects
1. **Unbounded Candidate Loading**: `requestModel.find({ status: "published", categoryId: resource.categoryId })` loads all matching requests into memory without applying location filters or limits.
2. **Redundant Database Query**: Calls `Resource.findById(resourceId)` on line 99, and then calls `Resource.findById(resourceId)` a second time on line 119.
3. **Flawed Duplicate Filter**: If all matching candidates already have proposed matches in the database, `matchModel.create(match)` catches code 11000 and returns `null`. Line 160 filters out `null`, returning an empty array `[]` to the caller instead of returning the existing proposed matches.

---

## 7. Database / Models Audit

### `Request.js` ([`backend/src/models/Request.js`](file:///home/lymon/G-19-Dawarhaa/backend/src/models/Request.js))
- **Schema Fields**: `requesterId`, `requesterOrgId`, `categoryId`, `quantity`, `urgency`, `location: { city, area }`, `description`, `status`. Matches DB Plan Section 8.5.
- **Indexes**:
  - `{ status: 1, categoryId: 1, urgency: -1, createdAt: -1 }` (ESR compound index).
  - `{ requesterId: 1, status: 1 }`.
  - `{ "location.city": 1, "location.area": 1, status: 1 }`.
  - Correctly matches DB Plan Section 6.5.
- **Model Registration Flaw**:
  ```javascript
  const requestModel = mongoose.model("requests", requestSchema);
  ```
  Registered as `"requests"` (lowercase plural) instead of `"Request"`. Breaks all standard Mongoose `ref: "Request"` lookups across other models.

### `Match.js` ([`backend/src/models/Match.js`](file:///home/lymon/G-19-Dawarhaa/backend/src/models/Match.js))
- **Schema Fields**: `resourceId`, `requestId`, `providerId`, `requesterId`, `score`, `scoreBreakdown: { category, location, quantity, urgency, availability }`, `status`, `expiresAt`. Matches DB Plan Section 8.6.
- **Indexes**:
  - `{ resourceId: 1, status: 1 }`.
  - `{ requestId: 1, status: 1 }`.
  - `{ providerId: 1, status: 1, createdAt: -1 }`.
  - `{ requesterId: 1, status: 1, createdAt: -1 }`.
  - `{ status: 1, expiresAt: 1 }`.
  - `{ resourceId: 1, requestId: 1 }` with `{ unique: true, partialFilterExpression: { status: "proposed" } }`.
  - Correctly matches DB Plan Section 6.6.
- **Model Registration Flaw**:
  ```javascript
  const matchModel = mongoose.model("matches", matchSchema);
  ```
  Registered as `"matches"` (lowercase plural) instead of `"Match"`. Causes `Handover.js` (`ref: "Match"`) to throw `MissingSchemaError`.

---

## 8. API Routes Audit

| Method | Endpoint | Auth Middleware | RBAC / Owner Check | Input Validation | Actual Status Code (Unauth / Invalid) | Result |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `GET` | `/api/requests` | None (Public) | None | None | 200 (Unbounded) | **PARTIAL** |
| `GET` | `/api/requests/:id` | None (Public) | None | None | 400 (Raw CastError leak) | **PARTIAL** |
| `POST` | `/api/requests` | `authenticate` | None (Sets `requesterId`) | `createRequestValidation` | 401 Unauth / 400 Validation | **PARTIAL** (Mass assignment) |
| `PUT` | `/api/requests/:id` | `authenticate` | **MISSING** (IDOR) | `updateRequestValidation` | 401 Unauth / 200 on any user's request | **FAIL** (CRITICAL IDOR) |
| `PUT` | `/api/requests/:id/status` | `authenticate` | **MISSING** (IDOR) | `changeStatusValidation` | 401 Unauth / 200 on any user's request | **FAIL** (CRITICAL IDOR) |
| `DELETE` | `/api/requests/:id` | `authenticate` | **MISSING** (IDOR) | **MISSING** | 401 Unauth / 200 on any user's request | **FAIL** (CRITICAL IDOR) |
| `POST` | `/api/matches/:resourceId/generate` | **MISSING** | **MISSING** | **MISSING** | 500 (`MissingSchemaError`) / 409 | **FAIL** (CRITICAL) |
| `GET` | `/api/matches` | **MISSING** | Unchecked (`req.user._id`) | None | **500 TypeError** (req.user undefined) | **FAIL** (CRITICAL) |
| `PUT` | `/api/matches/:id/accept` | **MISSING** | In controller (requires `req.user`) | **MISSING** | **500 TypeError** (req.user undefined) | **FAIL** (CRITICAL) |
| `PUT` | `/api/matches/:id/reject` | **MISSING** | In controller (requires `req.user`) | **MISSING** | **500 TypeError** (req.user undefined) | **FAIL** (CRITICAL) |

---

## 9. Authentication & Authorization Audit

1. **Complete Authentication Bypass on Matches Domain**:
   - `backend/src/routes/matches.routes.js` imports express router and controllers, but never imports or applies `authenticate`.
   - Calling `GET /api/matches` without an Authorization header crashes with HTTP 500 because the controller attempts to access `req.user._id`.
2. **Critical IDOR on Request Mutation**:
   - `PUT /api/requests/:id`, `PUT /api/requests/:id/status`, and `DELETE /api/requests/:id` only verify that the user has a valid JWT, but never check whether `req.user._id.equals(request.requesterId)` or `req.user.role === 'admin'`.
   - Any authenticated user can modify, advance status, or cancel any other user's request.
3. **Role Enforcement Absent**:
   - Non-admin users cannot be prevented from taking administrative actions where applicable.
   - Admin override to view all matches (`GET /api/matches?all=true`) is completely absent.

---

## 10. Security Audit

| Vulnerability Type | Severity | Affected File & Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Authentication Missing** | **CRITICAL** | `src/routes/matches.routes.js` (all endpoints) | No JWT authentication required. Unauthenticated callers crash controllers or trigger unconstrained matching. |
| **Insecure Direct Object Reference (IDOR)** | **CRITICAL** | `src/controllers/requests.controller.js` (`updateRequest`, `changeRequestStatus`, `deleteRequest`) | Any authenticated user can update, change status of, or delete any other user's request by guessing or extracting its ObjectId. |
| **Mass Assignment** | **HIGH** | `src/controllers/requests.controller.js:addRequest` | `...req.body` directly injected into Mongoose model instantiation, allowing direct assignment of `status: "fulfilled"`. |
| **Information Disclosure** | **MEDIUM** | `src/controllers/requests.controller.js:getRequest` | Returns raw Mongoose `CastError` string containing database internal path and model name on invalid ObjectId parameter. |
| **Denial of Service (Unbounded Query)** | **MEDIUM** | `src/controllers/requests.controller.js:getRequests` | Performs unpaginated `find()` returning all records across the entire collection. |
| **Resource Abuse** | **HIGH** | `src/routes/matches.routes.js:generateResourceMatches` | Publicly triggers database query and matching calculation without rate limiting or authentication. |

---

## 11. Error Handling Audit

1. **Non-Standard Error Envelopes**:
   - The platform standardizes on `{ success: false, error: { code: string, message: string } }`.
   - Engineer 3's controllers return `{ success: false, message: string }` without the nested `error` object and error `code`.
2. **Incorrect HTTP Status Codes**:
   - In `matches.controller.js:generateResourceMatches`: Returns HTTP 409 for invalid ID (should be 400).
   - In `requests.controller.js:deleteRequest`: Returns HTTP 409 on CastError (should be 400).
   - In `requests.controller.js:changeRequestStatus`: Returns HTTP 409 on CastError (should be 400).
3. **Unhandled Internal Server Errors (HTTP 500)**:
   - Calling `GET /api/matches` without auth throws unhandled `TypeError` crashing into HTTP 500.
   - Calling `POST /api/matches/:resourceId/generate` throws `MissingSchemaError: Schema hasn't been registered for model "resources"`, crashing into HTTP 500.

---

## 12. Cross-Engineer Integration Audit

### Engineer 1 Dependency
- **Authentication**: Engineer 1 provides `authenticate.js`. Engineer 3 correctly applied it to `requests.routes.js`, but completely omitted it from `matches.routes.js`.
- **Authorization**: Engineer 1 provides `authorize.js` (`requireRole`, `requireOwnership`). Engineer 3 never imported or used `authorize.js`, leading to IDOR vulnerabilities.
- **User Reference**: `Request.js` and `Match.js` reference `ref: "User"`, which integrates cleanly with Engineer 1's `User` model.

### Engineer 2 Dependency (Supply Side)
- **Status: BLOCKER / DEPENDENCY BREAKAGE**:
  - Engineer 2 owns `Resource.js`, `Category.js`, and `resourceLifecycleService.js`.
  - In the repository, `src/models/Resource.js` and `src/models/Category.js` are currently 0-byte empty files.
  - In `matchingService.js`, Engineer 3 wrote `const Resource = mongoose.model("resources")` (lowercase plural). Even if Engineer 2 implements `Resource.js` as `mongoose.model("Resource", ...)`, Engineer 3's code will still crash with `MissingSchemaError` due to the naming discrepancy.
  - Engineer 3 fails to invoke `resourceLifecycleService` on match accept or match reject.

### Engineer 4 Dependency (Handovers & Impact)
- **Status: BROKEN DOWNSTREAM CONTRACT**:
  - Engineer 4 owns `handoverService.createHandoverForMatch(match, session)`.
  - Engineer 3 never imported `handoverService.js` and never calls `createHandoverForMatch`.
  - In `matches.controller.js:acceptMatch`, the match status is set to `accepted`, but no Handover is created.
  - Because of this failure, Engineer 4's end-to-end integration tests (`tests/integration/e2e.demo.test.js` Step 6) were forced to manually seed a `Match` document in a test `before()` hook and bypass Engineer 3's `acceptMatch` endpoint.

---

## 13. Test Audit

| Test Suite | File | Tests Run | Passed | Failed | Ownership |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Unit Tests | `backend/tests/unit/reports.test.js` | 16 | 16 | 0 | Engineer 4 |
| Unit Tests | `backend/tests/unit/transactions.confirm.test.js` | 23 | 23 | 0 | Engineer 4 |
| Unit Tests | `backend/tests/unit/contributions.test.js` | 8 | 8 | 0 | Engineer 4 |
| Unit Tests | `backend/tests/unit/notifications.test.js` | 13 | 13 | 0 | Engineer 4 |
| Unit Tests | `backend/tests/unit/admin.analytics.test.js` | 35 | 35 | 0 | Engineer 4 |
| Model Unit Tests | `backend/test/models.test.js` | 0 (crashes) | 0 | 1 | Engineer 1 |
| DB Unit Tests | `backend/test/database.test.js` | 2 | 2 | 0 | Engineer 1 |
| **Engineer 3 Unit Tests** | **None** | **0** | **0** | **0** | **Engineer 3 (MISSING)** |

- **Test Deficiencies**:
  - 0 unit tests for `calculateScore`.
  - 0 unit tests for `generateMatches`.
  - 0 unit tests for `requestLifecycleService`.
  - 0 unit tests for `acceptMatch` transactional atomicity or rollback.
  - 0 tests for partial unique index duplicate proposal rejection.

---

## 14. Performance Audit

1. **Redundant Database Queries**: In `matchingService.js`, `Resource.findById(resourceId)` is executed twice within the same promise chain (line 99 and line 119).
2. **Unbounded In-Memory Processing**: `requestModel.find({ status: "published", categoryId: resource.categoryId })` loads all candidate requests into Node.js heap memory without applying pagination or query limits.
3. **Unbounded Endpoint Response**: `GET /api/requests` fetches the entire collection with no limit, presenting significant memory and network overhead as data scales.

---

## 15. Code Quality Audit

1. **Dead & Commented Code**:
   - `src/routes/requests.routes.js` lines 63–73 contains dead commented-out router definitions.
   - `src/services/matchingService.js` lines 39–45: `area === area` check sets `locationScore = 1`, which was already set on line 37.
2. **Unused Parameters**:
   - `src/services/requestLifecycleService.js:22`: `transitionRequest(request, action, actor)` accepts `actor` but never uses it.
3. **Architecture Violation**:
   - `acceptMatch` logic is placed directly in `matches.controller.js` rather than inside `matchingService.js`, completely bypassing the service layer.

---

## 16. Critical Findings

1. **Missing Authentication on Match Routes (`src/routes/matches.routes.js`)**:
   - All 4 match endpoints are unauthenticated. Calling `GET /api/matches` crashes with HTTP 500; `POST /:resourceId/generate` is exposed to anonymous exploitation.
2. **Critical IDOR on Request Mutation (`src/controllers/requests.controller.js`)**:
   - `updateRequest`, `changeRequestStatus`, and `deleteRequest` perform database mutations without ownership checks. Any authenticated user can modify or delete any request.
3. **Missing Match-Acceptance Multi-Document Transaction & Handover Creation**:
   - `acceptMatch` performs an isolated `match.status = 'accepted'` write. It opens no session, executes no transaction, does not update `resources` or `requests`, and never calls `handoverService.createHandoverForMatch`. Downstream handovers are never created.
4. **Zero Test Coverage**:
   - Engineer 3 authored 0 unit tests and 0 integration tests across the entire repository.

---

## 17. High Findings

1. **Mongoose Model Registration Mismatch (`requests` / `matches`)**:
   - Registered as lowercase plural instead of PascalCase singular `"Request"` and `"Match"`. All Mongoose `ref` populations fail with `MissingSchemaError`.
2. **Unregistered `resources` Model Lookup in `matchingService.js`**:
   - Directly calls `mongoose.model("resources")` without import. Crashes with `MissingSchemaError` on match generation.
3. **Mass Assignment Vulnerability in `addRequest`**:
   - `new requestModel({ ...req.body, requesterId: req.user._id })` allows clients to force `status: "fulfilled"`.
4. **Validation Schema Contradictions in `request.validators.js`**:
   - Enforces phantom `title` not present in `Request.js`.
   - Ignores required `location.city`.
   - Allows invalid urgency value `'critical'`.
5. **Flawed Location & Availability Scoring Logic**:
   - Area match check is dead code.
   - `availabilityWindow` date range is ignored.

---

## 18. Medium Findings

1. **Non-Standard Error Envelope**:
   - Returns `{ success: false, message }` instead of `{ success: false, error: { code, message } }`.
2. **Missing Input Validation on Match Routes**:
   - `match.validators.js` is not applied to `matches.routes.js`.
3. **Unbounded Queries on `GET /api/requests` & `GET /api/matches`**:
   - No pagination (`page`, `limit`, `skip`) implemented.
4. **Empty Seed Data for Demand & Matches**:
   - `src/seed/seed.js` contains no requests or demo matches.

---

## 19. Low Findings

1. **Dead Commented-out Code in `requests.routes.js`**: Lines 63–73 contain unused boilerplate.
2. **All-or-Nothing Quantity Scoring**: Does not award partial score for partial quantity fulfillment.
3. **Redundant Resource Lookup**: `generateMatches` executes `Resource.findById` twice.

---

## 20. Dependency Blockers

| Dependency | Owner | Problem | Impact on Engineer 3 | Evidence |
| :--- | :---: | :--- | :--- | :--- |
| **Resource Model** | Engineer 2 | `src/models/Resource.js` is 0 bytes (unimplemented) | `generateMatches` cannot query resources; `Match` cannot reference Resource | File size: 0 bytes |
| **Category Model** | Engineer 2 | `src/models/Category.js` is 0 bytes (unimplemented) | Request creation cannot validate Category existence; populate fails | File size: 0 bytes |
| **Resource Lifecycle** | Engineer 2 | `resourceLifecycleService.js` is missing/unimplemented | Match accept and reject cannot cascade status updates to resource | Service file does not exist |

---

## 21. Required Fixes (Engineer 3 MUST FIX)

```text
Issue 1: Missing Authentication on Matches Routes
Severity: CRITICAL
File: src/routes/matches.routes.js
Location: Lines 12–21
Expected: Apply `authenticate` middleware to all match endpoints.
Actual: Routes are mounted with zero authentication.
Why it matters: Unauthenticated calls crash with HTTP 500; anonymous users can trigger match calculations.

Issue 2: IDOR on Request Update, Status Change, and Deletion
Severity: CRITICAL
File: src/controllers/requests.controller.js
Location: Lines 81, 112, 142
Expected: Check `if (String(request.requesterId) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403)`.
Actual: Directly performs database update without ownership check.
Why it matters: Any user can modify or delete another user's requests.

Issue 3: Implement Atomic Match Acceptance Transaction
Severity: CRITICAL
File: src/services/matchingService.js & src/controllers/matches.controller.js
Location: matches.controller.js:51–100
Expected: Implement `acceptMatch(matchId, actingUser)` using `mongoose.startSession()` and `session.withTransaction()`, updating match, resource, request, and calling `handoverService.createHandoverForMatch(match, session)`.
Actual: Isolated `match.status = 'accepted'` write; Handover is never created.
Why it matters: Completely breaks the transition into handovers, confirmations, and impact metrics.

Issue 4: Fix Model Registration Names
Severity: HIGH
File: src/models/Request.js & src/models/Match.js
Location: Request.js:90, Match.js:129
Expected: `mongoose.model("Request", requestSchema)` and `mongoose.model("Match", matchSchema)`.
Actual: `mongoose.model("requests", requestSchema)` and `mongoose.model("matches", matchSchema)`.
Why it matters: Causes `MissingSchemaError` across all Mongoose `ref` populations.

Issue 5: Fix Model Import and Lookup in matchingService.js
Severity: HIGH
File: src/services/matchingService.js
Location: Lines 97, 117
Expected: Import Resource model directly from `../models/Resource.js`.
Actual: Calls `mongoose.model("resources")` (lowercase plural), crashing with `MissingSchemaError`.
Why it matters: Prevents match generation from executing.

Issue 6: Author Unit and Integration Test Suite
Severity: CRITICAL
File: tests/unit/matching.test.js & tests/unit/requests.test.js
Location: New test files
Expected: Comprehensive unit tests covering `calculateScore`, lifecycle transitions, and transaction rollback.
Actual: Zero tests authored.
Why it matters: Core matching logic and transactions are unverified.
```

---

## 22. Recommended Fixes

1. Add pagination (`page`, `limit`) and query filters (`category`, `city`, `area`, `status`) to `GET /api/requests`.
2. Add pagination and admin override (`?all=true`) to `GET /api/matches`.
3. Standardize error responses to use `{ success: false, error: { code, message } }`.
4. Align `src/validators/request.validators.js` with `Request.js` (remove `title`, add `location.city`, correct `urgency` enum).
5. Clean up dead code in `src/routes/requests.routes.js` and `src/services/matchingService.js`.
6. Add request and demo-match seed data to `src/seed/seed.js`.

---

## 23. Evidence / Commands Executed

1. `git show --stat 5486e73`: Inspected all 11 files committed by Engineer 3.
2. `node --test tests/unit/*.test.js`: Confirmed 95 unit tests run and pass, but all belong exclusively to Engineer 4.
3. `node -e 'import("./backend/src/app.js")... fetch("http://127.0.0.1:.../api/matches")'`: Probed unauthenticated `GET /api/matches`; confirmed HTTP 500 crash (`TypeError: Cannot read properties of undefined (reading '_id')`).
4. `node -e 'import("./backend/src/app.js")... fetch(".../api/matches/invalid-id/generate")'`: Probed invalid resourceId; confirmed HTTP 409 response with non-standard envelope `{ success: false, message: 'Invalid resourceId' }`.
5. `node -e 'import("./backend/src/app.js")... fetch(".../api/matches/507f1f77bcf86cd799439011/generate")'`: Probed valid ObjectId match generation; confirmed HTTP 500 crash (`MissingSchemaError: Schema hasn't been registered for model "resources"`).
6. `node -e 'import("./backend/src/app.js")... fetch(".../api/requests/invalid-id")'`: Probed invalid request ID; confirmed HTTP 400 with raw CastError information leakage.
7. Model Name Verification Script:
   ```javascript
   import mongoose from "mongoose";
   import "./src/models/Request.js";
   import "./src/models/Match.js";
   console.log(mongoose.modelNames()); // [ 'requests', 'matches' ]
   mongoose.model("Request"); // Throws MissingSchemaError
   mongoose.model("Match");   // Throws MissingSchemaError
   ```
8. Mass Assignment Probe Script: Confirmed `new requestModel({ ...reqBody, requesterId })` accepts `status: "fulfilled"` directly from request body.

---

## 24. Final Verdict

```text
================================================================================
ENGINEER 3 AUDIT VERDICT: NOT READY (BLOCKED BY DEPENDENCIES)
================================================================================
```

### Detailed Justification
Engineer 3 has implemented the basic schemas and initial routes for requests and matches. However, the implementation is **NOT READY** for production or demonstration due to:
- Critical security vulnerabilities: Total absence of authentication on match endpoints and complete lack of ownership checks (IDOR) on request update, status transition, and deletion.
- Broken architectural contracts: The match acceptance endpoint does not implement the mandatory multi-document transaction and fails to create a `Handover`, breaking downstream integration with Engineer 4.
- Internal runtime defects: Schema model names registered in lowercase plural crash companion references, and `matchingService` calls an unregistered plural model name.
- Complete absence of testing: 0 unit tests and 0 integration tests authored.
- External dependency blockers: Integration is partially blocked by Engineer 2's empty `Resource.js` and missing `resourceLifecycleService.js`.

### Completion Estimate
- **Functional Completeness**: 45%
- **Security Completeness**: 30%
- **Testing Completeness**: 0%
- **Implementation-Plan Compliance**: 40%
- **Overall Completion**: **35%**
