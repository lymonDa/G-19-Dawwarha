# DAWWARHA — Seed Data & Pre-Seeded Accounts

This document details the pre-seeded accounts and database entities produced by `npm run seed` (`backend/src/seed/seed.js`), designed to support the **5–7 minute graduation demo narrative** (Backend Implementation Plan Section 28 & Product Brief Section 37).

---

## 1. Pre-Seeded Accounts & Credentials

All seeded accounts share the standard, non-production demonstration password.

| Account Type | Role | Name | Email | Password | Pre-seeded State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | Dawwarha Admin | `admin@dawwarha.example` | `DawwarhaDemo123!` | System admin with full permissions to verify orgs, manage categories, moderate reports, and view platform analytics. |
| **Demo Provider (Donor)** | `user` | Demo Provider | `provider@dawwarha.example` | `DawwarhaDemo123!` | 1 completed transfer, 110 reputation score, 1 active surplus bread listing, background catalog items. |
| **Demo Seeker (Beneficiary)** | `user` | Demo Seeker | `user@dawwarha.example` | `DawwarhaDemo123!` | Owner of verified community organization, 1 completed transfer, 1 active bread request, 1 pending match, 1 open report. |

> [!NOTE]
> All passwords are hashed using `bcrypt` (10 rounds). When testing via Postman or the web frontend, use `email` and `password` to obtain JWT Bearer tokens via `POST /api/auth/login`.

---

## 2. Seeded Database Entities

Executing `npm run seed` performs safe, idempotent upserts (`findOneAndUpdate` with `$setOnInsert`):

### A. Organizations
- **Name**: `Dawwarha Demo Organization`
- **Owner**: Demo Seeker (`user@dawwarha.example`)
- **Verification Status**: `approved` (reviewed and approved by Admin)
- **Contact**: King Hussein St, Amman, Jordan

### B. Categories (7 Core Taxonomy Items)
1. `food-produce` &mdash; Food & Produce
2. `books-media` &mdash; Books & Media
3. `furniture` &mdash; Furniture
4. `clothing-textiles` &mdash; Clothing & Textiles
5. `school-supplies` &mdash; School Supplies
6. `office-equipment` &mdash; Office Equipment
7. `other` &mdash; Other

### C. Live Demo Matching Pair (Proposed Match)
- **Resource**: `Demo Surplus Bread` (Quantity: 20, Provider: Demo Provider, Category: Food & Produce, City: Amman, Area: Abdali, Status: `available`)
- **Request**: `Community Bread Assistance Need` (Quantity: 10, Requester: Demo Seeker, Urgency: `high`, Category: Food & Produce, City: Amman, Area: Abdali, Status: `published`)
- **Match**: Proposed match connecting the above with high compatibility score (`0.95` / 95%) ready for live acceptance.

### D. Historical Completed Transfer (Non-Zero Analytics on First Load)
- **Resource**: `Winter Relief Blankets` (Status: `impact_recorded`)
- **Request**: `Shelter Winter Warmth Supplies Need` (Status: `fulfilled`)
- **Match**: `accepted`
- **Handover**: `completed` (both provider and seeker confirmed)
- **Contribution**: Recorded with type `transfer_completed` (Quantity: 25 items)

### E. Background Catalog Items (Realistic Browse Experience)
- **Resource**: `Ergonomic Office Desks` (Status: `available`, Category: Furniture)
- **Request**: `Study Desks for Community Education` (Status: `published`, Category: Furniture)
- **Resource**: `Children Educational Book Collection` (Status: `available`, Category: Books & Media)
- **Request**: `Books for After-School Literacy Program` (Status: `published`, Category: Books & Media)

### F. Moderation Reports
- **Report**: Open moderation report against demo resource (`status: "open"`, reason: `"other"`), allowing immediate demonstration of admin moderation and report resolution.

### G. Notifications
- Seeker: `org_verification_decided` (read)
- Seeker: `match_created` (unread, alerting to proposed bread match)

---

## 3. Seed Execution & Safety

```bash
# Run seed script
npm run seed
```

- **Production Guard**: The script explicitly checks `if (process.env.NODE_ENV === "production") throw new Error(...)` and refuses to execute in production.
- **Idempotent**: Safe to run repeatedly without creating duplicates or distorting statistics.
