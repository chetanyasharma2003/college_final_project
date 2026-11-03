# 🐳 Government Schemes Analytics Dashboard — Docker Compose

> This guide describes the local Docker Compose setup. Production is deployed separately on Render; see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## ✨ What's Inside

The Compose stack runs the application with local PostgreSQL and Redis containers. It is for local development and evaluation; it does not create a production deployment or import the official source snapshots automatically.

### 🏢 Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Your Application                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │  │  Database    │   │
│  │  (React)     │  │  (Express)   │  │ (PostgreSQL) │   │
│  │  Port 5173   │  │  Port 5001   │  │  Port 5432   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Redis Cache (Port 6379)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 📦 Services
- **PostgreSQL** - Data persistence
- **Redis** - Session & KPI caching
- **Node.js API** - Express backend with ML/Analytics
- **React Frontend** - Vite + interactive dashboard

---

## 🚀 Getting Started

### 1. Configure local secrets

Copy the root environment template and set a strong local database password plus two different random JWT secrets:

```bash
cp .env.example .env
```

### 2. Start the containers

```bash
docker compose up -d --build
```

### 3. Apply database migrations

```bash
docker compose exec backend npm run migrate
```

### 4. Open the application

```
http://localhost:5173
```

There is no default admin account or shared demo password. Use the available account registration flow, or provision an account through your local development setup.

---

## 🛑 Stop Everything

```bash
docker compose down
```

### Clean Fresh Start (Deletes All Data)
```bash
docker compose down -v
docker compose up -d
```

---

## 📊 Service Status

Check if everything is running:

```bash
docker compose ps
```

Expected output:
```
SERVICE     STATUS
backend     Up ... (healthy)
frontend    Up ... (healthy)
postgres    Up ... (healthy)
redis       Up ... (healthy)
```

---

## 📚 Documentation

### References
- **Project status and source coverage** → [README.md](./README.md)
- **Production endpoints and setup** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Current handoff and verification record** → [WORK_UPDATE.md](./WORK_UPDATE.md)
- **Database schema** → `backend/prisma/schema.prisma`

---

## 🔍 View Logs

### All Logs
```bash
docker compose logs -f
```

### Specific Service
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

---

## 🔗 Endpoint Reference

### Frontend
- **Dashboard**: http://localhost:5173
- **Health**: http://localhost:5173/ (should load)

### Backend API
- **Base URL**: http://localhost:5001/api/v1
- **Health Check**: http://localhost:5001/health
- **Schemes**: http://localhost:5001/api/v1/schemes
- **KPIs**: http://localhost:5001/api/v1/kpis

### Database (Internal)
- **PostgreSQL**: `postgres://govschemes:<set-strong-db-password>@postgres:5432/gov_schemes`
- **Redis**: `redis://redis:6379`

---

## 🔧 Configuration

Compose reads the root `.env` file. The required local values are:

```yaml
DB_PASSWORD=<strong-local-password>
JWT_SECRET=<random-secret-at-least-32-characters>
JWT_REFRESH_SECRET=<different-random-secret-at-least-32-characters>
```

The `.env` file is ignored by Git. Do not use production credentials in a local Compose environment.

---

## 🎯 Features & Data

### Application surfaces
- [x] Dashboard with source-reported KPI observations and reporting dates
- [x] 6 Government schemes (PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, SAGY)
- [x] Authentication & role-based access
- [x] Geographic analytics at source-supported levels (state and district for current feeds)
- [x] Interactive visualizations (Recharts)
- [x] Analytics and comparative views
- [x] Report generation & export
- [x] Prediction and chatbot API surfaces
- [x] Redis caching for performance
- [x] Database persistence
- [x] Production-grade error handling

### Data behavior

The Compose database is separate from production and starts without the production Neon data. Apply migrations before using it. Official source snapshots are not imported by `docker compose up`; the configured weekly importer runs on the designated Mac and writes to Neon. Current source dates and geographic coverage vary by scheme, and no village KPI observations are configured.

### 🎨 Frontend
- Responsive dashboard
- KPI cards with status indicators
- Interactive charts & graphs
- Geographic maps
- Report builder
- User-friendly UI

### ⚙️ Backend
- RESTful API (50+ endpoints)
- JWT authentication
- RBAC (role-based access control)
- ML/Analytics engine
- Report generation
- Data caching
- Circuit breaker pattern
- Request deduplication
- Graceful error handling

---

## 🚦 Health Checks

All services have built-in health checks:

```bash
# Check backend health
curl http://localhost:5001/health

# Check frontend (should return HTML)
curl http://localhost:5173

# Check if containers are healthy
docker compose ps
```

