# 🚀 GET STARTED NOW - Copy-Paste Instructions

**Difficulty:** Easy  
**Time:** 15 minutes to get running  
**Goal:** Backend API working + Database seeded with dummy data  

---

## ⚡ STEP 1: Terminal Setup (5 min)

### Open Terminal & Navigate
```bash
cd ~/Documents/college_final_project
```

### Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your details (IMPORTANT!)
nano .env
```

**In `.env` file, find and change:**
```env
DB_PASSWORD=your_secure_password_123  # Change this!
JWT_SECRET=your_random_secret_key_12345_change_this  # Change this!
JWT_REFRESH_SECRET=another_random_secret_98765  # Change this!
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000/api/v1
```

**Save** (Ctrl+S or Cmd+S), then **Exit** (Ctrl+X or Cmd+X)

---

## ⚡ STEP 2: Start Database Services (2 min)

```bash
# Make sure Docker Desktop is running first!

# Start PostgreSQL + Redis containers
docker-compose up -d

# Verify they're running
docker-compose ps
```

**Expected output:**
```
NAME                      STATUS
gov-schemes-db           Up 10 seconds
gov-schemes-cache        Up 10 seconds
```

If NOT running, troubleshoot:
```bash
# Check logs
docker-compose logs postgres

# Restart
docker-compose restart
```

---

## ⚡ STEP 3: Backend Setup (5 min)

### Open NEW Terminal Tab

```bash
# Navigate to backend
cd backend

# Install all dependencies
npm install

# This will take ~2-3 minutes...
# Wait for "npm notice"
```

### Create Database Tables (Prisma Migrations)

```bash
# Create database schema
npm run migrate
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Migrations applied successfully
```

### Seed Dummy Data

```bash
# Add realistic dummy data (users, states, schemes, KPIs, etc.)
npm run seed
```

**Expected output:**
```
🌱 Starting database seeding...
✅ Users created
✅ Created 6 states
✅ Created 18 districts
... (lots of data)
✨ Seeding completed successfully!

🔐 Test Credentials:
   Admin: admin@govschemes.in / Admin@12345
   Analyst: analyst@govschemes.in / Analyst@12345
```

---

## ⚡ STEP 4: Start Backend Server (2 min)

**Still in backend folder:**

```bash
# Start development server
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════════════════╗
║   Government Schemes Analytics Backend             ║
║   Listening on port 5000                           ║
║   Environment: development                         ║
║   API Base: http://localhost:5000/api/v1           ║
╚════════════════════════════════════════════════════╝
```

✅ **Backend is RUNNING!** Keep this terminal open.

---

## ⚡ STEP 5: Test Backend APIs (2 min)

### Open ANOTHER NEW Terminal Tab

```bash
# Test health check
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Test API version

```bash
curl http://localhost:5000/api/v1

# Should return API endpoints info
```

### Test Login API

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@govschemes.in",
    "password": "Admin@12345"
  }'

# Should return access token + user info
```

✅ **Backend APIs are WORKING!** You should see response with `accessToken`.

---

## ⚡ STEP 6: Frontend Setup (5 min - New Terminal Tab)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# This takes ~2 minutes...
```

### Start Frontend Dev Server

```bash
# Start Vite dev server with hot reload
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
➜  Press h to show help
```

✅ **Frontend is RUNNING!**

---

## ⚡ STEP 7: Open in Browser

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api/v1
Health Check: http://localhost:5000/health
```

Open browser to: **http://localhost:5173**

You should see:
- Vite React app (will be blank - components not built yet)
- No errors in browser console (F12)

✅ **FRONTEND IS RUNNING!**

---

## 🎉 SUCCESS CHECKLIST

You've successfully set up! ✅

- [x] `.env` file configured
- [x] Docker containers running (PostgreSQL + Redis)
- [x] Backend dependencies installed
- [x] Database schema created (migrations)
- [x] Dummy data seeded
- [x] Backend server running on port 5000
- [x] Frontend server running on port 5173
- [x] API endpoints responding
- [x] Test login successful

---

## 📊 Current Status

```
SYSTEM STATUS:
═════════════════════════════════════════════════════

✅ PostgreSQL Database    - RUNNING
✅ Redis Cache           - RUNNING  
✅ Backend API Server    - RUNNING on :5000
✅ Frontend Dev Server   - RUNNING on :5173
✅ Database Schema       - CREATED & POPULATED
✅ Dummy Data            - SEEDED (6 schemes, 18 districts, etc.)
✅ Auth API              - READY (login/register working)

NEXT: Build more APIs and frontend components!
```

---

## 📚 What's Seeded in Database

```
6 Government Schemes:
  ├─ PMAY (Housing)
  ├─ MGNREGS (Employment)
  ├─ PMGSY (Roads)
  ├─ NRLM (Livelihoods)
  ├─ DDU-GKY (Skills)
  └─ SAGY (Model Villages)

6 States with KPI data

18 Districts with data

36 Blocks

72 Villages

50+ KPI Definitions

Real-time KPI Values for each state/scheme

2 Demo Users:
  - Admin: admin@govschemes.in / Admin@12345
  - Analyst: analyst@govschemes.in / Analyst@12345
```

---

## 🛠️ Common Commands

```bash
# Backend (from backend/ folder)
npm run dev              # Start dev server
npm run migrate          # Run database migrations
npm run seed             # Add dummy data
npm test                 # Run tests
npm run lint             # Check code

# Frontend (from frontend/ folder)
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
npm test                 # Run tests

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

---

## ❌ Troubleshooting

### "Port 5000 already in use"
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
# Or just change PORT in .env to 5001
```

### "Cannot connect to database"
```bash
# Check if containers running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check connection string in .env
```

### "npm: command not found"
```bash
# Install Node.js from https://nodejs.org/
# Then restart terminal
```

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Migration failed"
```bash
# Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# Then re-seed
npm run seed
```

---

## 📞 Next Steps After Setup

Once everything is running:

1. **Explore API Endpoints** - Check backend routes
2. **Build Dashboard Components** - Create React components
3. **Connect Frontend to Backend** - Fetch real data
4. **Add More Features** - Comparisons, reports, etc.
5. **Deploy to Production** - Vercel + Railway

---

## 🎯 You're Ready!

```
✅ Backend is ready for API development
✅ Frontend is ready for component building
✅ Database is populated with realistic data
✅ All 6 schemes are integrated
✅ Auth system is working

Start building features in SOLO_BUILD_PLAN.md!
```

---

**Status:** READY TO BUILD 🚀  
**Time:** 15 minutes  
**Result:** Production-ready foundation  
**Next:** Implement Week 1 features

Keep these 3 terminals running:
1. Backend server
2. Frontend server  
3. Working terminal for commands

Happy coding! 💪
