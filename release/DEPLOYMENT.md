# Dawwarha (دَوَّرها) — Production Deployment Guide for Hostinger

This document provides complete, step-by-step instructions for deploying the **Dawwarha** platform to **Hostinger**.

---

## 1. Prerequisites

Before starting the deployment, verify you have the following:

- **Hostinger Account** with one of the following setups:
  - **Option A (Web / Cloud Hosting with Node.js support):** Hostinger Business Web Hosting or Cloud Hosting plan with the hPanel **Node.js** application manager.
  - **Option B (Hostinger VPS):** Ubuntu 22.04/24.04 LTS VPS with root SSH access.
- **Domain Name:** E.g., `dawwarha.com` pointed to your Hostinger nameservers / IP address.
- **Node.js Environment:** Node.js v20.x or v22.x LTS (compatible with Express 5 and Mongoose 9).
- **MongoDB Atlas Account & Cluster:**
  - Cluster tier: M0 (Free) or M10+ (Production).
  - Database user credentials with read/write access.
  - IP Access List configured (allow Hostinger IP or `0.0.0.0/0` with secure password).

---

## 2. Frontend Production Build

The Angular 19 frontend is built using standard production optimizations (ahead-of-time compilation, script/style minification, tree shaking, asset hashing, and `.htaccess` integration).

### Build Command
From the project root:
```bash
cd frontend
npm ci
npm run build
```

### Build Artifacts
The production bundle is generated at:
```text
frontend/dist/dawwarha-frontend/browser/
```
Or use the pre-packaged release files in:
```text
release/frontend/
```

### Pre-Build Verification Checklist
- **API URL:** Defined in `src/environments/environment.production.ts`.
  - Default: `/api` (for same-domain reverse-proxy deployment).
  - Custom: `https://api.yourdomain.com/api` (if backend is on a separate subdomain).
- **No Localhost:** Verified that 0 references to `localhost` or `127.0.0.1` exist in the built bundle.
- **SPA Routing Configuration:** `.htaccess` is present in the build root.

---

## 3. Backend Production Setup

The backend is built with Node.js (ES Modules, `"type": "module"`), Express 5, and Mongoose 9.

### Backend Root & Entry Point
- **Root Directory:** `backend/` (or `release/backend/`)
- **Startup File:** `server.js`
- **Start Script:** `npm start` (executes `node server.js`)

### Dependency Installation for Production
On the Hostinger server:
```bash
cd backend
npm ci --omit=dev
```
*Note: `--omit=dev` ensures test runners and in-memory databases are not installed in production.*

---

## 4. Environment Variables

Configure the following environment variables on Hostinger (via hPanel Node.js settings or `.env` in `backend/`):

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` (or assigned by Hostinger) | Port the Express HTTP server listens on |
| `NODE_ENV` | Yes | `production` | Enables production error handling & caching |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dawwarha?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | `64_character_cryptographically_secure_random_string` | Secret for signing & verifying auth tokens |
| `JWT_EXPIRES_IN` | Yes | `7d` | Lifetime of authentication tokens |
| `CLIENT_URL` | Yes | `https://dawwarha.com,https://www.dawwarha.com` | Allowed CORS origins for browser requests |

> [!CAUTION]
> Never commit `.env` containing real credentials to version control. The repository `.gitignore` automatically excludes `.env` and `.env.*`.

---

## 5. MongoDB Atlas Setup

1. **Database Access:**
   - In MongoDB Atlas, go to **Database Access** -> **Add New Database User**.
   - Select **Built-in Role** -> `readWriteAnyDatabase` or scoped to `dawwarha`.
   - Use a strong, URL-encoded password (avoid special characters like `@`, `/`, `:` in the password or URL-encode them).

2. **Network Access:**
   - In MongoDB Atlas, go to **Network Access** -> **IP Access List**.
   - Add your Hostinger server's dedicated IP address.
   - If Hostinger uses a dynamic IP pool across shared nodes, specify `0.0.0.0/0` (secured strictly by database credentials).

