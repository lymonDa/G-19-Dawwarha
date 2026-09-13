# DAWWARHA — Final Graduation Live Demo Guide

> **Target Audience**: Graduation Evaluation Committee & Project Evaluators  
> **Duration**: 5–7 Minutes  
> **Narrative Reference**: Section 28 of Backend Implementation Plan & Section 37 of Product Brief  
> **Core Loop**: **Resource &rarr; Request &rarr; Match &rarr; Acceptance &rarr; Handover &rarr; Two-Sided Confirmation &rarr; Impact Ledger**

---

## 0. Demo Setup & Environment

Before stepping onto the presentation stage:

1. Ensure the server is booted:
   ```bash
   cd backend && npm start
   ```
2. Verify pre-seeded database state:
   ```bash
   npm run seed
   ```
3. Pre-seeded credentials ready in your clipboard:
   - **Provider**: `provider@dawwarha.example` / `DawwarhaDemo123!`
   - **Seeker / Organization**: `user@dawwarha.example` / `DawwarhaDemo123!`
   - **Admin**: `admin@dawwarha.example` / `DawwarhaDemo123!`

---

## Step-by-Step Live Demonstration Script

### Step 1: Authentication & Identity
- **Action**: Authenticate as the pre-seeded Provider and Seeker.
  ```http
  POST /api/auth/login
  Content-Type: application/json

  { "email": "provider@dawwarha.example", "password": "DawwarhaDemo123!" }
  ```
  *(Repeat for `user@dawwarha.example` and `admin@dawwarha.example`)*
- **Evaluator Highlight**: Secure JWT authentication with bcrypt password hashing; returns sanitized user profile without password leakage.

---

### Step 2: Supply Listing (Resource Creation & Publishing)
- **Actor**: Provider
- **Action 1 — Create Resource Draft**:
  ```http
  POST /api/resources
  Authorization: Bearer {{provider_token}}
  Content-Type: application/json

  {
    "title": "Fresh Morning Pastries & Bread",
    "description": "25 boxes of freshly baked artisanal bakery surplus.",
    "categoryId": "{{food_category_id}}",
    "quantity": 25,
    "location": { "city": "Amman", "area": "Abdali", "address": "King Hussein St" },
    "availabilityWindow": {
      "start": "2026-09-13T08:00:00.000Z",
      "end": "2026-09-20T20:00:00.000Z"
    }
  }
  ```
  *Response*: `status: "draft"`.
- **Action 2 — Transition Status to Available**:
  ```http
  PUT /api/resources/:id/status
  Authorization: Bearer {{provider_token}}
  Content-Type: application/json

  { "action": "publish" }
  ```
  *Response*: `status: "available"`.
- **Evaluator Highlight**: Strict state-machine lifecycle prevents arbitrary jumps. Direct body tampering with `status: "available"` is rejected.

---

### Step 3: Demand Request (Creation & Publishing)
- **Actor**: Seeker (Community Organization)
- **Action 1 — Create Request Draft**:
  ```http
  POST /api/requests
  Authorization: Bearer {{seeker_token}}
  Content-Type: application/json

  {
    "title": "Bakery Items for Community Kitchen",
    "description": "Needed to supply evening community meals.",
    "categoryId": "{{food_category_id}}",
    "quantity": 20,
    "urgency": "high",
    "location": { "city": "Amman", "area": "Abdali" }
  }
  ```
  *Response*: `status: "draft"`.
- **Action 2 — Publish Request**:
  ```http
  PUT /api/requests/:id/status
  Authorization: Bearer {{seeker_token}}
  Content-Type: application/json

  { "action": "publish" }
  ```
  *Response*: `status: "published"`.
- **Evaluator Highlight**: Demand is validated against active taxonomy categories and geographic location parameters.

---

### Step 4: Explainable Matching Engine Execution
- **Actor**: Provider or Seeker
- **Action**: Run the matching engine for the resource:
  ```http
  POST /api/matches/:resourceId/generate
  Authorization: Bearer {{provider_token}}
  ```
