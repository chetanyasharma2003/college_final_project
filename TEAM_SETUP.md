# 🚀 Team Setup Guide
## Government Schemes Analytics Dashboard

> **Easy setup for team members - सब अपने PC पर चला सकते हो!**

---

## ✅ Prerequisites (सब को install करना है)

1. **Node.js 18+** → https://nodejs.org/
2. **Docker & Docker Compose** → https://www.docker.com/
3. **Git** → https://git-scm.com/
4. **VS Code** (Optional) → https://code.visualstudio.com/

**Verify installation:**
```bash
node --version    # Should show v18+
docker --version  # Should work
git --version     # Should work
```

---

## 📥 Clone Repository (सब को यह करना है)

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/college_final_project.git

# Go to folder
cd college_final_project

# Install dependencies
npm install

# In backend
cd backend && npm install && cd ..

# In frontend
cd frontend && npm install && cd ..
```

---

## 🚀 Fastest Way: One Command Start

```bash
# Just run this - sabkuch ho jayega!
./start.sh
```

**या (alternatively):**
```bash
chmod +x start.sh ./restart.sh ./stop.sh
./start.sh
```

---

## 📱 After Starting:

1. **Backend Ready:** http://localhost:5001/health
2. **Frontend Ready:** http://localhost:5173/login
3. **Login Credentials:**
   - Email: `admin@govschemes.in`
   - Password: `Admin@12345`

---

## 🔧 What Gets Started:

| Service | Port | Status |
|---------|------|--------|
| Backend | 5001 | ✅ Running |
| Frontend | 5173 | ✅ Running |
| PostgreSQL | 5432 | ✅ Running (Docker) |
| Redis | 6379 | ✅ Running (Docker) |

---

## 🛑 Stop Everything

```bash
./stop.sh
```

---

## 🔄 Restart Everything

```bash
./restart.sh
```

---

## 📊 First Time Setup Checklist

- [ ] Node.js installed?
- [ ] Docker installed?
- [ ] Repository cloned?
- [ ] `npm install` done in backend?
- [ ] `npm install` done in frontend?
- [ ] `./start.sh` executed?
- [ ] Backend responds on http://localhost:5001/health?
- [ ] Frontend opens on http://localhost:5173?
- [ ] Login successful with admin credentials?

---

## ⚠️ Troubleshooting

### Port Already in Use?
```bash
# Automatic - start.sh handles it
./start.sh

# OR Manual:
./stop.sh
sleep 2
./start.sh
```

### Docker Not Working?
```bash
# Start Docker Desktop first
# Then run: ./start.sh
```

### Database Issues?
```bash
# Reset database
docker-compose down
docker volume prune
docker-compose up -d
./start.sh
```

### Dependencies Error?
```bash
cd backend && rm -rf node_modules && npm install && cd ..
cd frontend && rm -rf node_modules && npm install && cd ..
./start.sh
```

---

## 📞 For Help

1. Check `DEPLOYMENT_GUIDE.md`
2. Check `QUICK_COMMANDS.md`
3. Check `PERMANENT_SOLUTION.md`

---

## 🎯 Development Workflow

### Code Changes (Real-time reload)
```bash
# Edit any file in frontend/src or backend/src
# Changes auto-reload - no restart needed!
```

### Backend Testing
```bash
# Test API
curl http://localhost:5001/api/v1/kpis/status/PMAY
```

### Database Changes
```bash
# Update schema
cd backend
npx prisma migrate dev
```

---

## 🚀 Now You're Ready!

**सब अपने PC पर यह चला सकते हो:**
1. Clone करो
2. `./start.sh` चलाओ
3. Dashboard खोलो
4. Enjoy!

---

**Happy Coding! 🎉**

Questions? Check documentation or ask the team lead.
