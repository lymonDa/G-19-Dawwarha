# DAWWARHA (دَوَّرها) &mdash; Circular Economy & Community Redistribution Platform

> **Graduation Project** | NTI MEAN Stack Track  
> **Platform Mission**: A community surplus redistribution and circular economy platform connecting donors, community organizations, and beneficiaries through explainable matching, transparent handover tracking, and verified social impact.

---

## 1. Project Overview

**DAWWARHA (دَوَّرها)** is an end-to-end MEAN stack platform comprising a high-performance **Node.js/Express/MongoDB** REST API backend and a modern **Angular 19 + Tailwind CSS** single-page application (SPA) frontend.

The platform coordinates an end-to-end circular economy lifecycle across four engineering domains:

```text
Resource (Supply) ───► Request (Demand) ───► Explainable Match (5-Signal) ───► Atomic Acceptance
                                                                                       │
                                                                                       ▼
Contribution & Stats ◄─── Completed Transfer ◄─── Two-Sided Handover (Provider & Seeker)
```

### Domain Architecture & Engineering Ownership

The platform is structured into four clearly separated engineering domains across both backend services and frontend feature modules:

| Domain | Scope & Responsibilities | Core Models / Features |
| :--- | :--- | :--- |
| **Engineer 1 &mdash; Shared Foundation & Identity** | User registration, JWT authentication, RBAC authorization, user profile management, organization onboarding & admin verification, user suspension, UI primitive components (`Button`, `Input`, `Dialog`, `Toast`, etc.), design tokens, and core guards/interceptors. | `User`, `Organization`, `AuthService`, Primitive UI |
| **Engineer 2 &mdash; Categories & Resources (Supply)** | Taxonomy category catalog, surplus resource publishing and lifecycle state-machine (`AVAILABLE`, `MATCHED`, `IN_TRANSFER`, `COMPLETED`, `EXPIRED`, `CANCELLED`), category navigation, and provider inventory views. | `Category`, `Resource`, `ResourceCard`, Supply Feature |
| **Engineer 3 &mdash; Requests & Matching (Demand)** | Community demand requests, rule-based explainable matching engine (5 weighted scoring signals: category, urgency, location, capacity, timing), ranked inbox, atomic match acceptance transaction. | `Request`, `Match`, `MatchScore`, `MatchCard`, Demand Feature |
| **Engineer 4 &mdash; Trust, Impact & Admin (Lead)** | Two-sided handover confirmation protocol (`PENDING_CONFIRMATION` &rarr; `CONFIRMED`), content moderation & polymorphic reports, user contribution ledger, reputation scores, recipient-isolated notifications, and real-time platform analytics aggregation. | `Handover`, `Contribution`, `Report`, `Notification`, Admin Feature |

---

## 2. Technology Stack

### Frontend (Angular SPA)
- **Framework**: Angular 19 (`@angular/core` 19.2+) with standalone components (no `NgModule` boilerplate)
- **Language**: TypeScript 5.7+ in strict mode (`"strict": true`)
- **Styling**: Tailwind CSS v3 with PostCSS and Autoprefixer, configured with design tokens from `DAWWARHA-DESIGN-SYSTEM.md`
- **Reactivity & State**: Angular Signals for local/UI state & RxJS for HTTP streams and router events
- **Routing & Navigation**: Angular Router with route-level lazy loading (`loadComponent`/`loadChildren`)
- **HTTP & Security**: Angular `HttpClient` with functional interceptors (`authInterceptor`, `errorInterceptor`) and functional guards (`authGuard`, `roleGuard`, `orgVerifiedGuard`)
- **Forms**: Angular Reactive Forms with strong validation
- **Icons**: Lucide Icons via `lucide-angular`

