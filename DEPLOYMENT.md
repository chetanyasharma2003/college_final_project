# Production Deployment Guide

Current production uses a Render frontend and a Render backend. As checked on 3 November 2026, the frontend responds at `https://frontend-ae3v.onrender.com`, and the backend health endpoint responds with its database connected at `https://college-final-project-backend-m86r.onrender.com/health`. The Vercel URLs recorded in older deployment notes currently return 404 and are not active production links.

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────┐
│   Render (Frontend)                     │
│   - React + Vite                        │
│   - https://frontend-ae3v.onrender.com  │
└────────────┬────────────────────────────┘
             │
             └──> Render Backend API
                  https://college-final-project-backend-m86r.onrender.com/api/v1

┌─────────────────────────────────────────┐
│   Render (Backend)                      │
│   - Node.js + Express                   │
│   - PostgreSQL Database                 │
│   - Redis Cache                         │
└─────────────────────────────────────────┘
```

## Prerequisites

- GitHub Account: https://github.com/chetanyasharma2003/college_final_project
- Render Account: https://render.com
- Render API Key

## Step-by-Step Deployment

### 1. Current Frontend Deployment (Render)

The active frontend service is `https://frontend-ae3v.onrender.com`. To create a replacement Render static site, use the `frontend` directory, build command `npm ci && npm run build`, and publish directory `dist`. Set `VITE_API_URL` to `https://college-final-project-backend-m86r.onrender.com/api/v1`. Update the backend `CORS_ORIGIN` setting to the new frontend origin before switching traffic.

### Optional: Deploy the Frontend to Vercel

#### Option A: Automatic Deployment (via CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy frontend
cd frontend
vercel --prod

# Use the URL assigned to this Vercel deployment; the old project URL currently returns 404.
```

#### Option B: Manual Deployment (via Web)

1. Go to https://vercel.com/new
2. Import GitHub repository: `chetanyasharma2003/college_final_project`
3. Select root directory: `frontend`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://college-final-project-backend-m86r.onrender.com/api/v1
   ```
5. Click "Deploy"

#### Vercel Environment Variables

Set in Vercel Dashboard > Settings > Environment Variables:

```
VITE_API_URL=https://college-final-project-backend-m86r.onrender.com/api/v1
```

### 2. Backend Deployment (Render)

#### Step 1: Configure the Neon Database

The deployed backend uses PostgreSQL on Neon. Set `DATABASE_URL` in the Render service's private environment settings to the Neon pooled connection string. Do not put the URL in this file, source control, or screenshots.

#### Step 2: Create Redis Cache

1. Create New > Redis
   - Name: `college-final-project-redis`
   - Region: Singapore
   - Plan: Starter (Free)
2. Copy the connection string

#### Step 3: Create Web Service

1. Create New > Web Service
2. Connect GitHub:
   - Repository: `chetanyasharma2003/college_final_project`
   - Click "Connect"
3. Configure:
   - **Name:** `college-final-project-backend`
   - **Runtime:** Node
   - **Region:** Singapore
   - **Branch:** main
   - **Build Command:** `cd backend && npm ci && npm run build`
   - **Start Command:** `cd backend && npm start`

#### Step 4: Add Environment Variables

In Render Dashboard > Environment:

```env
NODE_ENV=production
PORT=5001
HOST=0.0.0.0

# Database (private Neon pooled connection string)
DATABASE_URL=<set privately in Render>

# JWT Secrets
JWT_SECRET=<unique random secret>
JWT_REFRESH_SECRET=<different unique random secret>

# CORS
CORS_ORIGIN=https://frontend-ae3v.onrender.com,http://localhost:5173
```

#### Step 5: Database Setup

1. After service is deployed, go to Render Dashboard > college-final-project-backend > Shell
2. Run migrations:
   ```bash
   cd backend
   npm run migrate
   ```

### 3. Update Frontend with Backend URL

After backend is deployed, update frontend:

1. Go to Vercel Dashboard > college-final-project
2. Settings > Environment Variables
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://college-final-project-backend-m86r.onrender.com/api/v1
   ```
4. Redeploy frontend (Settings > Deployments > Redeploy)

## Production Access

### Frontend
- **URL:** https://frontend-ae3v.onrender.com
- **Login:** Create or provision an account securely; never use a shared demo password.

### Backend
- **URL:** https://college-final-project-backend-m86r.onrender.com/api/v1
- **Health:** https://college-final-project-backend-m86r.onrender.com/health

### Database
- **Type:** PostgreSQL on Neon
- **Connection string:** stored privately in the Render environment

## 🔍 Verification

### Check Frontend

```bash
# Test if frontend is accessible
curl https://frontend-ae3v.onrender.com

# Should see HTML with React app
```

### Check Backend

```bash
# Health check
curl https://college-final-project-backend-m86r.onrender.com/health

# API status
curl https://college-final-project-backend-m86r.onrender.com/api/v1

# Login test (use an account provisioned by your administrator)
curl -X POST https://college-final-project-backend-m86r.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
      "email":"<provisioned-email>",
      "password":"<provisioned-password>"
  }'
```

### Full End-to-End Test

1. Open https://frontend-ae3v.onrender.com
2. Login with an account provisioned by the administrator
3. Dashboard should load with:
   - source-backed KPIs with their reporting periods
   - the available geographic coverage for the selected source
   - scheme comparisons based only on configured source metrics
4. Check that historical source values are not presented as real-time data.

## 🚨 Troubleshooting

### Frontend Not Connecting to Backend

**Issue:** CORS errors or connection refused

**Solution:**
1. Check backend URL in Vercel environment variables
2. Verify backend is running: `https://backend-url/health`
3. Check CORS_ORIGIN in backend env vars

### Database Connection Error

**Issue:** "Connection refused" or "timeout"

**Solution:**
1. Check DATABASE_URL format
2. Verify PostgreSQL database is created
3. Run migrations: `npx prisma migrate deploy`

### Login Not Working

**Issue:** "Invalid email or password"

**Solution:**
1. Run seed script on production:
   ```bash
   cd backend
   node prisma/seed.js
   ```
2. Check JWT secrets match in env vars

### Render Service Going to Sleep

**Issue:** First request takes 30+ seconds

**Solution:**
- Upgrade to Pro plan (prevents sleeping)
- Or accept initial delay (normal for free tier)

## 📈 Monitoring

### View Logs

**Vercel (only if a Vercel deployment is re-enabled):**
```bash
vercel logs <deployment-url>
```

**Render:**
- Go to Render Dashboard > college-final-project-backend > Logs

### Monitor Performance

- Vercel Analytics: https://vercel.com/analytics
- Render Metrics: https://dashboard.render.com

## 🔒 Security Checklist

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET in production
- [ ] Set strong database password
- [ ] Enable auto-scaling if needed
- [ ] Configure backups for PostgreSQL
- [ ] Use HTTPS (automatic with Vercel/Render)
- [ ] Add firewall rules if needed

## 🎯 Hosting Costs

Costs depend on the active Render and Neon account plans. They were not verified as part of the endpoint check; do not use older cost estimates in this guide as current billing information.

## 📞 Support & Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Prisma Docs: https://www.prisma.io/docs
- GitHub: https://github.com/chetanyasharma2003/college_final_project

## ✅ Deployment Checklist

- [ ] GitHub repository updated with all changes
- [ ] Vercel project created and configured
- [ ] Frontend deployed to Vercel
- [ ] Render PostgreSQL created
- [ ] Render Redis created
- [ ] Render backend service created
- [ ] Database migrations run
- [ ] Seed script executed
- [ ] Environment variables configured
- [ ] CORS settings verified
- [ ] Frontend-backend connection tested
- [ ] Login tested
- [ ] Dashboard data loading verified
- [ ] Monitors and alerts configured

---

**Last endpoint check:** 3 November 2026 (frontend and backend HTTP checks only; authenticated user flows remain unverified)

**Frontend URL:** https://frontend-ae3v.onrender.com

**Backend URL:** https://college-final-project-backend-m86r.onrender.com/api/v1