3. **Connection String Format:**
   ```text
   mongodb+srv://<username>:<password>@<cluster-address>.mongodb.net/dawwarha?retryWrites=true&w=majority
   ```

4. **Multi-Document Transactions:**
   - Atlas clusters (including M0 Free Tier replica sets) fully support multi-document ACID transactions utilized by Dawwarha for atomic resource matching and handover completion.

---

## 6. CORS Configuration

The backend CORS middleware automatically reads `CLIENT_URL` or `ALLOWED_ORIGINS`:
- If incoming requests originate from `https://dawwarha.com` or `https://www.dawwarha.com`, the backend reflects that origin with `Vary: Origin`.
- Non-browser requests (such as server-to-server health checks) are allowed.
- Preflight `OPTIONS` requests respond with `204 No Content`.

---

## 7. Hostinger Frontend Deployment

### Target Directory
Upload all contents of `release/frontend/` (or `frontend/dist/dawwarha-frontend/browser/`) directly into your Hostinger website root:
```text
/home/u123456789/domains/dawwarha.com/public_html/
```

### Steps via Hostinger File Manager:
1. Log in to **Hostinger hPanel**.
2. Navigate to **Websites** -> Manage -> **File Manager**.
3. Open `public_html/`.
4. Delete default placeholder files (e.g. `default.php`).
5. Upload all files from `release/frontend/`.
6. Ensure `.htaccess` is uploaded (enable **Show Hidden Files** in File Manager settings).

---

## 8. Hostinger Backend Deployment

### Option A: Hostinger hPanel Node.js Manager (Cloud / Business Hosting)

1. **Upload Backend Files:**
   - In File Manager, create a folder outside `public_html` to protect source code:
     ```text
     /home/u123456789/domains/dawwarha.com/backend/
     ```
   - Upload the contents of `release/backend/`.

2. **Configure Node.js App in hPanel:**
   - In hPanel, go to **Advanced** -> **Node.js**.
   - Click **Create Application**.
   - Fill in:
     - **Node.js Version:** `20.x` or `22.x`
     - **Application Mode:** `Production`
     - **Application Root:** `domains/dawwarha.com/backend`
     - **Application Startup File:** `server.js`
     - **Application URL:** Select your domain or subdomain (e.g., `api.dawwarha.com`).
   - Click **Create**.

3. **Install Dependencies:**
   - In the Node.js application card, click **npm install** (or connect via SSH and run `npm ci --omit=dev`).

4. **Set Environment Variables:**
   - In hPanel under **Environment Variables**, add:
     - `NODE_ENV` = `production`
     - `MONGODB_URI` = `<your_atlas_connection_string>`
     - `JWT_SECRET` = `<your_jwt_secret>`
     - `JWT_EXPIRES_IN` = `7d`
     - `CLIENT_URL` = `https://dawwarha.com,https://www.dawwarha.com`
   - Click **Restart Application**.

---

### Option B: Hostinger VPS (PM2 + Nginx)

1. **SSH Connection:**
   ```bash
   ssh root@<your-vps-ip>
   ```

2. **Install Node.js 20 LTS:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Deploy Backend:**
   ```bash
   mkdir -p /var/www/dawwarha-backend
   # Copy release/backend files to /var/www/dawwarha-backend/
   cd /var/www/dawwarha-backend
   npm ci --omit=dev
   ```

4. **Configure `.env`:**
   ```bash
   nano .env
   # Paste production environment variables
   ```

5. **Start with PM2:**
   ```bash
   pm2 start server.js --name dawwarha-api -i max
   pm2 save
   pm2 startup
   ```

