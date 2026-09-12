# DAWWARHA — Manual Resource & Categories Lifecycle Walkthrough (Postman Guide)

**Engineer 2 — Resource Management Scope**  
**Collection File**: [`docs/postman/DAWWARHA_Resource_API_Postman_Collection.json`](./DAWWARHA_Resource_API_Postman_Collection.json)

---

## Overview

This guide documents the complete manual verification walkthrough for Engineer 2 (Supply Domain) in DAWWARHA:

1. **Task 2.B — Categories API**: Public reads, admin-only writes, soft delete via `isActive = false`.
2. **Task 2.C — Shared Search/Filter Query Builder**: Parameter sanitization, injection protection, indexed queries.
3. **The 10-Step Resource Lifecycle Walkthrough**: Full lifecycle transitions, direct status mutation protection, terminal state locks, and soft cancellation via DELETE.

---

## Part 1: Categories CRUD Walkthrough (Task 2.B)

### 1. List Categories (Public)

* **Endpoint**: `GET /api/categories`
* **Access**: Public (No auth required)
* **Query Parameters**:
  * `(none)`: Returns active categories (`isActive: true`) sorted alphabetically.
  * `?isActive=false`: Returns deactivated categories.
  * `?isActive=all`: Returns all categories.
* **Expected Response**: `HTTP 200 OK`

```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "_id": "660000000000000000000001",
      "name": "Books & Educational",
      "slug": "books-educational",
      "isActive": true
    }
  ]
}
```

### 2. Create Category (Admin Only)

* **Endpoint**: `POST /api/categories`
* **Access**: Admin only (`Authorization: Bearer {{admin_token}}`)
* **Body**:

```json
{
  "name": "Recycled Metals & Hardware",
  "description": "Scrap metal, copper wiring, steel beams, fasteners."
}
```

* **Expected Response**: `HTTP 201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "660000000000000000000020",
    "name": "Recycled Metals & Hardware",
    "slug": "recycled-metals-hardware",
    "isActive": true
  }
}
```

* **Error Cases**:
  * Unauthenticated: `HTTP 401 Unauthorized`
  * Non-Admin user: `HTTP 403 Forbidden` (`"You don't have permission to do that."`)
  * Duplicate name: `HTTP 409 Conflict` (`"Category with this name already exists."`)

### 3. Update Category (Admin Only)

* **Endpoint**: `PUT /api/categories/{{category_id}}`
* **Access**: Admin only (`Authorization: Bearer {{admin_token}}`)
* **Body**:

```json
{
  "name": "Industrial Surplus Metals",
  "description": "Updated description: steel, aluminum, copper."
}
```

* **Expected Response**: `HTTP 200 OK`

### 4. Soft Delete Category (Admin Only)

* **Endpoint**: `DELETE /api/categories/{{category_id}}`
* **Access**: Admin only (`Authorization: Bearer {{admin_token}}`)
* **Behavior**: **SOFT DELETE ONLY**. Sets `isActive = false`. Never hard-deletes the document from MongoDB.
* **Expected Response**: `HTTP 200 OK`

```json
{
  "success": true,
  "message": "Category deactivated successfully",
  "data": {
    "_id": "660000000000000000000020",
    "name": "Industrial Surplus Metals",
    "isActive": false
  }
}
```

* **Invariant**: Attempting to create or update a resource with this deactivated category returns `HTTP 400 Bad Request` with `"Category not found or inactive"`.

---

## Part 2: Shared Search/Filter Query Builder (Task 2.C)

### 1. Category Filter Query

* **Endpoint**: `GET /api/resources?category={{category_id}}`
* **Expected Response**: `HTTP 200 OK` returning resources belonging strictly to `{{category_id}}`.

### 2. Location Filter Query (City & Area)

* **Endpoint**: `GET /api/resources?city=Amman&area=Shmeisani`
* **Expected Response**: `HTTP 200 OK` returning resources in Amman, Shmeisani using compound index `location.city_1_location.area_1_status_1`.

### 3. Combined Filter Query (Category + Location + Status)

* **Endpoint**: `GET /api/resources?category={{category_id}}&city=Amman&status=available`
* **Expected Response**: `HTTP 200 OK` returning resources matching all criteria combined via `AND`.

### 4. Injection Attack Rejection

* **Endpoint**: `GET /api/resources?category[$ne]=null`
* **Expected Response**: `HTTP 400 Bad Request` (`code: "INVALID_QUERY"`, `"Query parameter contains invalid operators."`).

---

## Part 3: Resource Lifecycle Walkthrough

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
  * `GET /api/resources?city=Amman`
  * `GET /api/resources/{{resource_id}}`
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
