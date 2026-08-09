# 🚀 Render Production Deployment - Step by Step

**Status:** Ready to deploy  
**Timeline:** 15-20 minutes  
**What you'll get:** Full production system with 100% uptime

---

## 📋 Prerequisites

✅ GitHub account connected to Vercel  
✅ Render account (https://render.com - sign up free)  
✅ Frontend already live on Vercel  
✅ All code pushed to GitHub  

---

## 🎯 Step 1: Create PostgreSQL Database on Render

### 1.1 Go to Render Dashboard
```
https://dashboard.render.com
```

### 1.2 Click "New +" → "PostgreSQL"
- **Name:** `college-final-project-db`
- **Database:** `gov_schemes`
- **User:** `govschemes`
- **Region:** Singapore (closest to India)
- **Plan:** Free Tier (good for college project)

### 1.3 Click "Create Database"
Wait 2-3 minutes for database to initialize...

### 1.4 Copy Connection String
Once created, you'll see:
```
postgresql://govschemes:PASSWORD@HOSTNAME:5432/gov_schemes
```

**SAVE THIS!** You'll need it in 2 minutes.

---

## 🎯 Step 2: Create Redis Cache on Render

### 2.1 Click "New +" → "Redis"
- **Name:** `college-final-project-redis`
- **Region:** Singapore
- **Plan:** Free Tier

### 2.2 Click "Create Redis"
Wait 1-2 minutes...

### 2.3 Copy Connection String
You'll see:
```
redis://default:PASSWORD@HOSTNAME:PORT
```

**SAVE THIS!** You'll need it next.

---

## 🎯 Step 3: Create Web Service (Backend) on Render

### 3.1 Click "New +" → "Web Service"

### 3.2 Connect GitHub
- Click "Connect account" if needed
- Select repository: `chetanyasharma2003/college_final_project`
- Click "Connect"

### 3.3 Configure Service
**Name:** `college-final-project-backend`  
**Runtime:** Node  
**Region:** Singapore  
**Branch:** main  

### 3.4 Set Build & Start Commands
**Build Command:**
```
cd backend && npm install && npm run build
```

**Start Command:**
```
cd backend && npm start
```

### 3.5 Add Environment Variables
Click "Add Environment Variable" and add these one by one:

```
NODE_ENV = production
PORT = 5001
HOST = 0.0.0.0
```

Then add database & secrets:

**DATABASE_URL:**
```
postgresql://govschemes:PASSWORD@HOSTNAME:5432/gov_schemes
```
(Replace with your PostgreSQL connection string from Step 1)

**REDIS_URL:**
```
redis://default:PASSWORD@HOSTNAME:PORT
```
(Replace with your Redis connection string from Step 2)

**JWT_SECRET:**
```
MyJWTSecretABC12345XYZ789MyJWTSecretABC12345XYZ789
```

**JWT_REFRESH_SECRET:**
```
MyRefreshSecretXYZ789ABC12345MyRefreshSecretXYZ789ABC12345
```

**CORS_ORIGIN:**
```
https://frontend-eta-smoky-88.vercel.app,http://localhost:5173
```

### 3.6 Click "Create Web Service"

**⏳ WAIT 5-10 MINUTES** for backend to build and deploy...

---

## 🎯 Step 4: Run Database Setup

### 4.1 Once Backend is Live, Go to Service Shell
- In Render dashboard, click your backend service
- Click "Shell" tab

### 4.2 Run Migrations
```bash
cd backend
npx prisma migrate deploy
```

### 4.3 Run Seed Script
```bash
node prisma/seed.js
```

You should see:
```
✅ Admin user created
✅ Analyst user created
✅ 1080 KPI records created
```

---

## 🎯 Step 5: Update Vercel Frontend

### 5.1 Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### 5.2 Click Your Project
Click `frontend-eta-smoky-88` (or your frontend project)

### 5.3 Go to Settings → Environment Variables

### 5.4 Find `VITE_API_URL` and Update It
**Old:**
```
http://localhost:5001/api/v1
```

**New:**
```
https://college-final-project-backend.onrender.com/api/v1
```

(Replace `college-final-project-backend` with your actual Render service name)

### 5.5 Redeploy Frontend
- Go to "Deployments" tab
- Click the latest deployment
- Click "Redeploy"

**⏳ WAIT 2-3 MINUTES**...

---

## ✅ Step 6: Test Everything

### 6.1 Open Frontend
```
https://frontend-eta-smoky-88.vercel.app
```

### 6.2 Try Login
```
Email: admin@govschemes.in
Password: Admin@12345
```

### 6.3 Verify Dashboard
- ✅ Loads without errors
- ✅ Health score showing
- ✅ Graphs rendering
- ✅ Data loading from API

### 6.4 Test API Directly
```bash
# Health check
curl https://college-final-project-backend.onrender.com/health

# Should return: {"status":"OK"}
```

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created on Render
- [ ] Redis cache created on Render
- [ ] Backend web service deployed on Render
- [ ] All environment variables set
- [ ] Database migrations ran
- [ ] Seed data inserted
- [ ] Frontend environment variable updated
- [ ] Frontend redeployed
- [ ] Login works
- [ ] Dashboard loads with data
- [ ] No CORS errors in console

---

## 📊 Your Production URLs

```
Frontend: https://frontend-eta-smoky-88.vercel.app
Backend API: https://college-final-project-backend.onrender.com/api/v1
Database: PostgreSQL on Render
Cache: Redis on Render
```

**Test Credentials:**
```
Email: admin@govschemes.in
Password: Admin@12345
```

---

## 🚨 Troubleshooting

### Issue: Backend taking too long to deploy
**Solution:** Render free tier is slow. Wait 10+ minutes. Check logs in Render dashboard.

### Issue: "Connection refused" error
**Solution:** Database not ready. Wait 3+ minutes for PostgreSQL to initialize.

### Issue: Login still showing "Failed"
**Solution:** Run seed script again:
```bash
cd backend
node prisma/seed.js
```

### Issue: CORS errors still showing
**Solution:** 
1. Check CORS_ORIGIN variable has correct Vercel URL
2. Redeploy Vercel frontend
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Graphs still showing localhost errors
**Solution:**
1. Check backend URL in Vercel environment variables
2. Verify backend is running: `https://backend-url.onrender.com/health`
3. Redeploy frontend again

---

## 💰 Cost

✅ Vercel Frontend: Free (with pro features)  
✅ Render Backend: Free (with limitations)  
✅ PostgreSQL: Free 256MB  
✅ Redis: Free 30MB  

**Total: FREE!** 🎉

---

## 📞 Support

- Render Status: https://status.render.com
- Vercel Status: https://www.vercelstatus.com
- GitHub Repo: https://github.com/chetanyasharma2003/college_final_project

---

**Ready? Let's do it! 🚀**

Follow each step carefully. Let me know if you get stuck on any step!