6. **Deploy Frontend & Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name dawwarha.com www.dawwarha.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name dawwarha.com www.dawwarha.com;

       root /var/www/dawwarha-frontend;
       index index.html;

       # SPA routing fallback
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Reverse proxy for API calls
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Health check proxy
       location /health {
           proxy_pass http://127.0.0.1:5000/health;
       }

       # Hashed static assets caching
       location ~* \.(?:css|js|woff2?|svg|png|jpg|ico)$ {
           expires 1y;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }
   }
   ```

---

## 9. Domain Configuration

- **Apex Domain:** `dawwarha.com` -> Points to Hostinger web root (`public_html/`).
- **Subdomain Option (if API hosted separately):**
  - Create `api.dawwarha.com` in Hostinger DNS pointing to the backend Node.js application.
  - Update `environment.production.ts`: `apiUrl: 'https://api.dawwarha.com/api'`.
- **Same-Domain Option (recommended for shared hosting):**
  - Both frontend and backend share `dawwarha.com`.
  - Frontend `environment.production.ts` uses `apiUrl: '/api'`.

---

## 10. HTTPS / SSL Setup

Hostinger provides free Let's Encrypt SSL certificates:
1. In hPanel, go to **Security** -> **SSL**.
2. Select your domain (`dawwarha.com` and `*.dawwarha.com`).
3. Click **Install SSL**.
4. Enable **Force HTTPS** toggle in hPanel.

---

## 11. SPA Routing Verification

Because Angular is a Single Page Application, direct browser hits on nested URLs (`/login`, `/register`, `/dashboard`, `/matches`, `/profile`) must not trigger a 404 from Apache/LiteSpeed.

The included `.htaccess` file handles this automatically:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
```

**Verification:**
Open `https://dawwarha.com/login` and press `Ctrl+F5` (hard refresh). The login page must reload correctly with HTTP 200 without showing an Apache 404 error page.

---

## 12. Production Smoke Testing

Execute these tests immediately after deployment:

### Backend Tests
```bash
# 1. Health check
curl -i https://<your-backend-domain>/health
# Expected: HTTP 200 {"success":true,"data":{"status":"ok"}}

# 2. Public categories endpoint
curl -i https://<your-backend-domain>/api/categories
# Expected: HTTP 200 with list of active categories

# 3. CORS Preflight
curl -i -X OPTIONS https://<your-backend-domain>/api/requests \
  -H "Origin: https://dawwarha.com" \
  -H "Access-Control-Request-Method: GET"
# Expected: HTTP 204 No Content with Access-Control-Allow-Origin header
```

### Frontend Tests
1. **Initial Load:** Navigate to `https://dawwarha.com`. Check browser DevTools console (F12) for any 404s or uncaught errors.
2. **Authentication Flow:**
   - Navigate to `/register` -> Create a test user.
   - Verify redirect to `/dashboard` upon successful registration.
   - Log out -> Navigate to `/login` -> Sign back in.
   - Verify JWT token is stored in `localStorage` under `dawwarha_jwt`.
3. **SPA Deep Linking:** Refresh `/dashboard` or `/matches` directly in browser. Ensure no 404 appears.
4. **Network Tab Check:** Verify API calls target `https://<your-backend-domain>/api/*` and return HTTP 200/201 without cross-origin blocks.

---

## 13. Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **404 on page reload** | `.htaccess` is missing from `public_html/` | Ensure `release/frontend/.htaccess` is uploaded to `public_html/`. In File Manager, check "Show Hidden Files". |
| **CORS Blocked in Browser** | `CLIENT_URL` does not match the frontend origin | Update backend `CLIENT_URL` environment variable to include both `https://yourdomain.com` and `https://www.yourdomain.com` (comma-separated). Restart backend. |
| **MongoDB connection timeout** | Atlas IP Access List does not permit the Hostinger server | In MongoDB Atlas Network Access, add Hostinger IP (or `0.0.0.0/0`). Verify username & password in `MONGODB_URI`. |
| **502 Bad Gateway / Application Down** | Node.js process crashed on startup | Check Hostinger Node.js error logs. Verify `NODE_ENV=production` and that all required environment variables (`MONGODB_URI`, `JWT_SECRET`) are populated. |
| **White page after deployment** | `<base href="/">` mismatch | The Angular app is built with `<base href="/">`. Ensure files are in the domain root `public_html/`, not a subfolder like `public_html/browser/`. |