---

## 📈 Performance and Operations

The Docker Compose file includes PostgreSQL, Redis, and container health checks. No load-test results or capacity guarantees are recorded for this setup. Use `docker compose logs -f` and `docker compose ps` to inspect the local services.

---

## 🔐 Security

### Authentication
- [x] JWT token-based auth
- [x] Secure password hashing
- [x] Session management
- [x] CORS protection
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection

### Best Practices
- Environment variables for secrets
- Role-based access control
- Input validation & sanitization
- Error handling without exposing internals
- Audit logging for compliance

---

## 🛠️ Troubleshooting

### Issue: Port Already in Use
```bash
docker compose down
docker compose up -d
```

### Issue: Database Connection Failed
```bash
# Check if database is healthy
docker compose ps

# Restart database
docker compose restart postgres
```

### Issue: Backend keeps restarting
```bash
# Check logs
docker compose logs backend

# Rebuild
docker compose down -v
docker compose build --no-cache backend
docker compose up -d
```

### Issue: Frontend not loading
```bash
# Check frontend logs
docker compose logs frontend

# Restart frontend
docker compose restart frontend
```

### Issue: Data not persisting
```bash
# Data persists in volumes by default
# To delete all data:
docker compose down -v
docker compose up -d
```

---

## 📦 Volumes & Persistence

Data is automatically persisted:

```bash
docker volume ls | grep gov-schemes

# Volumes:
# gov-schemes_postgres_data    - Database
# gov-schemes_redis_data       - Cache
```

**Cleanup all data:**
```bash
docker compose down -v
```

---

## 🔄 Development Workflow

### Make Code Changes
```bash
# Edit frontend/src/... or backend/src/...
# Changes reload automatically (no rebuild needed)
```

### Rebuild After Dependency Changes
```bash
docker compose build backend
docker compose restart backend
```

### Database Migrations
```bash
# Run migrations
docker compose exec backend npx prisma migrate deploy

# Create new migration
docker compose exec backend npx prisma migrate dev --name your_migration_name
```

---

## 🚀 Production Deployment

Production currently uses the Render frontend and backend with Neon PostgreSQL, not this local Compose stack. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the active endpoints, configuration, and known operational limits.

---

## 📞 Support & Help

### Quick Answers
- Start local services: `docker compose up -d`
- Stop local services: `docker compose down`
- View service status: `docker compose ps`
- View logs: `docker compose logs`

### For Developers
- Backend: See `backend/src/` and `backend/prisma/schema.prisma`
- Frontend: See `frontend/src/components/` and `frontend/src/pages/`

### Documentation Files
- Project overview and official-source coverage: [`README.md`](./README.md)
- Current Render deployment: [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- Current progress and verified handoff: [`WORK_UPDATE.md`](./WORK_UPDATE.md)

---

## 🎓 Learning Resources

### Architecture & Design
- Docker Compose: https://docs.docker.com/compose/
- Node.js + Express: https://expressjs.com/
- React: https://react.dev/
- Prisma ORM: https://www.prisma.io/docs/
- PostgreSQL: https://www.postgresql.org/docs/

### Frontend Stack
- Vite: https://vitejs.dev/
- React Router: https://reactrouter.com/
- Redux Toolkit: https://redux-toolkit.js.org/
- Tailwind CSS: https://tailwindcss.com/
- Recharts: https://recharts.org/

### Backend Stack
- Express.js: https://expressjs.com/
- Node.js: https://nodejs.org/docs/
- JWT: https://jwt.io/
- Redis: https://redis.io/

---

## 🔐 Production Notes

- Production secrets are configured privately in their hosting providers and must not be copied into `.env` or committed.
- Source imports are best-effort weekly polling from the configured Mac. The polling interval is not a source update guarantee.
- Review [WORK_UPDATE.md](./WORK_UPDATE.md) for the latest import, deployment, and verification record.

---

## 📈 Monitoring

### Current Logs
```bash
docker compose logs
```

### For Production
Set up:
- Application monitoring (New Relic, DataDog)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Uptime monitoring (Uptime Robot)
- Performance monitoring (APM)

---

## 📝 Current Status

This file documents how to run the local Compose configuration; it does not assert that containers are running or that this configuration has passed a separate production-readiness review. Last reviewed: 3 November 2026.

---

## 🚀 Next Steps

1. Configure `.env` with local-only secrets.
2. Start the containers and apply migrations.
3. Use the local dashboard at http://localhost:5173.
4. Consult [DEPLOYMENT.md](./DEPLOYMENT.md) for production status and limits.

---

For project or deployment status, use the linked README and handoff above.
