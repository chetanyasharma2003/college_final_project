# 🚀 Quick Commands - Automatic Service Management

## One-Command Startup (AUTOMATIC ✅)

```bash
# Start everything automatically (handles port conflicts)
/Users/chetanya/Documents/college_final_project/start.sh
```

**What it does automatically:**
- ✅ Kills any zombie processes
- ✅ Cleans ports 5001 & 5173
- ✅ Starts backend (Express.js)
- ✅ Starts frontend (React+Vite)
- ✅ Verifies both services are running
- ✅ Shows logs in real-time

---

## Stop Services

```bash
# Stop everything gracefully
/Users/chetanya/Documents/college_final_project/stop.sh
```

---

## Restart Everything

```bash
# Stop and start (one command)
/Users/chetanya/Documents/college_final_project/restart.sh
```

---

## Access Services

```bash
# Backend API
http://localhost:5001
http://localhost:5001/health
http://localhost:5001/api/v1/ml-analytics/dashboard/1

# Frontend Dashboard
http://localhost:5173
http://localhost:5173/login

# Test Credentials
Email: admin@govschemes.in
Password: Admin@12345
```

---

## View Logs

```bash
# Backend logs
tail -f /Users/chetanya/Documents/college_final_project/logs/backend.log

# Frontend logs
tail -f /Users/chetanya/Documents/college_final_project/logs/frontend.log

# Both logs together
tail -f /Users/chetanya/Documents/college_final_project/logs/*.log
```

---

## Troubleshooting

### Port Still In Use?
```bash
# Force kill port 5001
lsof -ti:5001 | xargs kill -9

# Force kill port 5173
lsof -ti:5173 | xargs kill -9
```

### Check Port Status
```bash
# Check if ports are free
lsof -i :5001
lsof -i :5173

# Both should show nothing if ports are free
```

### View Running Processes
```bash
# See backend
ps aux | grep "node.*index.js"

# See frontend
ps aux | grep "vite"
```

---

## PM2 Management (Advanced)

If you want automatic restart on crash with PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs gov-schemes-backend
pm2 logs gov-schemes-frontend

# Restart
pm2 restart ecosystem.config.js

# Stop
pm2 stop ecosystem.config.js

# Delete
pm2 delete ecosystem.config.js
```

---

## Environment Setup (One Time)

```bash
# Backend setup
cd /Users/chetanya/Documents/college_final_project/backend
npm install

# Frontend setup
cd /Users/chetanya/Documents/college_final_project/frontend
npm install

# Then run start script anytime
/Users/chetanya/Documents/college_final_project/start.sh
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **Start All** | `./start.sh` |
| **Stop All** | `./stop.sh` |
| **Restart All** | `./restart.sh` |
| **Backend Only** | `cd backend && npm run dev` |
| **Frontend Only** | `cd frontend && npm run dev` |
| **Backend Logs** | `tail -f logs/backend.log` |
| **Frontend Logs** | `tail -f logs/frontend.log` |
| **Health Check** | `curl http://localhost:5001/health` |

---

## Automatic Features

✅ **Automatic Port Conflict Handling**
- Detects if port is in use
- Automatically kills conflicting process
- Restarts cleanly

✅ **Automatic Service Verification**
- Checks if services started successfully
- Verifies ports are responding
- Reports status clearly

✅ **Automatic Log Management**
- Creates logs directory
- Logs all output
- Easy troubleshooting

✅ **Automatic Cleanup**
- Graceful shutdown on Ctrl+C
- Kills processes properly
- Cleans temporary files

---

## No More Manual Commands Needed! 🎉

**Before:** Kill process → Check if dead → Clear port → Start again  
**Now:** Just run `./start.sh` → Everything works automatically ✅

---

**Created:** August 9, 2026  
**Status:** Ready for production use
