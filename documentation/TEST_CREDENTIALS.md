# Dawwarha — Test & Demonstration Credentials

> [!CAUTION]
> **DEVELOPMENT / TEST ONLY**
> 
> The credentials documented in this file are strictly intended for local development, staging environments, automated integration tests, and presentation demonstrations. **NEVER use or deploy these credentials to production environments.**

---

## 1. Test Accounts Overview

| Account Type | Display Name | Email | Password | Backend Role | Organization Relationship | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | Dawwarha Test Admin | `admin@dawwarha.test` | `Admin@12345` | `admin` | None | N/A (Admin) |
| **Organization Account** | Dawwarha Test Organization User | `organization@dawwarha.test` | `Organization@12345` | `user` | Owner of *Dawwarha Test Organization* (`ownerUserId`) | `approved` (Pre-verified) |
| **Normal User** | Dawwarha Test User | `user@dawwarha.test` | `User@12345` | `user` | None (`null` / unassociated) | N/A (Standard User) |

---

## 2. Credentials Reference

### ADMIN
```text
Email: admin@dawwarha.test
Password: Admin@12345
```
- **Role:** `admin`
- **Permissions:** Full administrative access (user management, organization verification, moderation reports, categories, platform analytics).
- **Access Endpoints:** Can access `/api/admin/*`, all public routes, and normal user endpoints.

### ORGANIZATION
```text
Email: organization@dawwarha.test
Password: Organization@12345
```
- **Role:** `user`
- **Associated Entity:** *Dawwarha Test Organization*
- **Relationship:** `Organization.ownerUserId` links directly to this user's `_id`.
- **Verification Status:** `approved` (Reviewed and verified by Admin).
- **Access Endpoints:** Can access `/api/organizations/mine`, manage organization details via `PUT /api/organizations/:id`, and publish resources on behalf of an approved organization.

### NORMAL USER
```text
Email: user@dawwarha.test
Password: User@12345
```
- **Role:** `user`
- **Relationship:** Standard beneficiary/provider user without organization ownership.
- **Access Endpoints:** Can access normal authenticated routes (`/api/users/me`, personal resources/requests/contributions/notifications).
- **Restrictions:** Blocked with `403 Forbidden` from `/api/admin/*` endpoints. Returns `404 Not Found` from `/api/organizations/mine`.

---

## 3. Database Structure & Model Alignment

The test accounts strictly adhere to the canonical schema implemented in the Dawwarha backend:

### Users Collection (`users`)
```javascript
// Admin
{
  "_id": ObjectId("..."),
  "name": "Dawwarha Test Admin",
  "email": "admin@dawwarha.test",
  "role": "admin",
  "status": "active"
}

// Organization User
{
  "_id": ObjectId("..."),
  "name": "Dawwarha Test Organization User",
  "email": "organization@dawwarha.test",
  "role": "user",
  "status": "active"
}

// Normal User
{
  "_id": ObjectId("..."),
  "name": "Dawwarha Test User",
  "email": "user@dawwarha.test",
  "role": "user",
  "status": "active"
}
```

### Organizations Collection (`organizations`)
```javascript
// Test Organization
{
  "_id": ObjectId("..."),
  "name": "Dawwarha Test Organization",
  "description": "Test Civil Society Organization for development and verification testing.",
  "ownerUserId": ObjectId("<Organization User ID>"),
  "contactInfo": {
    "email": "contact@dawwarha.test",
    "phone": "+96265000001",
    "address": {
      "street": "123 Test Street",
      "city": "Amman",
      "state": "Amman",
      "postalCode": "11181",
      "country": "Jordan"
    }
  },
  "verification": {
    "status": "approved",
    "reviewedBy": ObjectId("<Admin User ID>"),
    "reviewedAt": ISODate("...")
  }
}
```

---

## 4. Seeding Test Accounts

To seed or refresh these accounts in your local development or test database:

```bash
# From the repository root
npm run seed:test-users

# Or directly from the backend directory
cd backend && npm run seed:test-users
```

### Idempotency
The script is completely safe to run multiple times:
- **First execution:** Creates the records if they do not already exist.
- **Subsequent executions:** Detects existing records and verifies credentials without creating duplicate documents or deleting unrelated collections.

### Production Safety Guard
The seed script will immediately abort with an error if executed when `NODE_ENV === "production"`.

---

## 5. Verifying Authentication & Authorization

To run the automated verification suite against these accounts:

```bash
cd backend && node scripts/verify-test-credentials.js
```

This tests:
1. Admin login via `POST /api/auth/login`
2. Organization login via `POST /api/auth/login`
3. Normal user login via `POST /api/auth/login`
4. Admin authorization on `GET /api/admin/users` (200 OK)
5. Organization authorization on `GET /api/organizations/mine` (200 OK, approved organization)
6. Normal user authorization on `GET /api/users/me` (200 OK)
7. Normal user rejection on `GET /api/admin/users` (403 Forbidden)
8. Normal user unassociated check on `GET /api/organizations/mine` (404 Not Found)
