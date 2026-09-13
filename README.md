# DAWWARHA (دَوَّرها) &mdash; Backend Platform

> **Graduation Project** | NTI MEAN Stack Track  
> **Platform Mission**: A community surplus redistribution and circular economy platform connecting donors, community organizations, and beneficiaries through explainable matching, transparent handover tracking, and verified social impact.

---

## 1. Project Overview

DAWWARHA provides a robust, multi-tenant backend built on Node.js, Express, and MongoDB. The system enforces strict domain boundaries across four engineering roles to deliver an end-to-end circular economy workflow:

```text
Resource (Supply) ───► Request (Demand) ───► Algorithmic Match ───► Atomic Acceptance
                                                                           │
                                                                           ▼
Contribution & Stats ◄─── Completed Transfer ◄─── Two-Sided Handover (Provider & Seeker)
```

### Domain Architecture & Engineering Ownership
- **Engineer 1 &mdash; Identity & Organizations**: User registration, JWT authentication, RBAC authorization, user profile management, organization onboarding & admin verification, user suspension.
- **Engineer 2 &mdash; Categories & Resources (Supply)**: Taxonomy category catalog, surplus resource listings, query filtering with NoSQL injection protection, resource lifecycle state-machine.
- **Engineer 3 &mdash; Requests & Matching (Demand)**: Community demand requests, rule-based explainable scoring engine (5 weighted factors), ranked inbox delivery, cross-domain atomic match-acceptance transaction.
- **Engineer 4 &mdash; Trust, Impact & Admin (Lead)**: Two-sided handover confirmation protocol, content moderation & polymorphic reports, user contribution ledger & reputation scores, recipient-isolated notifications, and real-time platform analytics aggregation.

---

## 2. Technology Stack

- **Runtime**: Node.js (v20+ supported; ESM Native modules)
- **Framework**: Express.js (v5)
- **Database**: MongoDB (v7+) with Mongoose (v9+)
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing, `express-validator`, NoSQL operator query sanitization.
- **Testing**: Node Native Test Runner (`node --test`), `mongodb-memory-server` for isolated replica set integration tests.

---

## 3. Directory Structure

```text
G-19-Dawarhaa/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection and environment config
│   │   ├── controllers/     # Express route handlers across all 4 domains
│   │   ├── middleware/      # Authentication, authorization, validation, error handler
│   │   ├── models/          # Mongoose schemas (10 collections)
│   │   ├── routes/          # Mounted REST API route endpoints
│   │   ├── seed/            # Safe, idempotent demo database seeder
│   │   ├── services/        # Business logic & cross-domain lifecycle services
│   │   ├── utils/           # Query builders, pagination, constants, ObjectId utils
│   │   ├── validators/      # Payload validation schemas (express-validator)
│   │   └── app.js           # Express app setup and middleware pipeline
│   ├── tests/
│   │   ├── unit/            # 16 unit test suites (331 tests)
│   │   └── integration/     # 4 integration & E2E test suites (97 tests)
│   ├── server.js            # Main HTTP server entry point
│   ├── package.json         # Scripts, dependencies, and test commands
│   └── .env.example         # Backend environment template
├── docs/
│   ├── API_DOCUMENTATION.md # Comprehensive 41-endpoint specification
│   ├── openapi.yaml         # OpenAPI 3.0.3 specification
│   ├── DEMO_GUIDE.md        # 5–7 minute graduation demo script
│   ├── FINAL_DEMO_CHECKLIST.md # Operational pre-flight checklist
│   ├── POSTMAN_WALKTHROUGH.md  # Postman verification report
│   └── postman/             # 4 domain Postman collections & runner guide
├── .env.example             # Root environment template
├── .gitignore               # Ignored files (node_modules, .env)
└── README.md                # Project documentation
```

---

## 4. Getting Started & Installation

### Prerequisites
- Node.js &ge; 20.x
- MongoDB &ge; 7.x (Local instance or MongoDB Atlas URI)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lymon/G-19-Dawarhaa.git
   cd G-19-Dawarhaa
   ```

2. **Install backend dependencies**:
   ```bash
   npm run install-backend
   # Or directly:
   cd backend && npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your MongoDB URI and secret key:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/dawwarha
   JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. **Seed the Database for Demo / Development**:
   ```bash
   cd backend && npm run seed
   ```
   *Populates the 3 core accounts (Admin, Provider, Seeker), 1 verified organization, 7 taxonomy categories, demo resources and requests, a baseline completed transfer, notifications, and an open moderation report.*

5. **Start the Application**:
   ```bash
   # Development mode with hot-reload:
   npm run dev

   # Production mode:
   npm start
   ```
   Server listens on `http://localhost:5000` (Health check: `GET /health`).

---

## 5. Running the Test Suite

The test suite uses Node's native test runner (`node --test`) and executes 428 automated tests with **zero warnings, zero skips, and 100% green status**:

```bash
cd backend

# Run the complete test suite (Unit + Integration)
npm test

# Run unit tests only (~4 seconds)
npm run test:unit

# Run integration & E2E demo tests (~48 seconds)
npm run test:integration
```

---

## 6. Pre-Seeded Accounts (Demo & Testing)

All seeded accounts use password: `DawwarhaDemo123!`

| Role | Name | Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dawwarha Admin | `admin@dawwarha.example` | `DawwarhaDemo123!` | Moderation, platform analytics, organization verification. |
| **Provider** | Demo Provider | `provider@dawwarha.example` | `DawwarhaDemo123!` | Donor; creates and publishes surplus resources. |
| **Seeker** | Demo Seeker | `user@dawwarha.example` | `DawwarhaDemo123!` | Beneficiary / Org Owner; requests supplies, accepts matches. |

See [`backend/src/seed/README.md`](./backend/src/seed/README.md) for full seed schema details.

---

## 7. Documentation & Demo Resources

- [**API Specification**](./docs/API_DOCUMENTATION.md): Complete reference for all 41 Section 14 endpoints with request bodies, status codes, and security rules.
- [**OpenAPI 3.0.3 Specification**](./docs/openapi.yaml): Standalone OpenAPI definition for Swagger UI / Redoc / Postman.
- [**Graduation Demo Guide**](./docs/DEMO_GUIDE.md): 5–7 minute script walking through the complete circular economy loop on stage.
- [**Postman Collections**](./docs/postman/README.md): 4 domain-specific collections covering all endpoints with automated token capture and validation scripts.
- [**Final Demo Checklist**](./docs/FINAL_DEMO_CHECKLIST.md): Operational pre-flight checklist for evaluation day.
