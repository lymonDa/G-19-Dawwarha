# DAWWARHA — Manual Resource Lifecycle Walkthrough (Postman Guide)

**Engineer 2 — Resource Management Scope**  
**Collection File**: [`docs/postman/DAWWARHA_Resource_API_Postman_Collection.json`](./DAWWARHA_Resource_API_Postman_Collection.json)

---

## Overview

This guide documents the complete 10-step manual lifecycle walkthrough for DAWWARHA resources. It verifies that:
1. **Public Reads** succeed without authentication.
2. **Authenticated Writes** require valid tokens.
3. **The Most Important Rule**: Status **CANNOT** be directly modified via `PUT /api/resources/:id`.
4. **All Transitions** pass through `resourceLifecycleService.transitionResource`.
5. **System-Only Actions** reject non-system actors.
6. **Terminal States** (`completed`, `impact_recorded`, `cancelled`, `expired`) cannot be edited (HTTP 409).
7. **DELETE is Soft-Cancellation**: Invokes `action="cancel"`, sets `status="cancelled"`, and **NEVER** deletes the document from MongoDB.

---

## Step-by-Step Walkthrough Flow

```text
Step 1: Create Resource (POST /api/resources) -> 201 Created (status: draft)
      ↓
Step 2: Read / List Resource (GET /api/resources & GET /api/resources/:id) -> 200 OK (Public)
      ↓
Step 3: Valid Lifecycle Transition (PUT /api/resources/:id/status, action: "publish") -> 200 OK (status: published)
      ↓
Step 4: Update Allowed Fields (PUT /api/resources/:id, title & quantity) -> 200 OK
      ↓
Step 5: Direct Status Mutation Attack (PUT /api/resources/:id, { status: "completed" }) -> 400 Bad Request
      ↓
Step 6: Invalid Lifecycle Transition (PUT /api/resources/:id/status, action: "complete") -> 409 Conflict
      ↓
Step 7: Ownership Authorization Rejection (PUT /api/resources/:id with non-owner) -> 403 Forbidden
      ↓
Step 8: Cancel Resource (DELETE /api/resources/:id) -> 200 OK (status: cancelled)
      ↓
Step 9: Terminal-State Edit Rejection (PUT /api/resources/:id on cancelled resource) -> 409 Conflict
      ↓
Step 10: Verify Cancelled Document Still Exists (GET /api/resources/:id) -> 200 OK (document intact)
```

---

## Detailed Request & Expected Response Specifications

### Step 1: Create Resource
* **Endpoint**: `POST /api/resources`
* **Headers**: `Authorization: Bearer {{provider_token}}`, `Content-Type: application/json`
* **Body**:
  ```json
  {
    "title": "Industrial Surplus Wood Beams",
    "description": "Clean seasoned pine beams for sustainable building.",
    "quantity": 50,
    "categoryId": "{{category_id}}",
    "location": { "city": "Amman", "area": "Shmeisani" },
    "availabilityWindow": {
      "start": "2026-10-01T08:00:00.000Z",
      "end": "2026-10-31T18:00:00.000Z"
    }
  }
  ```
* **Expected Response**: `HTTP 201 Created`
  ```json
  {
    "success": true,
    "data": {
      "_id": "660000000000000000000010",
      "status": "draft",
      "title": "Industrial Surplus Wood Beams"
    }
  }
  ```

---

### Step 2: Read & List Resources (Public)
* **Endpoints**: 
  - `GET /api/resources?city=Amman`
  - `GET /api/resources/{{resource_id}}`
* **Headers**: *None (Public)*
* **Expected Response**: `HTTP 200 OK`

---

### Step 3: Valid Lifecycle Transition
* **Endpoint**: `PUT /api/resources/{{resource_id}}/status`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Body**:
  ```json
  {
    "action": "publish"
  }
  ```
* **Expected Response**: `HTTP 200 OK`, `status = "published"`

---

### Step 4: Update Allowed Fields
* **Endpoint**: `PUT /api/resources/{{resource_id}}`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Body**:
  ```json
  {
    "title": "Updated Seasoned Pine Beams (50 units)",
    "quantity": 60
  }
  ```
* **Expected Response**: `HTTP 200 OK`, fields updated.

---

### Step 5: Direct Status Mutation Attack (The Most Important Rule)
* **Endpoint**: `PUT /api/resources/{{resource_id}}`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Body**:
  ```json
  {
    "status": "completed"
  }
  ```
* **Expected Response**: `HTTP 400 Bad Request`
  ```json
  {
    "success": false,
    "error": {
      "code": "DIRECT_STATUS_UPDATE_FORBIDDEN",
      "message": "Status cannot be updated directly. Use lifecycle transition endpoints."
    }
  }
  ```

---

### Step 6: Invalid Lifecycle Transition
* **Endpoint**: `PUT /api/resources/{{resource_id}}/status`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Body**:
  ```json
  {
    "action": "complete"
  }
  ```
* **Expected Response**: `HTTP 409 Conflict`
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TRANSITION",
      "message": "Invalid transition: published -> complete"
    }
  }
  ```

---

### Step 7: Ownership Authorization Rejection
* **Endpoint**: `PUT /api/resources/{{resource_id}}`
* **Headers**: `Authorization: Bearer {{non_owner_token}}`
* **Body**:
  ```json
  {
    "title": "Malicious Tamper Title"
  }
  ```
* **Expected Response**: `HTTP 403 Forbidden`
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "You don't have permission to do that."
    }
  }
  ```

---

### Step 8: Soft Cancellation via DELETE
* **Endpoint**: `DELETE /api/resources/{{resource_id}}`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Expected Response**: `HTTP 200 OK`
  ```json
  {
    "success": true,
    "message": "Resource cancelled successfully",
    "data": {
      "_id": "660000000000000000000010",
      "status": "cancelled"
    }
  }
  ```

---

### Step 9: Terminal-State Edit Rejection
* **Endpoint**: `PUT /api/resources/{{resource_id}}`
* **Headers**: `Authorization: Bearer {{provider_token}}`
* **Body**:
  ```json
  {
    "title": "Edit Attempt After Cancellation"
  }
  ```
* **Expected Response**: `HTTP 409 Conflict`
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_STATUS",
      "message": "This listing can no longer be edited"
    }
  }
  ```

---

### Step 10: Verify Cancelled Document Still Exists in MongoDB
* **Endpoint**: `GET /api/resources/{{resource_id}}`
* **Headers**: *None (Public)*
* **Expected Response**: `HTTP 200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "660000000000000000000010",
      "title": "Updated Seasoned Pine Beams (50 units)",
      "status": "cancelled"
    }
  }
  ```
* **Conclusion**: Proves that the DELETE endpoint performed a **soft-cancellation** via the lifecycle state machine and did **NOT** hard-delete the document from MongoDB.
