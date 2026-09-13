# Implementation Plan — PHASE 6: Testing & Bug Fixing

This plan outlines the execution of **Phase 6 — Testing & Bug Fixing** for the DAWWARHA backend, transitioning the system from Phase 5 completion into a stable, regression-tested, and fully verified state ready for Phase 7 (Documentation & Demo Prep).

---

## User Review Required

> [!IMPORTANT]
> The current test suite is already in an exceptional state with **427 passing tests (330 unit + 97 integration)** across 88 test suites with 0 failures and 0 skips.
> During our exhaustive audit of the codebase, test suites, and Section 14 specifications, we identified three specific refinements to achieve 100% Phase 6 exit criteria:
> 1. Eliminate Mongoose v9 deprecation warnings (`new: true` vs `returnDocument: 'after'`).
> 2. Complete Postman collection coverage by adding `PUT /api/requests/:id/status` to `docs/postman/DAWWARHA_Demand_and_Matching_API_Postman_Collection.json`.
> 3. Track and solidify `backend/tests/integration/section14.matrix.test.js` and add dedicated unit regression tests for `match_accepted` notification trigger.

---

## Proposed Changes

### 1. Fix Mongoose 9 Deprecation Warnings

Mongoose 9 deprecates `{ new: true }` in `findOneAndUpdate` and `findByIdAndUpdate` in favor of `{ returnDocument: 'after' }`.

#### [MODIFY] [backend/src/controllers/users.controller.js](file:///home/lymon/G-19-Dawarhaa/backend/src/controllers/users.controller.js)
- Update line 12: change `{ new: true, runValidators: true }` to `{ returnDocument: "after", runValidators: true }`.

#### [MODIFY] [backend/src/controllers/admin.controller.js](file:///home/lymon/G-19-Dawarhaa/backend/src/controllers/admin.controller.js)
- Update line 17: change `{ new: true }` to `{ returnDocument: "after" }`.

#### [MODIFY] [backend/src/controllers/organizations.controller.js](file:///home/lymon/G-19-Dawarhaa/backend/src/controllers/organizations.controller.js)
- Update line 29: change `{ new: true, runValidators: true }` to `{ returnDocument: "after", runValidators: true }`.

#### [MODIFY] [backend/src/services/contributionService.js](file:///home/lymon/G-19-Dawarhaa/backend/src/services/contributionService.js)
- Update line 207: change `{ new: true }` to `{ returnDocument: "after" }`.

#### [MODIFY] [backend/src/seed/seed.js](file:///home/lymon/G-19-Dawarhaa/backend/src/seed/seed.js)
- Update all occurrences of `{ upsert: true, new: true, setDefaultsOnInsert: true }` to use `returnDocument: "after"`.

---

### 2. Complete Postman Documentation

#### [MODIFY] [docs/postman/DAWWARHA_Demand_and_Matching_API_Postman_Collection.json](file:///home/lymon/G-19-Dawarhaa/docs/postman/DAWWARHA_Demand_and_Matching_API_Postman_Collection.json)
- Add missing Section 14 endpoint: `PUT {{base_url}}/api/requests/{{request_id}}/status` with `{ "action": "publish" }` and negative transition tests.

---

### 3. Track and Formalize Section 14 Verification Matrix

#### [NEW] [backend/tests/integration/section14.matrix.test.js](file:///home/lymon/G-19-Dawarhaa/backend/tests/integration/section14.matrix.test.js)
- Maintain and track the 41-endpoint matrix integration test verifying happy path, 401 unauthenticated, 403 forbidden/non-owner, 400 validation, and 404 not found across all Section 14 endpoints.

---

### 4. Unit & Regression Tests for Notification Triggers

#### [MODIFY] [backend/tests/unit/notifications.test.js](file:///home/lymon/G-19-Dawarhaa/backend/tests/unit/notifications.test.js)
- Add explicit unit test asserting `match_accepted` notification creation and payload structure.

---

## Verification Plan

### Automated Tests
1. Run Unit Tests:
   ```bash
   cd backend && npm run test:unit
   ```
   Verify 330+ passing tests, 0 deprecation warnings, 0 failures.

2. Run Integration Tests:
   ```bash
   cd backend && npm run test:integration
   ```
   Verify 97+ passing tests, including all 41 Section 14 endpoints in `section14.matrix.test.js`, full Section 21 E2E demo journey in `e2e.demo.test.js`, and QA suite in `preDemo.qa.test.js`.

3. Run Full Test Suite:
   ```bash
   cd backend && npm test
   ```
   Verify 100% GREEN, 0 skips, 0 timeouts, 0 warnings.

### Verification Matrix
- Build and present the comprehensive Section 14 41-endpoint verification matrix in the Phase 6 walkthrough report.
