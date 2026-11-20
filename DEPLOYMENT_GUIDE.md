# 🚀 JAL-RAKSHAK (जल रक्षक) — Cloud Deployment Guide

This guide explains how to deploy **JAL-RAKSHAK** to production hosting platforms such as **Netlify**, **Vercel**, **Render**, and **Docker**.

---

## 🔍 Root Cause of the Netlify "Page Not Found" (404) Error

If you encountered this screen on Netlify:
> **"Page not found — Looks like you've followed a broken link or entered a URL that doesn't exist on this site."**

This is caused by two common factors in monorepo React Single-Page Applications (SPAs):
1. **Base Directory / Publish Directory Mismatch:**
   By default, Netlify assumes your website files (`index.html`, `package.json`) are at the Git repository root. In this repository, the frontend application resides inside `jal-rakshak/frontend/`. If the Base Directory is not specified, Netlify cannot find `dist/` or `index.html`.
2. **SPA Client-Side Routing:**
   React Router uses HTML5 History API (`/digital-twin`, `/alerts`, `/simulator`). When a user visits or refreshes a non-root URL, Netlify's CDN checks the file server for a file at `/simulator/index.html`. Because that file doesn't exist on disk, Netlify throws a **404 Page Not Found**. SPAs require a rewrite rule (`/* -> /index.html 200`) so Netlify always serves `index.html` and lets React Router handle the route.

---

## 🛠️ What We Added to Fix This

We added pre-configured deployment files so your app deploys automatically on any platform:

| File | Purpose |
|------|---------|
| `jal-rakshak/frontend/public/_redirects` | Bundled directly into `dist/_redirects` ensuring SPA routing works on Netlify. |
| `jal-rakshak/frontend/netlify.toml` | Configures `publish = "dist"`, build command, and 200 rewrite rule if deploying from frontend folder. |
| `netlify.toml` (Repository Root) | Automatically tells Netlify to build `base = "jal-rakshak/frontend"`, publish `dist`, with rewrite rules if deploying from repo root. |
| `package.json` (Repository Root) | Provides root scripts (`npm run build`, `npm start`) delegating to the frontend. |
| `vercel.json` (Root & Frontend) | Rewrites all routes `/(.*)` to `/index.html` for 1-click Vercel deployments. |
| `jal-rakshak/render.yaml` | 1-click Infrastructure as Code for deploying FastAPI backend to Render. |
| `jal-rakshak/frontend/.env.production` | Environment template for connecting cloud backend. |

---

## 🌐 1. Deploy Frontend to Netlify

You can deploy using either of two methods:

### Method A: Connect Netlify to your GitHub / GitLab Repo (Recommended)
1. Go to [Netlify Dashboard](https://app.netlify.com/) -> **Add new site** -> **Import an existing project**.
2. Select your Git repository.
3. In **Build settings**, verify the following (our `netlify.toml` auto-configures this):
   - **Base directory:** `jal-rakshak/frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy Site**.
5. Your app will build and go live at `https://<your-site-name>.netlify.app`!

### Method B: Netlify Drag & Drop (Instant 30-Second Deploy)
1. Run local build:
   ```bash
   cd jal-rakshak/frontend
   npm run build
   ```
2. Open [Netlify Drop](https://app.netlify.com/drop).
3. Drag and drop the `jal-rakshak/frontend/dist` folder into the browser window.
4. Your site is instantly live with working SPA routing!

---

## ⚡ 2. Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New** -> **Project**.
2. Import your Git repository.
3. In project settings:
   - **Root Directory:** Edit and select `jal-rakshak/frontend` (or leave default if using root `vercel.json`).
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

---

## 🐍 3. Deploy Backend API to Render (FastAPI + AI Engine)

The backend provides the live FastAPI REST endpoints and simulated IoT/AI intelligence.

### Quick Setup on Render:
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
2. Connect your Git repository.
3. Configure:
   - **Root Directory:** `jal-rakshak`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/v1/health`
4. Click **Create Web Service**.
5. Note your deployed URL (e.g., `https://jal-rakshak-api.onrender.com`).

---

## 🔗 4. Connect Frontend to Your Live Backend

Once your backend is deployed:
1. In Netlify or Vercel:
   - Go to **Site Configuration** -> **Environment variables**.
   - Add variable:
     - **Key:** `VITE_API_BASE_URL`
     - **Value:** `https://jal-rakshak-api.onrender.com/api/v1`
2. Trigger a re-deploy.

> 💡 **Standalone Fallback Mode:**
> If `VITE_API_BASE_URL` is omitted or the backend is offline, JAL-RAKSHAK **never crashes**. All frontend pages have built-in realistic mock intelligence fallbacks, allowing the full dashboard, Digital Twin, and Scenario Simulator to be demonstrated anywhere without an active backend server!

---

## 🐳 5. Run Locally with Docker Compose

To run the complete full-stack system (Frontend + Backend + Mosquitto MQTT Broker) on any machine:

```bash
cd jal-rakshak
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs`
- MQTT Broker: `localhost:1883`