### Backend (REST API)
- **Runtime**: Node.js (v20+ supported; ESM Native modules)
- **Framework**: Express.js (v5)
- **Database**: MongoDB (v7+) with Mongoose (v9+)
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing, `express-validator`, NoSQL operator query sanitization
- **Testing**: Node Native Test Runner (`node --test`), `mongodb-memory-server` for isolated replica set integration tests

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
│   ├── package.json         # Backend dependencies and test scripts
│   └── .env.example         # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Singleton services, guards, interceptors, models, config
│   │   │   │   ├── auth/         # AuthService and session contracts
│   │   │   │   ├── config/       # Application configuration & provider setup
│   │   │   │   ├── guards/       # Functional guards (auth, role, org-verified)
│   │   │   │   ├── interceptors/ # Functional interceptors (JWT auth, error handler)
│   │   │   │   ├── models/       # Shared domain TypeScript contracts
│   │   │   │   └── services/     # Toast and API base client services
│   │   │   ├── shared/      # Reusable primitives, domain components, pipes, directives
│   │   │   │   ├── ui/           # 24 headless/styled primitives (button, input, dialog, etc.)
│   │   │   │   ├── components/   # 13 domain composites (ResourceCard, MatchScore, etc.)
│   │   │   │   ├── directives/   # Shared UI directives
│   │   │   │   ├── pipes/        # Shared presentation pipes
│   │   │   │   └── utils/        # Frontend utility functions
│   │   │   ├── layout/      # AppShell layouts (public, app, admin)
│   │   │   └── features/    # 12 domain feature routes (lazy-loaded)
│   │   ├── design-tokens/   # Tailwind tokens shared with TypeScript constants
│   │   ├── environments/    # Environment configurations (development & production)
│   │   ├── index.html       # HTML entry point with accessibility attributes
│   │   ├── main.ts          # Angular standalone bootstrap entry
│   │   └── styles.css       # Tailwind base, components, and utilities
│   ├── angular.json         # Angular workspace and build configuration
│   ├── tailwind.config.js   # Tailwind theme and content scanning
│   ├── proxy.conf.json      # Dev proxy forwarding /api to backend port 5000
│   ├── tsconfig.json        # Strict TypeScript compiler options
│   └── package.json         # Frontend dependencies and scripts
│
├── docs/                    # Technical documentation and specifications
│   ├── API_DOCUMENTATION.md # Comprehensive 41-endpoint specification
│   ├── openapi.yaml         # OpenAPI 3.0.3 specification
│   ├── DEMO_GUIDE.md        # 5–7 minute graduation demo script
│   ├── FINAL_DEMO_CHECKLIST.md # Operational pre-flight checklist
│   ├── POSTMAN_WALKTHROUGH.md  # Postman verification report
│   └── postman/             # 4 domain Postman collections & runner guide
│
├── documentation/           # Project architectural plans and design specifications
│   ├── DAWWARHA-DESIGN-SYSTEM.md           # Authoritative UI/UX design system & tokens
│   ├── DESIGN.md                          # Design principles and component contracts
│   └── Dawwarha-Frontend-Implementation-Plan.pdf # 54-page Angular implementation guide
│
├── .gitignore               # Root git ignore rules
└── README.md                # Main repository documentation
```

---

## 4. Getting Started & Installation

### Prerequisites
- **Node.js**: &ge; 20.x (Recommended: Node 20 or Node 24 LTS)
- **npm**: &ge; 10.x
- **MongoDB**: &ge; 7.x (Local instance or MongoDB Atlas cluster URI)

---

### Step-by-Step Setup

#### 1. Clone the repository
```bash
git clone https://github.com/lymon/G-19-Dawarhaa.git
cd G-19-Dawarhaa
```

#### 2. Backend Setup
```bash
# Install backend dependencies
npm run install-backend

# Configure environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MongoDB connection string and secret:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dawwarha
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Seed the database with baseline accounts and demonstration data:
```bash
cd backend && npm run seed
```

Start the backend API:
```bash
# Development mode with live restart:
npm run dev

# Or from the backend directory:
cd backend && npm run dev
```
Backend API will listen on `http://localhost:5000` (Health check: `GET http://localhost:5000/health`).

---

#### 3. Frontend Setup
```bash
# Install frontend dependencies
npm run install-frontend

# Or directly:
cd frontend && npm install
```

Start the Angular development server:
```bash
cd frontend && npm start
```
The application will be served at `http://localhost:4200/`. API requests sent to `/api` are automatically proxied to `http://localhost:5000` via [frontend/proxy.conf.json](file:///home/lymon/G-19-Dawarhaa/frontend/proxy.conf.json).

To verify the production build:
```bash
cd frontend && npm run build
```

---

## 5. Testing & Verification

### Backend Automated Tests
The backend test suite runs with Node's native test runner (`node --test`) using in-memory MongoDB replica sets:

```bash
cd backend

# Run the complete test suite (Unit + Integration: 428 passing tests)
npm test

# Run unit tests only
npm run test:unit

# Run integration & E2E lifecycle tests
npm run test:integration
```

### Frontend Build Validation
```bash
cd frontend

# Production build (esbuild application builder)
npm run build

# Development build with source maps
npm run watch
```

---

## 6. Pre-Seeded Accounts (Demo & Development)

All seeded test accounts use the password: `DawwarhaDemo123!`

| Role | Name | Email | Password | Primary Platform Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dawwarha Admin | `admin@dawwarha.example` | `DawwarhaDemo123!` | Moderation reports resolution, platform analytics, organization verification. |
| **Provider** | Demo Provider | `provider@dawwarha.example` | `DawwarhaDemo123!` | Donating surplus resources, scheduling handovers. |
| **Seeker** | Demo Seeker | `user@dawwarha.example` | `DawwarhaDemo123!` | Requesting needed supplies, reviewing matches, accepting handovers. |

*See [`backend/src/seed/README.md`](./backend/src/seed/README.md) for complete seed schema details.*

---

## 7. Documentation & Architecture Specifications

- [**API Documentation**](./docs/API_DOCUMENTATION.md): Complete reference for all 41 backend REST endpoints with request/response schemas and status codes.
- [**OpenAPI 3.0.3 Specification**](./docs/openapi.yaml): Swagger / OpenAPI interactive definition.
- [**UI/UX Design System**](./documentation/DAWWARHA-DESIGN-SYSTEM.md): Complete design tokens, color palettes, spacing, typography, and component specs.
- [**Design Architecture Guide**](./documentation/DESIGN.md): Frontend design principles, primitive vs. domain component contracts.
- [**Frontend Implementation Plan**](./documentation/Dawwarha-Frontend-Implementation-Plan.pdf): Comprehensive 54-page execution roadmap for the 4 engineering roles.
- [**Graduation Demo Guide**](./docs/DEMO_GUIDE.md): 5–7 minute script demonstrating the circular economy loop end-to-end.
- [**Postman Collections**](./docs/postman/README.md): Postman collections with automated token capture for all 4 domains.
- [**Final Demo Checklist**](./docs/FINAL_DEMO_CHECKLIST.md): Operational pre-flight checklist.
