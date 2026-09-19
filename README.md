# DAWWARHA

DAWWARHA is a circular economy and community redistribution platform that connects resource providers, requesters, organizations, and administrators to match surplus items with verified needs.

The project includes:

- a Node.js + Express REST API backend
- a MongoDB data layer
- an Angular + Tailwind frontend
- seeded demo data for local development and demos

## Project goals

- Reduce waste by redistributing surplus resources
- Support community requests and verified organization matching
- Provide explainable match logic and handover tracking
- Surface impact and contribution history for users and admins

## Tech stack

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- express-validator

### Frontend

- Angular 19
- TypeScript
- Tailwind CSS
- RxJS
- Angular Router

## Repository structure

```text
G-19-Dawarhaa/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── angular.json
│   ├── package.json
│   ├── proxy.conf.json
│   └── tailwind.config.js
├── docs/
├── documentation/
├── DAWWARHA-DESIGN/
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7+ running locally or via MongoDB Atlas

## Quick start

### 1) Install dependencies

```bash
npm install
npm run install-backend
npm run install-frontend
```

### 2) Configure environment files

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your local settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dawwarha
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Optional frontend env file:

```bash
cp frontend/.env.example frontend/.env
```

### 3) Start the backend

From the root:

```bash
npm run dev
```

This starts the Express API on:

- http://localhost:5000

You can also run it directly from the backend folder:

```bash
cd backend
npm run dev
```

### 4) Start the frontend

In a second terminal:

```bash
cd frontend
npm start
```

The app runs on:

- http://localhost:4200

The Angular dev server is configured to proxy `/api` requests to the backend at port 5000 via `frontend/proxy.conf.json`.

## Seed data

Seed the database with demo accounts and sample data:

```bash
cd backend
npm run seed
```

Demo accounts use the password:

- `DawwarhaDemo123!`

Typical seeded roles include:

- admin
- provider
- seeker

## Useful scripts

### Root-level scripts

```bash
npm run start
npm run dev
npm run install-backend
npm run install-frontend
npm run preview
```

### Backend scripts

```bash
cd backend
npm start
npm run dev
npm run seed
npm test
npm run test:unit
npm run test:integration
```

### Frontend scripts

```bash
cd frontend
npm start
npm run build
npm run watch
npm test
```

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Run frontend validation/build checks:

```bash
cd frontend
npm run build
```

## Documentation

Related project documentation is located in:

- `docs/`
- `documentation/`
- `DAWWARHA-DESIGN/`

These include API docs, design references, demo guidance, and project audits.

## Notes

This project is structured for a multi-role community platform and is designed to support local development, demo workflows, and future feature expansion.

For setup issues, confirm:

- MongoDB is running and reachable
- backend `.env` points to the correct database URI
- both frontend and backend dependencies are installed
- the frontend dev server is started after the backend is running

---

DAWWARHA is intended as a graduation project and demo platform for circular economy coordination, community matching, and verified redistribution workflows.