- **Evaluator Highlight**:
  - The rule-based scoring formula evaluates 5 normalized weights:
    - `W1: Category Match` (35%)
    - `W2: Geographic Proximity` (25%)
    - `W3: Quantity Compatibility` (20%)
    - `W4: Urgency Factor` (10%)
    - `W5: Availability Window` (10%)
  - Returns ranked matches with embedded `scoreBreakdown` demonstrating transparent, explainable matching.
  - Automatically dispatches a `match_created` notification to the seeker!

---

### Step 5: Atomic Match Acceptance & Handover Creation
- **Actor**: Seeker (Accepts Proposed Match)
- **Action**:
  ```http
  PUT /api/matches/:matchId/accept
  Authorization: Bearer {{seeker_token}}
  ```
- **Evaluator Highlight**:
  - **Cross-Domain Atomic Multi-Document Transaction**:
    1. `Match` transitions to `"accepted"`.
    2. `Resource` transitions to `"accepted"`.
    3. `Request` transitions to `"accepted"`.
    4. `Handover` document is created in `"in_progress"` state.
  - If any step fails, the entire transaction rolls back cleanly with zero orphaned documents.
  - Counter-party receives a `match_accepted` notification.

---

### Step 6: Two-Sided Handover Confirmation (The Trust Loop)
- **Step 6A — Provider Confirms Physical Handoff**:
  ```http
  POST /api/transactions/:matchId/confirm
  Authorization: Bearer {{provider_token}}
  ```
  *Response*:
  ```json
  {
    "success": true,
    "data": {
      "status": "in_progress",
      "confirmedByProvider": true,
      "confirmedBySeeker": false,
      "bothConfirmed": false
    }
  }
  ```
  *(Handover remains `in_progress`; no contribution is recorded yet).*

- **Step 6B — Seeker Confirms Receipt**:
  ```http
  POST /api/transactions/:matchId/confirm
  Authorization: Bearer {{seeker_token}}
  ```
  *Response*:
  ```json
  {
    "success": true,
    "data": {
      "status": "completed",
      "confirmedByProvider": true,
      "confirmedBySeeker": true,
      "bothConfirmed": true,
      "completedAt": "2026-09-13T..."
    }
  }
  ```
- **Evaluator Highlight**:
  - Requires **both** participants to confirm before completion.
  - Third parties or non-participant admins are rejected with `403 Forbidden`.
  - Cascades lifecycle states: Resource &rarr; `impact_recorded`, Request &rarr; `fulfilled`.
  - Idempotent: Subsequent duplicate confirmations return HTTP 200 without duplicate contribution inserts.

---

### Step 7: Verified Impact Ledger & User Reputation
- **Actor**: Provider & Seeker
- **Action**: View completed impact history:
  ```http
  GET /api/users/me/contributions
  Authorization: Bearer {{provider_token}}
  ```
- **Evaluator Highlight**:
  - An immutable `Contribution` document is recorded.
  - Provider and seeker reputation scores increment by +10 points (`reputationScore: 120`).
  - Completed transfers counter increments by +1.

---

### Step 8: Moderation & Reports (Community Safety)
- **Actor**: Admin
- **Action 1 — View Open Reports**:
  ```http
  GET /api/reports?status=open
  Authorization: Bearer {{admin_token}}
  ```
- **Action 2 — Admin Resolves Report**:
  ```http
  PUT /api/reports/:reportId/resolve
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json

  {
    "status": "resolved",
    "resolution": "Listing verified and approved by moderation team."
  }
  ```
- **Evaluator Highlight**: Content reporting requires valid polymorphic targets; resolution notes are stored and emit a `report_resolved` notification to the reporter.

---

### Step 9: Real-Time Admin Platform Analytics (Grand Finale)
- **Actor**: Admin
- **Action**:
  ```http
  GET /api/admin/analytics
  Authorization: Bearer {{admin_token}}
  ```
- **Evaluator Highlight**:
  - **Zero "analytics" collection**: Computed live on-the-fly across collections.
  - Shows live increments from the transaction just completed on stage:
    - `summary.completedTransfers` incremented.
    - `resourcesByCategory` reflects published vs. fulfilled counts.
    - `categoryImpact` displays total distributed volume.
    - `matchAcceptance.acceptanceRate` demonstrates platform conversion.
