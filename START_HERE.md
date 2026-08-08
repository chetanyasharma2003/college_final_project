# 🎯 START HERE - Tum Ab Yeh Karo

**Read this first.** Everything else baad mein.

---

## 📋 YOUR CHECKLIST (Do These 3 Things)

### ✅ STEP 1: Environment Setup (5 min)

```bash
# 1. Terminal mein yeh likho
cd ~/Documents/college_final_project

# 2. Environment file create karo
cp .env.example .env

# 3. .env file edit karo (password change karo!)
# macOS:
open .env

# Linux:
nano .env

# Windows:
notepad .env
```

**⚠️ IMPORTANT: .env mein yeh CHANGE KARO:**
```env
# Line 7-8: Change karo (strong password rakho)
DB_PASSWORD=your_strong_password_12345

# Line 19-20: Change karo (random secret)
JWT_SECRET=your_random_secret_abcdef123456
JWT_REFRESH_SECRET=another_random_secret_xyz789
```

**Save** file (Ctrl+S / Cmd+S)

---

### ✅ STEP 2: Start Docker (2 min)

**Make sure Docker Desktop RUNNING hai!**

```bash
# Terminal mein likho
docker-compose up -d

# Wait 10 seconds for containers start

# Verify
docker-compose ps
```

**Expected:**
```
NAME                      STATUS
gov-schemes-db           Up 5 seconds
gov-schemes-cache        Up 5 seconds
```

If NOT running, Docker open karo aur retry karo.

---

### ✅ STEP 3: Backend Setup (7 min)

**Open NEW Terminal Tab** (keyboard: Ctrl+T or Cmd+T)

```bash
# Navigate to backend
cd ~/Documents/college_final_project/backend

# Install dependencies (takes 2 min)
npm install

# Pura wait karo jab tak "npm notice" naa aaye

# Create database tables
npm run migrate

# Add dummy data (yeh important hai!)
npm run seed
```

**Expected output at end:**
```
✨ Seeding completed successfully!

🔐 Test Credentials:
   Admin: admin@govschemes.in / Admin@12345
   Analyst: analyst@govschemes.in / Analyst@12345
```

---

### ✅ STEP 4: Start Backend Server (1 min)

**Same terminal pe likho:**

```bash
npm run dev
```

**Expected:**
```
╔════════════════════════════════════════════════════╗
║   Government Schemes Analytics Backend             ║
║   Listening on port 5000                           ║
║   Environment: development                         ║
║   API Base: http://localhost:5000/api/v1           ║
╚════════════════════════════════════════════════════╝
```

✅ **BACKEND RUNNING!** Terminal ko open rakho.

---

## 🧪 STEP 5: Test Backend APIs (2 min)

**Open ANOTHER NEW Terminal** (Ctrl+T or Cmd+T)

```bash
# Test 1: Health Check
curl http://localhost:5000/health

# Test 2: Get Schemes
curl http://localhost:5000/api/v1/schemes

# Test 3: Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@govschemes.in",
    "password": "Admin@12345"
  }'
```

**Expected responses:**
```
Test 1 → {"status":"ok","timestamp":"...","uptime":...}
Test 2 → {"status":"success","data":[{6 schemes...}],"count":6}
Test 3 → {"status":"success","data":{"user":{...},"accessToken":"..."}}
```

✅ **ALL WORKING!** Copy the `accessToken` value.

---

## 🎨 STEP 6: Start Frontend (5 min)

**Open ANOTHER NEW Terminal**

```bash
# Go to frontend
cd ~/Documents/college_final_project/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Expected:**
```
➜  Local:   http://localhost:5173/
➜  Press h to show help
```

✅ **FRONTEND RUNNING!**

---

## 🌐 STEP 7: Open in Browser (30 sec)

```
http://localhost:5173
```

You should see:
- Blank page (React is running, no UI yet)
- No errors in console (F12)
- Network shows connection to backend

✅ **EVERYTHING RUNNING!**

---

## 📊 VERIFY EVERYTHING

### Check These 3 Things

1. **Backend Running?**
   ```
   Terminal 1 should show:
   "Listening on port 5000"
   ```

2. **Frontend Running?**
   ```
   Terminal 2 should show:
   "Local: http://localhost:5173/"
   ```

3. **Database Connected?**
   ```bash
   # In new terminal
   curl http://localhost:5000/api/v1/schemes
   
   # Should return 6 schemes with data
   ```

---

## 🎯 NOW YOU CAN BUILD

### What's Available for Frontend

```
✅ 6 Government Schemes (PMAY, MGNREGS, etc.)
✅ 50+ KPI metrics with real data
✅ 6 states with 18 districts (drill-down ready)
✅ User authentication (login system)
✅ Real-time KPI values
✅ Top/bottom performer rankings
✅ Scheme comparisons
✅ All dummy data seeded
```

### Next: Build React Components

Follow SOLO_BUILD_PLAN.md → Week 2 for frontend tasks:
- Login page
- Dashboard with KPI cards
- Charts & visualizations
- Geographic drill-down

---

## 🚨 TROUBLESHOOTING

### Problem: "Port 5000 already in use"
```bash
# Kill it
lsof -ti:5000 | xargs kill -9

# Or change .env PORT to 5001
```

### Problem: "Cannot connect to database"
```bash
# Check Docker
docker-compose ps

# Restart
docker-compose restart postgres
```

### Problem: "npm install failing"
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "migration failed"
```bash
# In backend folder
npx prisma migrate reset
npm run seed
```

---

## 📝 KEEP THESE 3 TERMINALS OPEN

```
Terminal 1: Backend (npm run dev)
Terminal 2: Frontend (npm run dev)
Terminal 3: Working terminal (for testing/commands)
```

---

## 🔑 Test Credentials

```
Admin Login:
  Email: admin@govschemes.in
  Password: Admin@12345

Analyst Login:
  Email: analyst@govschemes.in
  Password: Analyst@12345
```

---

## 📈 Your Progress

```
CHECKLIST:
[ ] 1. .env file created & configured
[ ] 2. Docker containers running
[ ] 3. npm install complete (backend)
[ ] 4. npm run migrate complete
[ ] 5. npm run seed complete
[ ] 6. Backend server running
[ ] 7. API tests passing (curl commands)
[ ] 8. npm install complete (frontend)
[ ] 9. Frontend server running
[ ] 10. Browser shows http://localhost:5173

DONE? → Start building frontend! 💪
```

---

## 🚀 NEXT ACTIONS

**When everything is running:**

1. Read: SOLO_BUILD_PLAN.md (Week 2 tasks)
2. Read: WHAT_IS_BUILT.md (available APIs)
3. Start: Frontend React components
4. Connect: Frontend to backend APIs
5. Build: Dashboard with real data

---

## 📞 If Stuck

1. Check logs: `docker-compose logs`
2. Check error: Browser console (F12)
3. Re-read: GET_STARTED_NOW.md
4. Restart everything: Stop all terminals, `docker-compose down`, start fresh

---

## ✨ YOU'RE READY!

Everything is set up. Just run the commands above and you'll have:
- ✅ Database with dummy data
- ✅ Backend APIs working
- ✅ Frontend dev server
- ✅ Authentication ready
- ✅ All 6 schemes loaded
- ✅ KPI data ready

**Now go build the UI!** 🎨

Time estimate: 3 weeks solo (8 hrs/day)  
Result: Production-ready application  
Difficulty: Moderate  

Let's do this! 💪
