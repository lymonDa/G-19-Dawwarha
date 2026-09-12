# DAWWARHA API Reference — Resource Management

## `DELETE /api/resources/:id` — Owner or Admin Cancellation

> ⚠️ **CRITICAL ARCHITECTURAL CONTRACT: SOFT CANCELLATION (NOT A HARD DELETE)**
>
> This endpoint **DOES NOT HARD-DELETE** the resource document from MongoDB.
> Do **NOT** expect an `HTTP 204 No Content` with the database record removed.
>
> The endpoint internally invokes the centralized resource state machine (`resourceLifecycleService.transitionResource`) with `action = "cancel"`.
> The resource document remains permanently in MongoDB with:
> ```json
> { "status": "cancelled" }
> ```

---

### 1. Endpoint Specification

| Attribute | Details |
| :--- | :--- |
| **Method** | `DELETE` |
| **Path** | `/api/resources/:id` |
| **Authentication** | **Required** (`Bearer <JWT_TOKEN>`) |
| **Authorization** | **Resource Owner** (`req.resource.providerId === req.user._id`) **OR Platform Admin** (`req.user.role === 'admin'`) |
| **Idempotency / Terminal States** | Resources in `completed`, `impact_recorded`, or `cancelled` status cannot be cancelled again (`HTTP 409 Conflict`). |

---

### 2. Request Headers & Parameters

#### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### URL Parameters
| Parameter | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `id` | `ObjectId` (Hex 24) | Yes | The MongoDB ObjectId of the resource to cancel. |

---

### 3. State Machine & Execution Flow

```text
HTTP DELETE /api/resources/:id
               ↓
[1. Authentication Middleware]
  - Missing/invalid Bearer token → 401 UNAUTHORIZED
               ↓
[2. Resource ID Validator]
  - Malformed ObjectId format → 400 INVALID_ID
               ↓
[3. Resource Lookup (loadResource)]
  - Resource not found in MongoDB → 404 NOT_FOUND
               ↓
[4. Ownership Authorization (requireOwnership)]
  - Admin bypasses check
  - Non-owner regular user → 403 FORBIDDEN
               ↓
[5. Transition Service (resourceLifecycleService.transitionResource)]
  - Current status in terminal states ('completed', 'impact_recorded', 'cancelled') → 409 INVALID_TRANSITION
  - Active/valid status ('draft', 'published', 'available', 'matched', 'accepted', 'in_handover', 'unavailable')
    → Action: 'cancel'
    → status updated to 'cancelled'
    → resource.save()
               ↓
[6. Response]
  - HTTP 200 OK with cancelled resource payload
```

---

### 4. Example Responses

#### Successful Cancellation (`200 OK`)
```json
{
  "success": true,
  "message": "Resource cancelled successfully",
  "data": {
    "_id": "660000000000000000000010",
    "providerId": "660000000000000000000001",
    "categoryId": "660000000000000000000005",
    "title": "Industrial Surplus Wood Pallets",
    "description": "50 clean wooden pallets available for repurposing",
    "quantity": 50,
    "location": {
      "city": "Amman",
      "area": "Al-Bayader"
    },
    "availabilityWindow": {
      "start": "2026-10-01T08:00:00.000Z",
      "end": "2026-10-31T18:00:00.000Z"
    },
    "status": "cancelled",
    "createdAt": "2026-09-12T10:00:00.000Z",
    "updatedAt": "2026-09-12T16:30:00.000Z"
  }
}
```

#### Unauthorized — Missing Token (`401 Unauthorized`)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

#### Forbidden — Non-Owner (`403 Forbidden`)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to do that."
  }
}
```

#### Resource Not Found (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found."
  }
}
```

#### Conflict — Already Cancelled / Terminal State (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "Cannot transition resource in terminal state: 'cancelled'."
  }
}
```

#### Bad Request — Malformed ObjectId (`400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid resource ID format"
  }
}
```
