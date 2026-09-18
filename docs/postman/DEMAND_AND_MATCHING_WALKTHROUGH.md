# DAWWARHA — Demand & Matching API Walkthrough
**Engineer 3 Deliverable — Demand, Matching Engine & Coordination**

This guide provides an end-to-end walkthrough for verifying all endpoints, business logic, security rules, and transaction boundaries implemented by Engineer 3.

---

## 📋 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Prerequisites & Environment](#prerequisites--environment)
3. [Walkthrough Steps](#walkthrough-steps)
   - [Step 1: Authenticate Users & Seed Tokens](#step-1-authenticate-users--seed-tokens)
   - [Step 2: Create a Demand Request (Task 3.A)](#step-2-create-a-demand-request-task-3a)
   - [Step 3: Verify Request Validation & Security](#step-3-verify-request-validation--security)
   - [Step 4: Filter and Paginate Requests](#step-4-filter-and-paginate-requests)
   - [Step 5: Generate Matches for a Supply Resource (Task 3.B)](#step-5-generate-matches-for-a-supply-resource-task-3b)
   - [Step 6: Verify User Inbox Isolation & Admin View](#step-6-verify-user-inbox-isolation--admin-view)
   - [Step 7: Accept a Match via Atomic Multi-Document Transaction](#step-7-accept-a-match-via-atomic-multi-document-transaction)
   - [Step 8: Reject a Match and Release Entities](#step-8-reject-a-match-and-release-entities)
   - [Step 9: Soft Cancel a Request](#step-9-soft-cancel-a-request)
4. [Postman Collection Setup](#postman-collection-setup)

---

## 1. Overview & Architecture

Engineer 3 owns the **Demand & Matching** domain:
1. **Demand Management (Task 3.A)**:
   - `Request` model and MongoDB indexes (`requesterId_1_status_1`, `categoryId_1_status_1`, `status_1_urgency_1_createdAt_-1`, `location.city_1_status_1`).
   - Request lifecycle state machine per DB Plan 9.3:
     `draft` ➔ `published` ➔ `matched` ➔ `accepted` ➔ `fulfilled`
     (with alternate terminal/cancellation paths: `cancelled`, `expired`).
   - Strict category existence & active state check (`isActive: true`).
   - Verified organization membership requirement (`verification.status === "approved"`).
   - Mass assignment prevention (client cannot inject status).
2. **Matching Engine & Coordination (Task 3.B)**:
   - Shared query builder integration with Engineer 2 (`buildResourceQuery` / candidate retrieval).
   - 5-dimension explainable weighted scoring:
     - $W_1 = 0.30$ (Category Compatibility)
     - $W_2 = 0.20$ (Location Proximity: City=0.7, Area=1.0)
     - $W_3 = 0.15$ (Quantity Compatibility: $R_{qty} \ge D_{qty}$)
     - $W_4 = 0.20$ (Urgency Tiers: Critical=1.0, High=0.8, Medium=0.5, Low=0.2)
     - $W_5 = 0.15$ (Availability Window Overlap)
   - Threshold cutoff ($S \ge 0.50$).
   - Inbox isolation: standard users view only matches where they are `providerId` or `requesterId`. Admin override via `?all=true`.
   - Atomic acceptance via native MongoDB multi-document transaction (`session.withTransaction` / `session.startTransaction`):
     - `matches.status` ➔ `accepted`
     - `resources.status` ➔ `accepted` (via `resourceLifecycleService.transitionResource`)
     - `requests.status` ➔ `accepted` (via `requestLifecycleService.transitionRequest`)
     - `handovers` document created (via `handoverService.createHandoverForMatch`) with `status: 'in_progress'`.

---

## 2. Prerequisites & Environment

Ensure the backend server is running:
```bash
cd backend
npm run dev
```

Base URL: `http://localhost:5000` (or `http://localhost:3000` depending on `PORT`).

---

## 3. Walkthrough Steps

### Step 1: Authenticate Users & Seed Tokens
Obtain JWT bearer tokens for three actors:
1. **Donor User** (`donor@dawwarha.com` / `Password123!`)
2. **Beneficiary User** (`ngo@dawwarha.com` / `Password123!`)
3. **Admin User** (`admin@dawwarha.com` / `Password123!`)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"donor@dawwarha.com","password":"Password123!"}'
```

---

### Step 2: Create a Demand Request (Task 3.A)
Submit a demand request as the Beneficiary user:
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer <BENEFICIARY_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Water Containers",
    "description": "Food-grade water containers needed for refugee relief camp distribution.",
    "categoryId": "<CATEGORY_ID>",
    "quantity": 25,
    "urgency": "high",
    "location": {
      "city": "Amman",
      "area": "Jabal Amman"
    }
  }'
```
**Expected Result**:
- Status: `201 Created`
- Response body contains `data._id` and `data.status: "draft"`.

---

### Step 3: Verify Request Validation & Security

#### A. Inactive Category Rejection:
Submitting an inactive or non-existent `categoryId` returns `400 Bad Request`:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Category not found or inactive"
  }
}
```

#### B. Mass Assignment Prevention:
Sending `status: "fulfilled"` in the request body is ignored; the server initializes the document to `draft`.

#### C. IDOR Protection on Update:
Attempting to update another user's request with a non-owner token returns `403 Forbidden`.

---

### Step 4: Filter and Paginate Requests
List requests with query filters:
```bash
curl -X GET "http://localhost:5000/api/requests?city=Amman&urgency=high&page=1&limit=10" \
  -H "Authorization: Bearer <BENEFICIARY_TOKEN>"
```
**Expected Result**:
- Status: `200 OK`
- Envelope includes `pagination: { page: 1, limit: 10, total: N, count: M }`.

---

### Step 5: Generate Matches for a Supply Resource (Task 3.B)
Trigger candidate generation as the supply resource owner:
```bash
curl -X POST http://localhost:5000/api/matches/<RESOURCE_ID>/generate \
  -H "Authorization: Bearer <DONOR_TOKEN>"
```
**Expected Result**:
- Status: `200 OK`
- Engine scores published requests against the resource using the 5 weights.
- Returns an array of created `Match` records with `status: "proposed"` and `scoreBreakdown`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "resourceId": "...",
      "requestId": "...",
      "score": 0.85,
      "scoreBreakdown": {
        "category": { "weight": 0.30, "score": 1.0, "weighted": 0.30 },
        "location": { "weight": 0.20, "score": 1.0, "weighted": 0.20 },
        "quantity": { "weight": 0.15, "score": 1.0, "weighted": 0.15 },
        "urgency": { "weight": 0.20, "score": 0.8, "weighted": 0.16 },
        "availability": { "weight": 0.15, "score": 0.25, "weighted": 0.04 }
      },
      "status": "proposed"
    }
  ]
}
```

---

### Step 6: Verify User Inbox Isolation & Admin View

#### A. User View (Inbox Isolation):
```bash
curl -X GET http://localhost:5000/api/matches \
  -H "Authorization: Bearer <DONOR_TOKEN>"
```
Returns only matches where `providerId` or `requesterId` matches the authenticated donor.

#### B. Admin View (Override):
```bash
curl -X GET "http://localhost:5000/api/matches?all=true" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
Returns all matches across the platform.

---

### Step 7: Accept a Match via Atomic Multi-Document Transaction
Accept the proposed match:
```bash
curl -X PUT http://localhost:5000/api/matches/<MATCH_ID>/accept \
  -H "Authorization: Bearer <DONOR_TOKEN>"
```
**Expected Result**:
- Status: `200 OK`
- In a single atomic transaction:
  1. `matches`: status updated from `proposed` ➔ `accepted`.
  2. `resources`: transitioned from `available` ➔ `accepted`.
  3. `requests`: transitioned from `published` ➔ `accepted`.
  4. `handovers`: new document created with `matchId`, `resourceId`, `requestId`, `providerId`, `seekerId`, `status: "in_progress"`.
- Response:
```json
{
  "success": true,
  "data": {
    "match": { "_id": "...", "status": "accepted" },
    "handoverId": "..."
  }
}
```

#### Verification of Rollback:
If any lifecycle transition fails or the handover creation errors out, the transaction aborts completely, leaving `match` as `proposed`, `resource` as `available`, and `request` as `published`.

---

### Step 8: Reject a Match and Release Entities
Reject a proposed match:
```bash
curl -X PUT http://localhost:5000/api/matches/<MATCH_ID>/reject \
  -H "Authorization: Bearer <BENEFICIARY_TOKEN>"
```
**Expected Result**:
- Status: `200 OK`
- `match.status` updated to `rejected`.
- If the resource or request was reserved in `matched` status, they are automatically released back to `available` and `published`.

---

### Step 9: Soft Cancel a Request
Soft-delete a request:
```bash
curl -X DELETE http://localhost:5000/api/requests/<REQUEST_ID> \
  -H "Authorization: Bearer <BENEFICIARY_TOKEN>"
```
**Expected Result**:
- Status: `200 OK`
- Response contains `data.status: "cancelled"`.
- MongoDB document is preserved with `status: "cancelled"` for analytics and audit trails.

---

## 4. Postman Collection Setup

1. Open Postman.
2. Click **Import** ➔ select `docs/postman/DAWWARHA_Demand_and_Matching_API_Postman_Collection.json`.
3. Set your collection variables (`base_url` defaults to `http://localhost:5000`).
4. Run requests in folder order:
   - `1. Authentication & Setup`
   - `2. Demand Management — Requests (Task 3.A)`
   - `3. Matching Engine & Inbox (Task 3.B)`
