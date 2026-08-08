# Development Environment Setup Guide

Complete step-by-step guide to set up the Government Schemes Analytics Dashboard for local development.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v18+
  npm --version   # Should be v9+
  ```

- **Git** ([Download](https://git-scm.com/))
  ```bash
  git --version
  ```

- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
  ```bash
  docker --version
  docker-compose --version
  ```

- **PostgreSQL Client** (optional, for direct DB access)
  ```bash
  psql --version  # macOS: brew install postgresql
  ```

### System Requirements
- **RAM:** Minimum 4GB
- **Disk Space:** Minimum 5GB
- **Network:** Internet access required for initial setup

---

## 🚀 Step 1: Clone Repository (When Ready)

```bash
# When GitHub repo is created, clone it
git clone https://github.com/yourusername/gov-schemes-analytics.git
cd gov-schemes-analytics

# Verify structure
ls -la
# Should see: frontend/, backend/, docs/, docker-compose.yml, README.md, etc.
```

---

## ⚙️ Step 2: Environment Configuration

### Copy Environment Template

```bash
# From project root
cp .env.example .env

# Verify file created
cat .env
```

### Edit .env File

```bash
# Using nano editor (macOS/Linux)
nano .env

# Or using VS Code
code .env
```

### Critical Configuration

Set these variables in `.env`:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=govschemes
DB_PASSWORD=your_secure_password_here  # Change this!
DB_NAME=gov_schemes_analytics
DATABASE_URL=postgresql://govschemes:your_secure_password_here@localhost:5432/gov_schemes_analytics

# Security - Generate new secrets!
# Option 1: Use Node.js
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_random_secret_32_chars_minimum
JWT_REFRESH_SECRET=your_generated_random_refresh_secret_32_chars_minimum

# Environment
NODE_ENV=development
PORT=5000

# Frontend URL
VITE_API_URL=http://localhost:5000/api/v1
```

**⚠️ Important:**
- Never commit `.env` to Git
- Use strong passwords for production
- Generate JWT secrets with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 🐳 Step 3: Start Database Services

### Start Docker Containers

```bash
# From project root (where docker-compose.yml is)
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Expected output:
```
NAME                    STATUS
gov-schemes-db          Up X seconds
gov-schemes-cache       Up X seconds
```

### Check Database Connection

```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready

# Test Redis connection
docker-compose exec redis redis-cli ping
# Expected: PONG
```

### View Container Logs

```bash
# All containers
docker-compose logs

# Specific service
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f
```

### Troubleshooting Docker

```bash
# Restart containers
docker-compose restart

# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ Deletes data!)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

---

## 📦 Step 4: Install Backend Dependencies

```bash
# Navigate to backend
cd backend

# Install Node dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected packages should include:
- express
- prisma
- @prisma/client
- jsonwebtoken
- node-cron
- etc.

---

## 📦 Step 5: Install Frontend Dependencies

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected packages should include:
- react
- react-router-dom
- @reduxjs/toolkit
- recharts
- vite
- etc.

---

## 🗄️ Step 6: Database Setup

### Initialize Database

```bash
# From backend directory
npm run migrate

# Expected output:
# - Prisma schema loaded
# - Migrations applied
# - Database initialized
```

### Seed Initial Data (Optional)

```bash
# Add sample data for testing
npm run seed

# Expected output:
# - States created
# - Districts created
# - Sample schemes created
# - KPI definitions created
```

### Verify Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U govschemes -d gov_schemes_analytics

# List tables
\dt

# Check record counts
SELECT COUNT(*) FROM "State";

# Exit
\q
```

---

## 🎯 Step 7: Start Development Servers

### Terminal 1: Start Backend

```bash
# From project root
cd backend

# Start development server with nodemon (auto-reload on file changes)
npm run dev

# Expected output:
# ╔════════════════════════════════════════╗
# ║ Government Schemes Analytics Backend   ║
# ║ Listening on port 5000                 ║
# ║ Environment: development               ║
# ║ API Base: http://localhost:5000/api/v1 ║
# ╚════════════════════════════════════════╝
```

### Terminal 2: Start Frontend

```bash
# From project root
cd frontend

# Start Vite development server with HMR
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  Press h to show help
```

---

## ✅ Step 8: Verification

### Check Backend

```bash
# In a new terminal
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2026-08-08T...","uptime":123.456}
```

### Check API

