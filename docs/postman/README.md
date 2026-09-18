# DAWWARHA Postman API Collections Guide

This directory contains the authoritative, production-tested Postman collections covering all **41 endpoints** across the four engineering domains of the DAWWARHA platform.

---

## 1. Collections Inventory

| Collection File | Domain & Owning Engineer | Key Capabilities Covered |
| :--- | :--- | :--- |
| [`DAWWARHA_Identity_and_Admin_API_Postman_Collection.json`](./DAWWARHA_Identity_and_Admin_API_Postman_Collection.json) | **Identity & Admin** (Engineer 1) | User registration, login, logout, profile update, organization registration, admin organization approval, user suspension & reactivation. |
| [`DAWWARHA_Resource_API_Postman_Collection.json`](./DAWWARHA_Resource_API_Postman_Collection.json) | **Categories & Supply** (Engineer 2) | Taxonomy category CRUD, public resource catalog browsing, resource creation, lifecycle status updates (publish), soft cancellation. |
| [`DAWWARHA_Demand_and_Matching_API_Postman_Collection.json`](./DAWWARHA_Demand_and_Matching_API_Postman_Collection.json) | **Demand & Matching** (Engineer 3) | Demand request creation & status updates, explainable matching generation, ranked inbox listing, atomic match acceptance transaction, match rejection. |
| [`DAWWARHA_Trust_and_Impact_API_Postman_Collection.json`](./DAWWARHA_Trust_and_Impact_API_Postman_Collection.json) | **Trust, Impact & Admin** (Engineer 4) | Two-sided handover confirmation, moderation reports filing & resolution, user contribution ledger, platform analytics, notification inboxes. |

---

## 2. Importing into Postman

1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop the four `.json` files from `docs/postman/`.
4. The collections will appear in your left sidebar organized by domain.

---

## 3. Environment & Collection Variables

Each collection is configured with default collection variables for local development:

- `base_url`: `http://localhost:5000` (change to your deployed server URL if needed)
- `admin_token`, `provider_token`, `seeker_token`: Automatically captured by the login requests via pre-request/test scripts:
  ```js
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.token) {
      pm.collectionVariables.set("provider_token", jsonData.data.token);
  }
  ```

---

## 4. Recommended Execution Order for Full Demo

To rehearse the complete end-to-end user journey:

1. **Identity & Admin**:
   - Run `Login as Donor / Provider` &rarr; token stored.
   - Run `Login as Beneficiary / Requester` &rarr; token stored.
   - Run `Login as Admin` &rarr; token stored.
2. **Categories & Resources**:
   - `GET /api/categories` &rarr; verify active categories.
   - `POST /api/resources` &rarr; creates draft resource.
   - `PUT /api/resources/:id/status` &rarr; publishes resource (`available`).
3. **Demand & Matching**:
   - `POST /api/requests` &rarr; creates draft request.
   - `PUT /api/requests/:id/status` &rarr; publishes request (`published`).
   - `POST /api/matches/:resourceId/generate` &rarr; scores and generates proposed match.
   - `PUT /api/matches/:id/accept` &rarr; executes atomic 4-collection transaction.
4. **Trust, Impact & Admin**:
   - `POST /api/transactions/:matchId/confirm` (Provider) &rarr; `status: in_progress`.
   - `POST /api/transactions/:matchId/confirm` (Seeker) &rarr; `status: completed`.
   - `GET /api/users/me/contributions` &rarr; verifies recorded impact.
   - `GET /api/notifications` &rarr; verifies user notifications.
   - `GET /api/admin/analytics` &rarr; inspects real-time dashboard metrics.

---

## 5. Automated Execution via Newman CLI

To run the full suite from the command line:

```bash
# Install newman if needed
npm install -g newman

# Execute each collection
newman run docs/postman/DAWWARHA_Identity_and_Admin_API_Postman_Collection.json
newman run docs/postman/DAWWARHA_Resource_API_Postman_Collection.json
newman run docs/postman/DAWWARHA_Demand_and_Matching_API_Postman_Collection.json
newman run docs/postman/DAWWARHA_Trust_and_Impact_API_Postman_Collection.json
```
