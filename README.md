# DAWWARHA (دَوَّرها)

> **Urban Resource Redistribution & Circular Economy Platform**  
> Connects resource providers, community seekers, verified organizations, and administrators to match surplus items with verified community needs.

[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%7C%2022.x-339933?logo=nodedotjs)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-19.2-DD0031?logo=angular)](https://angular.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Hostinger-Production%20Ready-673AB7)](DEPLOYMENT.md)

---

## Table of Contents

- [Overview & Core Features](#overview--core-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Build](#production-build)
- [Hostinger Deployment](#hostinger-deployment)
- [Environment Configuration Matrix](#environment-configuration-matrix)
- [Related Documentation](#related-documentation)

---

## Overview & Core Features

- **Surplus Resource Listing:** Providers publish surplus items (food, clothing, equipment, furniture, books) with location and availability windows.
- **Needs Matching:** Community members and verified organizations request specific resources.
- **Smart Matching Engine:** Algorithmic matching between open requests and available resources based on categories and location.
- **Two-Sided Handover Verification:** Multi-document atomic transactions guaranteeing handover completion only when confirmed by both provider and seeker.
- **Reputation & Impact Tracking:** Real-time statistics tracking contributions, impact metrics, and user trust scores.
- **Organization Verification:** Multi-stage administrative review workflows for non-profit and community entities.
- **Bilingual Support & Accessibility:** Full Arabic (RTL) and English (LTR) interface compliant with WCAG accessibility guidelines.

---

## Tech Stack

### Frontend
- **Framework:** [Angular 19.2](https://angular.dev/) (Standalone Components, Signals)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Design System
- **Icons:** [Lucide Angular](https://lucide.dev/)
- **State & Reactive:** RxJS 7.8, Angular Signals
- **Testing:** [Vitest 5.0](https://vitest.dev/) + Node.js Test Runner
- **SPA Web Server:** Apache / LiteSpeed with `.htaccess` (Gzip, caching, SPA rewrites)

### Backend
- **Runtime:** [Node.js 20+ LTS](https://nodejs.org/) (ES Modules, `"type": "module"`)
- **Web Framework:** [Express 5.2](https://expressjs.com/)
- **Database / ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose 9.10](https://mongoosejs.com/) (ACID Transactions)
- **Authentication:** JWT (JSON Web Tokens) with HTTP Bearer authorization
- **Security:** `bcrypt` hashing, `express-validator`, environment-scoped CORS, error shielding
- **Testing:** Node.js native test runner (`node --test`), in-memory MongoDB server

---

## Repository Structure

```text
G-19-Dawarhaa/
├── backend/                  # Node.js / Express API service
│   ├── src/                  # Application source code
│   │   ├── config/           # Database and environment configurations
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth, error handling, validation middleware
│   │   ├── models/           # Mongoose schemas & data models
│   │   ├── routes/           # Express API route declarations
│   │   ├── services/         # Core business logic (matching, handovers)
│   │   └── utils/            # Shared utilities and helpers
│   ├── tests/                # Unit and integration test suites
│   │   ├── unit/             # Fast isolated unit tests (339 tests)
│   │   └── integration/      # MongoDB Atlas contract & lifecycle tests
│   ├── .env.example          # Backend environment template
│   ├── package.json          # Backend dependencies & npm scripts
│   └── server.js             # Production entry point with graceful shutdown
├── frontend/                 # Angular 19 client application
│   ├── src/                  # Angular source code
│   │   ├── app/              # Core, feature, and shared components
│   │   ├── environments/     # Development & production environment configurations
│   │   └── index.html        # HTML5 entrypoint with SEO & font preconnects
│   ├── public/               # Static assets & web configuration
│   │   ├── .htaccess         # Apache/LiteSpeed SPA rewrite & caching rules
│   │   └── assets/           # Logos, branding identity, and icons
│   ├── angular.json          # Angular CLI workspace configuration
│   ├── package.json          # Frontend dependencies & npm scripts
│   ├── proxy.conf.json       # Dev proxy routing /api -> http://localhost:5000
│   └── tailwind.config.js    # Tailwind theme configuration
├── release/                  # Production release package for Hostinger
│   ├── frontend/             # Compiled browser bundle with .htaccess
│   ├── backend/              # Clean backend files (no node_modules, no .env)
│   └── DEPLOYMENT.md         # Deployment manual copy
├── docs/                     # Additional project specifications
├── DEPLOYMENT.md             # Complete Hostinger production deployment manual
├── RELEASE_BUILD_REPORT.md   # Production readiness & build validation report
├── package.json              # Root-level helper scripts
├── .gitignore                # Git exclusions (dependencies, env, build outputs)
└── README.md                 # Project documentation
```

---

## Prerequisites

- **Node.js:** `20.x` or `22.x` LTS
- **npm:** `10.x` or higher
- **MongoDB:** MongoDB Atlas cluster or local MongoDB instance (v7.0+)

---

## Local Development Setup

### 1. Install Dependencies

Install root, backend, and frontend dependencies:

```bash
npm install
npm run install-backend
npm run install-frontend
```

### 2. Configure Environment Files

Create the local backend environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dawwarha
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
NODE_ENV=development
```

*(Optional) Create local frontend environment reference:*
```bash
cp frontend/.env.example frontend/.env
```

### 3. Seed Demo Data (Optional)

Populate the database with sample users, organizations, categories, and resources:

```bash
npm run seed:test-users
# Or run complete sample seeder:
npm --prefix backend run seed
```

*Default demo credentials:* Password is `DawwarhaDemo123!` for seeded accounts.

### 4. Start Development Servers

Run backend and frontend concurrently:

**Terminal 1 — Backend API:**
```bash
npm run dev
# Running on http://localhost:5000 (Health check: http://localhost:5000/health)
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm start
# Running on http://localhost:4200 (Proxying /api calls to backend automatically)
```

---

## Testing & Quality Assurance

### Frontend Testing (259 Tests)
```bash
cd frontend

# Run TypeScript type check (zero errors required)
npx tsc --noEmit

# Run unit tests (Vitest) and component specification suites
npm test
```

### Backend Testing (344+ Tests)
```bash
cd backend

# Run fast isolated unit tests (339 tests in ~4s)
npm run test:unit

# Run full cross-domain integration tests against MongoDB
npm run test:integration

# Run all test suites
npm test
```

---

## Production Build

### Compiling the Angular Frontend
```bash
cd frontend
npm run build
```
- **Output Directory:** `frontend/dist/dawwarha-frontend/browser`
- **Verification:** Verified that **0 references to `localhost` or `127.0.0.1`** exist in the compiled bundle.
- **Includes:** Optimized scripts, minified CSS, assets, and `.htaccess` for Apache/LiteSpeed web servers.

### Pre-Packaged Release Artifacts
A clean, production-ready release package is pre-assembled in the `release/` directory:
- `release/frontend/`: Ready for direct upload to Hostinger `public_html/`.
- `release/backend/`: Clean backend production files (excluding `node_modules/` and local `.env`).

---

## Hostinger Deployment

The platform is designed and optimized for production deployment on **Hostinger** (both hPanel Web/Cloud Hosting and Hostinger VPS).

For detailed, step-by-step deployment instructions, refer to:
👉 **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deployment Summary:
1. **Frontend:** Upload all files from `release/frontend/` directly into Hostinger's `public_html/`. Ensure `.htaccess` is uploaded for SPA client-side routing.
2. **Backend:** Deploy `release/backend/` using Hostinger's **hPanel Node.js Application Manager** (or PM2 on a VPS). Set entry point to `server.js`.
3. **Environment Variables:** Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL` in Hostinger hPanel.
4. **Database:** Whitelist Hostinger's IP address (or `0.0.0.0/0`) in your MongoDB Atlas Network Access.

For audit status, test results, and bundle metrics, see **[RELEASE_BUILD_REPORT.md](RELEASE_BUILD_REPORT.md)**.

---

## Environment Configuration Matrix

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | HTTP port Express listens on | `5000` |
| `NODE_ENV` | Backend | Runtime environment (`development` \| `production`) | `production` |
| `MONGODB_URI` | Backend | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dawwarha` |
| `JWT_SECRET` | Backend | Secret key used to sign JWTs (min 32 characters) | `64_character_cryptographic_secret` |
| `JWT_EXPIRES_IN` | Backend | Expiration duration for user sessions | `7d` |
| `CLIENT_URL` | Backend | Allowed CORS origin(s), comma-separated | `https://dawwarha.com,https://www.dawwarha.com` |
| `apiUrl` | Frontend | Base path for API requests (in `environment.production.ts`) | `/api` (or `https://api.dawwarha.com/api`) |

---

## Related Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Comprehensive Hostinger production deployment manual.
- **[RELEASE_BUILD_REPORT.md](RELEASE_BUILD_REPORT.md)** — Production audit, test verification, and bundle report.
- **`docs/`** — Technical specifications, architecture blueprints, and API contracts.
- **`DAWWARHA-DESIGN/`** — UI design system tokens, color palettes, and component guidelines.

---

## License & Attribution

DAWWARHA is developed as a graduation project demonstrating urban resource redistribution, community mutual-aid matching, and verified circular economy workflows.