```bash
curl http://localhost:5000/api/v1

# Expected response:
# {
#   "message": "Government Schemes Analytics API v1",
#   "version": "1.0.0",
#   "endpoints": { ... }
# }
```

### Check Frontend

Open browser to: http://localhost:5173

Expected: Vite app loads (may show "Not Found" page until routes are built)

---

## 📚 Step 9: Development Workflow

### File Structure to Remember

```
Backend: backend/src/
├── index.js           # Server entry point
├── routes/            # API endpoints (to be created)
├── services/          # Business logic (to be created)
├── middleware/        # Auth, validation (to be created)
├── models/            # Prisma models (schema.prisma)
└── migrations/        # Database migrations

Frontend: frontend/src/
├── App.jsx            # Root component
├── main.jsx           # Entry point
├── pages/             # Page components (to be created)
├── components/        # Reusable components (to be created)
├── store/             # Redux state (to be created)
├── api/               # API clients (to be created)
└── App.css            # Styles
```

### Common Development Tasks

```bash
# Format code with Prettier
npm run format

# Lint code for errors
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Database Migrations

```bash
# Create new migration after schema changes
npx prisma migrate dev --name add_new_table

# View migration history
npx prisma migrate status

# Reset database (⚠️ Deletes all data!)
npx prisma migrate reset
```

### Update Prisma Schema

1. Edit `backend/prisma/schema.prisma`
2. Run: `npx prisma db push` (sync with existing DB)
3. Or: `npx prisma migrate dev --name describe_change`
4. Restart server: `npm run dev`

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9  # macOS/Linux
```

### Database Connection Error

```bash
# Check if containers running
docker-compose ps

# Check logs
docker-compose logs postgres

# Reconnect
docker-compose restart postgres

# Verify connection string in .env matches container config
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
rm -rf dist build .next

# Rebuild
npm run build
```

### Prisma Errors

```bash
# Generate Prisma client
npx prisma generate

# Sync schema with database
npx prisma db push

# View studio (visual database explorer)
npx prisma studio
```

---

## 🔍 Useful Debugging Tools

### Prisma Studio (Visual DB Explorer)

```bash
# Open interactive database explorer
cd backend
npx prisma studio

# Opens at http://localhost:5555
```

### Check Database Schema

```bash
# View generated Prisma client type definitions
cat backend/node_modules/@prisma/client/index.d.ts
```

### Monitor API Calls

```bash
# Install Postman or use VS Code REST Client
# Create file: requests.http
GET http://localhost:5000/health

# Or use curl
curl -X GET http://localhost:5000/api/v1
```

---

## 🧪 Quick Test Workflow

After setup, verify everything works:

```bash
# 1. Check health
curl http://localhost:5000/health

# 2. Check frontend loads
# Open http://localhost:5173 in browser

# 3. Check database
docker-compose exec postgres psql -U govschemes -d gov_schemes_analytics -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';"

# 4. Run a quick API call (when auth endpoints ready)
# Will demonstrate in Phase 2
```

---

## 📖 Next Steps

1. ✅ **Local setup complete!**
2. **Next:** Implement authentication system (Phase 2)
3. **Then:** Build data integration module (Phase 3)
4. **Finally:** Create dashboard visualizations (Phase 4)

---

## 📞 Help & Support

### Common Issues Checklist

- [ ] Docker running? `docker-compose ps`
- [ ] Ports free? (5000, 5173, 5432, 6379)
- [ ] .env configured? `cat .env | grep DATABASE_URL`
- [ ] Dependencies installed? `ls backend/node_modules | wc -l`
- [ ] Database seeded? `psql ... -c "SELECT COUNT(*) FROM state;"`

### Get Help

1. Check logs: `docker-compose logs`
2. Check file: `backend/src/index.js` for server errors
3. Browser console: `F12` → Console tab for frontend errors
4. Ask teammates on team channel

---

## 🎯 Success Criteria

Setup is complete when:

✅ Backend running on http://localhost:5000  
✅ Frontend running on http://localhost:5173  
✅ PostgreSQL container running  
✅ Redis container running  
✅ Can make API calls: `curl http://localhost:5000/health`  
✅ Database connected: `npm run migrate` succeeds  
✅ No critical errors in terminal logs  

---

**Last Updated:** August 8, 2026  
**Version:** 1.0  
**Status:** Phase 1 Setup Complete ✅
