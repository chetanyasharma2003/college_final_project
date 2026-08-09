# Production Deployment Guide

Complete guide to deploy Government Schemes Analytics Dashboard to production (Vercel + Render).

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────┐
│   Vercel (Frontend)                     │
│   - React + Vite                        │
│   - https://college-final-project.vercel.app  │
└────────────┬────────────────────────────┘
             │
             └──> Render Backend API
                  https://college-final-project-backend.onrender.com/api/v1

┌─────────────────────────────────────────┐
│   Render (Backend)                      │
│   - Node.js + Express                   │
│   - PostgreSQL Database                 │
│   - Redis Cache                         │
└─────────────────────────────────────────┘
```

## Prerequisites

- GitHub Account: https://github.com/chetanyasharma2003/college_final_project
- Vercel Account: https://vercel.com
- Render Account: https://render.com
- Vercel API Token
- Render API Key

## Step-by-Step Deployment

### 1. Frontend Deployment (Vercel)

#### Option A: Automatic Deployment (via CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy frontend
cd frontend
vercel --prod

# Your frontend URL: https://college-final-project.vercel.app
```

#### Option B: Manual Deployment (via Web)

1. Go to https://vercel.com/new
2. Import GitHub repository: `chetanyasharma2003/college_final_project`
3. Select root directory: `frontend`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://college-final-project-backend.onrender.com/api/v1
   ```
5. Click "Deploy"

#### Vercel Environment Variables

Set in Vercel Dashboard > Settings > Environment Variables:

```
VITE_API_URL=https://college-final-project-backend.onrender.com/api/v1
```

### 2. Backend Deployment (Render)

#### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Create New > PostgreSQL
   - Name: `college-final-project-db`
   - Database: `gov_schemes`
   - User: `govschemes`
   - Region: Singapore
   - Plan: Starter (Free)
3. Copy the connection string (you'll need it later)

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
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`

#### Step 4: Add Environment Variables

In Render Dashboard > Environment:

```env
NODE_ENV=production
PORT=5001
HOST=0.0.0.0

# Database (from PostgreSQL)
DATABASE_URL=postgresql://govschemes:PASSWORD@host:5432/gov_schemes

# Redis (from Redis)
REDIS_URL=redis://default:PASSWORD@host:port

# JWT Secrets
JWT_SECRET=MyJWTSecretABC12345
JWT_REFRESH_SECRET=MyRefreshSecretXYZ789

# CORS
CORS_ORIGIN=https://college-final-project.vercel.app,http://localhost:5173
```

#### Step 5: Database Setup

1. After service is deployed, go to Render Dashboard > college-final-project-backend > Shell
2. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db push
   node prisma/seed.js
   ```

### 3. Update Frontend with Backend URL

After backend is deployed, update frontend:

1. Go to Vercel Dashboard > college-final-project
2. Settings > Environment Variables
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://college-final-project-backend.onrender.com/api/v1
   ```
4. Redeploy frontend (Settings > Deployments > Redeploy)

## 📊 Production Credentials

### Frontend
- **URL:** https://college-final-project.vercel.app
- **Login:** admin@govschemes.in / Admin@12345

### Backend
- **URL:** https://college-final-project-backend.onrender.com/api/v1
- **Health:** https://college-final-project-backend.onrender.com/health

### Database
- **Type:** PostgreSQL on Render
- **Host:** provided by Render
- **Database:** gov_schemes
- **User:** govschemes

### Cache
- **Type:** Redis on Render
- **Host:** provided by Render

## 🔍 Verification

### Check Frontend

```bash
# Test if frontend is accessible
curl https://college-final-project.vercel.app

# Should see HTML with React app
```

### Check Backend

```bash
# Health check
curl https://college-final-project-backend.onrender.com/health

# API status
curl https://college-final-project-backend.onrender.com/api/v1

# Login test
curl -X POST https://college-final-project-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@govschemes.in",
    "password":"Admin@12345"
  }'
```

### Full End-to-End Test

1. Open https://college-final-project.vercel.app
2. Login with admin@govschemes.in / Admin@12345
3. Dashboard should load with:
   - Health score 50-55%
   - 30-day trend graph
   - KPIs requiring attention
   - Scheme comparison
4. Switch between schemes - data should update

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

**Vercel:**
```bash
vercel logs https://college-final-project.vercel.app
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

## 🎯 Cost Breakdown

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel (Frontend) | Pro | $20/month | Includes 100GB bandwidth |
| Render (Backend) | Starter | Free | Will sleep after 15min inactivity |
| PostgreSQL | Starter | Free | 256MB storage |
| Redis | Starter | Free | 30MB memory |
| **Total** | | **Free - $20/month** | Can upgrade later |

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

**Deployment completed on:** [Your deployment date]
**Frontend URL:** https://college-final-project.vercel.app
**Backend URL:** https://college-final-project-backend.onrender.com/api/v1
