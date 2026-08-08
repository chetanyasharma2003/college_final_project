# 🐳 Docker Quick Start Guide

> **बस एक command में सब चल जाएगा!**

---

## ✅ Prerequisites

1. **Docker Desktop** → https://www.docker.com/
   - Download और install करो
   - App खोलो

That's it! No Node.js, no npm, no manual setup needed!

---

## 🚀 Start in 2 Commands

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/college_final_project.git
cd college_final_project
```

### Step 2: Start Everything
```bash
docker-compose up
```

**That's it!** ✨

Wait 30-60 seconds for services to start...

---

## 📱 Access Application

After startup, open these links:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend** | http://localhost:5001 | - |
| **Health Check** | http://localhost:5001/health | - |

### Login Credentials
```
Email: admin@govschemes.in
Password: Admin@12345
```

---

## 📊 What's Running

```
✅ Frontend (React + Vite)    → Port 5173
✅ Backend (Node + Express)   → Port 5001
✅ Database (PostgreSQL)      → Port 5432
✅ Cache (Redis)              → Port 6379
```

All configured and connected automatically!

---

## 🛑 Stop Everything

Press `Ctrl+C` in terminal

या separate terminal में:
```bash
docker-compose down
```

---

## 🔄 Restart

```bash
docker-compose up
```

(It remembers everything from last time)

---

## 🧹 Clean Everything (Fresh Start)

```bash
docker-compose down -v
docker-compose up
```

(Removes all data, fresh database)

---

## ⚠️ Troubleshooting

### Port Already in Use?
```bash
# Kill old containers
docker-compose down

# Start fresh
docker-compose up
```

### Docker Not Starting?
1. Open Docker Desktop app
2. Wait for "Engine running"
3. Then run `docker-compose up`

### Containers Not Healthy?
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs

# Restart
docker-compose restart
```

### Want Fresh Database?
```bash
docker-compose down -v
docker-compose up
```

---

## 📋 Environment Variables (Optional)

Create `.env` file if you want to customize:

```bash
# Database
DB_USER=govschemes
DB_PASSWORD=devpassword
DB_NAME=gov_schemes

# Node
NODE_ENV=production
JWT_SECRET=your-secret-key

# Ports
DB_PORT=5432
REDIS_PORT=6379
```

---

## 📚 Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Stop a specific service
docker-compose stop backend

# Start a specific service
docker-compose start backend

# Execute command in container
docker-compose exec backend npm run seed

# Remove unused images
docker image prune
```

---

## 🎯 Next Steps

1. **Explore Dashboard** → http://localhost:5173
2. **Check APIs** → http://localhost:5001/api/v1
3. **View Logs** → `docker-compose logs -f`
4. **Make Code Changes** → Restart with `docker-compose restart backend`

---

## ⏱️ Performance Tips

- First start: 2-3 minutes (downloads images)
- Subsequent starts: 30-60 seconds
- Database persists between restarts
- Use `docker-compose up -d` to run in background

---

## 🆘 Still Having Issues?

1. Ensure Docker Desktop is running
2. Check: `docker ps` shows containers
3. Check: `docker-compose ps` shows services
4. View logs: `docker-compose logs`
5. Fresh start: `docker-compose down -v && docker-compose up`

---

## 🎉 Done!

Your dashboard is running. Enjoy! 🚀

**सब अपने PC पर चल रहा है! No installation headaches!**
