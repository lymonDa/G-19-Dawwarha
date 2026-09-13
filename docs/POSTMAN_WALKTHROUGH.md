# DAWWARHA — Postman Manual API Walkthrough & Verification Report

This document records the step-by-step walkthrough and API verification of all endpoints using the official DAWWARHA Postman test suite and automated HTTP integration matrix.

---

## Domain Verification Checklist

- [x] **[PASS] Auth**: Registration, login, logout, credential validation, account suspension enforcement.
- [x] **[PASS] Users**: Profile retrieval, profile update, ownership restrictions.
- [x] **[PASS] Organizations**: Registration, public lookup, owner profile update, admin verification decision.
- [x] **[PASS] Admin**: User listing with pagination, account suspension, account reactivation.
- [x] **[PASS] Categories**: Public listing, public lookup, admin creation, admin update, admin soft-deletion.
- [x] **[PASS] Resources**: Public catalog filtering, draft creation, public details, owner updates, publish transition, cancellation.
- [x] **[PASS] Requests**: Demand creation, authenticated listing, single lookup, owner updates, publish transition, cancellation.
- [x] **[PASS] Matches**: Algorithmic scoring generation, inbox listing, atomic transaction acceptance, rejection.
- [x] **[PASS] Handover / Transactions**: Provider confirmation, seeker confirmation, duplicate safety, status cascade.
- [x] **[PASS] Reports**: Content reporting, target existence validation, admin listing, admin resolution notes.
- [x] **[PASS] Notifications**: Recipient-isolated delivery, list with unread filtering, mark-as-read.
- [x] **[PASS] Contributions**: Completed transfer impact ledger, reputation score points, user statistics.
- [x] **[PASS] Analytics**: 4 real-time aggregation pipelines (summary, category breakdown, category impact, match rate).

---

## Detailed Step-by-Step Walkthrough

### 1. Auth & Identity (`DAWWARHA_Identity_and_Admin_API_Postman_Collection.json`)
1. **Register User (`POST /api/auth/register`)**:
   - Status: `201 Created`
   - Verified: Returns JWT token and sanitized user object without password hash.
   - Negative: Rejects invalid email (`400`) and duplicate email (`409`).
2. **Login (`POST /api/auth/login`)**:
   - Status: `200 OK`
   - Verified: Returns Bearer token; stores token in Postman variable `{{provider_token}}`.
   - Negative: Rejects wrong password (`401`).
3. **Get Current Profile (`GET /api/users/me`)**:
   - Status: `200 OK`
   - Verified: Returns authenticated user record with `stats` object.
   - Negative: Unauthenticated returns `401`.
4. **Update Profile (`PUT /api/users/me`)**:
   - Status: `200 OK`
   - Verified: Updates name and location fields safely.
5. **Register Organization (`POST /api/organizations`)**:
   - Status: `201 Created`
   - Verified: Organization created with `ownerUserId` set to caller, status `pending`.
6. **Admin Verify Organization (`POST /api/organizations/:id/verify`)**:
   - Status: `200 OK`
   - Verified: Admin approves organization; sets `verification.status: "approved"`.
   - Negative: Non-admin caller receives `403 Forbidden`.
7. **Admin User Suspension (`PUT /api/admin/users/:id/suspend`)**:
   - Status: `200 OK`
   - Verified: Target user status becomes `"suspended"`. Attempting login with suspended account returns `403`.
8. **Admin User Reactivation (`PUT /api/admin/users/:id/reactivate`)**:
   - Status: `200 OK`
   - Verified: Target user restored to `"active"`.

---

### 2. Supply & Categories (`DAWWARHA_Resource_API_Postman_Collection.json`)
1. **List Categories (`GET /api/categories`)**:
   - Status: `200 OK`
   - Verified: Returns 7 active taxonomy categories.
2. **Create Category (`POST /api/categories`)**:
   - Status: `201 Created`
   - Verified: Admin creates new taxonomy category.
   - Negative: Non-admin caller receives `403`.
3. **Create Resource (`POST /api/resources`)**:
   - Status: `201 Created`
   - Verified: Resource created in `"draft"` status with quantity and location.
4. **Publish Resource (`PUT /api/resources/:id/status`)**:
   - Status: `200 OK`
   - Verified: Action `"publish"` transitions resource from `"draft"` to `"available"`.
5. **Browse Catalog (`GET /api/resources?city=Amman&status=available`)**:
   - Status: `200 OK`
   - Verified: Returns published resources matching query parameters.
   - Security: Rejects MongoDB operators (`?category[$ne]=null`) with `400 INVALID_QUERY`.

---

### 3. Demand & Matching (`DAWWARHA_Demand_and_Matching_API_Postman_Collection.json`)
1. **Create Request (`POST /api/requests`)**:
   - Status: `201 Created`
   - Verified: Created in `"draft"` status with urgency and category.
2. **Publish Request (`PUT /api/requests/:id/status`)**:
   - Status: `200 OK`
   - Verified: Action `"publish"` transitions request to `"published"`.
3. **Generate Matches (`POST /api/matches/:resourceId/generate`)**:
   - Status: `200 OK`
   - Verified: Evaluates candidate requests using normalized weights; returns matches sorted by score descending.
4. **Inspect Match Inbox (`GET /api/matches`)**:
   - Status: `200 OK`
   - Verified: Authenticated seeker views proposed match in inbox.
5. **Accept Match (`PUT /api/matches/:id/accept`)**:
   - Status: `200 OK`
   - Verified: Atomically transitions Match to `"accepted"`, Resource to `"accepted"`, Request to `"accepted"`, and creates a Handover document with status `"in_progress"`.
   - Negative: Rejects third-party callers with `403`. Duplicate accept returns `409`.

---

### 4. Trust, Impact & Moderation (`DAWWARHA_Trust_and_Impact_API_Postman_Collection.json`)
1. **Provider Confirms Handover (`POST /api/transactions/:matchId/confirm`)**:
   - Status: `200 OK`
   - Verified: `confirmedByProvider: true`, status remains `"in_progress"`.
2. **Seeker Confirms Handover (`POST /api/transactions/:matchId/confirm`)**:
   - Status: `200 OK`
   - Verified: `confirmedBySeeker: true`, status cascades to `"completed"`, Resource becomes `"impact_recorded"`, Request becomes `"fulfilled"`.
   - Security: Rejects non-participants with `403`. Repeated calls are idempotent.
3. **Check Contribution History (`GET /api/users/me/contributions`)**:
   - Status: `200 OK`
   - Verified: Returns contribution record and verifies user reputation score increased by +10.
4. **Submit Moderation Report (`POST /api/reports`)**:
   - Status: `201 Created`
   - Verified: Validates that target exists in database; creates report with status `"open"`.
5. **Admin List & Resolve Reports (`GET /api/reports`, `PUT /api/reports/:id/resolve`)**:
   - Status: `200 OK`
   - Verified: Admin records resolution notes; report transitions to `"resolved"`.
   - Notification: Triggers `report_resolved` notification to the reporter.
6. **Fetch Notifications (`GET /api/notifications`)**:
   - Status: `200 OK`
   - Verified: Returns recipient-isolated notifications.
7. **Platform Analytics (`GET /api/admin/analytics`)**:
   - Status: `200 OK`
   - Verified: Returns live aggregated metrics across all 4 Section 14 pipelines.
