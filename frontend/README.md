# DAWWARHA (دَوَّرها) &mdash; Angular Frontend

> Modern single-page application built with **Angular 19**, **TypeScript (strict)**, and **Tailwind CSS**.

---

## 1. Architecture Overview

The frontend is built according to the **Dawwarha Frontend Implementation Plan** and UI/UX design specifications in `documentation/DAWWARHA-DESIGN-SYSTEM.md` and `documentation/DESIGN.md`:

```text
src/app/
├── core/             # Singleton foundation (auth, guards, interceptors, models, app config)
├── shared/
│   ├── ui/           # 24 Headless / Styled Primitives (button, input, card, dialog, toast, etc.)
│   ├── components/   # 13 Domain Composites (ResourceCard, MatchScore, LifecycleTimeline, etc.)
│   ├── directives/   # Shared UI directives
│   ├── pipes/        # Shared formatting pipes
│   └── utils/        # UI utility helpers
├── layout/           # Page shell layouts (public, app, admin)
└── features/         # 12 Feature modules (lazy-loaded routes)
```

---

## 2. Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```
Navigates to `http://localhost:4200/`.

All calls to `/api/*` are automatically forwarded to the backend on `http://localhost:5000` through `proxy.conf.json`.

### Build for Production
```bash
npm run build
```
Build output will be saved in `dist/dawwarha-frontend/`.

---

## 3. Technology Stack & Key Packages

- **Angular**: `^19.2.0` (Standalone components, Signals, RxJS)
- **TypeScript**: `~5.7.2` (Strict mode enabled)
- **Tailwind CSS**: `^3.4.17` with PostCSS and Autoprefixer
- **Icons**: Lucide Icons via `lucide-angular`
- **Routing**: Angular Router with lazy loading
- **HTTP Client**: `@angular/common/http` with functional interceptors
- **Forms**: Reactive Forms with typed validation
