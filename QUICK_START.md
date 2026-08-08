# Quick Start Guide (5 Minutes)

For developers who want to get running immediately.

## Copy-Paste Setup

```bash
# 1. Navigate to project
cd ~/Documents/college_final_project

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env (change DB_PASSWORD and JWT_SECRET)
nano .env
# OR
open .env  # macOS

# 4. Start containers (PostgreSQL + Redis)
docker-compose up -d

# 5. Install backend
cd backend
npm install
npm run migrate
cd ..

# 6. Install frontend
cd frontend
npm install
cd ..

# 7. Start development servers (open 2 terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 8. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api/v1
# Health Check: http://localhost:5000/health
```

## Verify It Works

```bash
# In a new terminal, test API
curl http://localhost:5000/health

# Should respond:
# {"status":"ok","timestamp":"...","uptime":...}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `docker-compose: command not found` | Install Docker Desktop |
| `npm: command not found` | Install Node.js 18+ |
| `Port 5000 already in use` | `lsof -ti:5000 \| xargs kill -9` |
| `Database connection error` | Check `docker-compose ps` is showing postgres as running |
| `Cannot find module 'express'` | Run `npm install` from correct directory |

## File Locations

- **Backend:** `backend/src/`
- **Frontend:** `frontend/src/`
- **Config:** `.env` (create from `.env.example`)
- **Database Schema:** `backend/prisma/schema.prisma`
- **Docker:** `docker-compose.yml`

## Key Commands

```bash
# Backend
npm run dev          # Start dev server
npm run migrate      # Run migrations
npm test             # Run tests
npm run lint         # Check code

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose logs -f    # View logs
```

## Default Credentials

```
Database:
- Host: localhost
- Port: 5432
- User: govschemes
- Password: (from .env file)
- Database: gov_schemes_analytics

Redis:
- Host: localhost
- Port: 6379
```

## Full Documentation

See [SETUP.md](./SETUP.md) for detailed step-by-step guide.

---

**Got stuck?** Read SETUP.md or check server logs: `docker-compose logs`
