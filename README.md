# Centralized Government Scheme Analytics Dashboard

> A source-attributed analytics dashboard for monitoring reported KPIs across six government scheme families

**Institute:** Swami Keshvanand Institute of Technology, Management & Gramothan  
**Project ID:** 2026-27-IT  
**Status:** Core dashboard and source integrations are implemented; production release checks remain pending. Source freshness and geographic coverage vary by scheme.
**Timeline:** 16 weeks (12-14 weeks full-time)  

---

## 🎯 Project Overview

### Problem
Government scheme data is scattered across multiple sources, making it difficult for administrators, analysts, and decision-makers to:
- Track reported scheme performance with source-specific freshness
- Identify underperforming areas
- Make data-driven decisions
- Compare performance across regions

### Solution
Build a **centralized analytics dashboard** that:
- Integrates data from 6 government schemes
- Calculates and tracks source-backed KPIs at the geographic levels provided by each dataset
- Provides interactive visualizations (charts, heatmaps, maps)
- Generates comparative analysis & forecasts
- Exports reports in multiple formats

The connected Open Government Data resources are not all live feeds and do not all contain district or village fields. The dashboard therefore presents historical source-reported data with its reporting period and coverage; it must not be interpreted as a real-time feed or as complete village-level coverage.

### Target Users
- Government officials & administrators
- Data analysts & researchers
- Policymakers & decision-makers
- NGOs tracking scheme effectiveness

---

## 📊 Government Schemes Covered

1. **PMAY** - Pradhan Mantri Awas Yojana (PMAY-G and PMAY-U are separate sources)
2. **MGNREGS** - Mahatma Gandhi National Rural Employment Guarantee Scheme
3. **PMGSY** - Pradhan Mantri Gram Sadak Yojana (Rural Roads)
4. **NRLM** - National Rural Livelihood Mission
5. **DDU-GKY** - Deen Dayal Upadhyaya Grameen Kaushalya Yojana (Skill Development)
6. **SAGY** - Sansad Adarsh Gram Yojana (Model Villages)

### Verified source coverage

| Scheme source | Verified metric coverage | Geographic coverage and freshness |
|---|---|---|
| PMAY-G | [Eligible beneficiaries who availed the specified loan](https://www.data.gov.in/resource/stateuts-wise-number-eligible-beneficiaries-pradhan-mantri-awaas-yojana-gramin-pmay-g-pmay) | Historical state snapshot; source data cutoff is not stated |
| PMAY-U | [Houses sanctioned, completed, and occupied](https://www.data.gov.in/resource/stateut-wise-number-houses-sanctioned-completed-and-occupied-under-pmay-u-and-pmay-u-20-22) | State/UT snapshot as of 22 January 2026 |
| MGNREGS | [Cumulative job cards issued](https://www.data.gov.in/resource/job-cards-issued-under-mgnregs-inception-10th-jan-2022) | Karnataka district snapshot through 10 January 2022; not person-days or current employment |
| PMGSY | [Physical and financial progress across PMGSY-I, II, and III](https://www.data.gov.in/resource/physical-financial-progress-pradhan-mantri-gram-sadak-yojna-pmgsy-date) | District data; API update date is known, but its exact record-level reporting cutoff is not. District areas and boundaries are not supplied |
| NRLM | [State/UT funds allocation for FY 2021-22 to FY 2023-24](https://www.data.gov.in/resource/stateut-wise-details-funds-allocation-under-national-rural-livelihoods-mission-nrlm-2021) | Historical; source does not specify the monetary unit |
| DDU-GKY | [Candidates trained and placed for FY 2020-21 to FY 2023-24](https://www.data.gov.in/resource/state-wise-details-candidates-trained-and-placed-under-ddu-gky-2020-21-2023-24) | Historical state/UT annual counts |
| SAGY | [Gram Panchayats identified under Phases I-IV](https://www.data.gov.in/resource/stateut-wise-gram-panchayats-identified-under-saansad-adarsh-gram-yojana-sagy-sagy-website) | State/UT snapshot as of 3 March 2020 |

These are six scheme families, with PMAY represented by separate PMAY-G and PMAY-U sources. No verified source currently supports real-time data for all schemes or village-level KPIs. Unmatched geographies are not guessed; those records are excluded from geographic aggregates and reported in import results. PMGSY and MGNREGS district names are provisioned only from their source rows, without fabricated area or boundary data. A partial import is not complete national coverage.

### Refresh behavior

The configured feeds are historical snapshots or otherwise have no verified automatic refresh schedule. Scheduled imports are disabled: every configured source has no sync frequency, and the backend scheduler is off unless `ENABLE_DATA_SYNC_SCHEDULER=true` is set. Setting that flag alone does not schedule these feeds. To refresh the configured snapshots manually, provide the private database and data.gov.in settings in `backend/.env.real-data`, then run `cd backend && npm run sync:official`. The Render deployment does not currently run scheduled source imports; dashboard values should not be described as real-time.

---

## 👥 Team & Responsibilities

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Divyansh Tak** | Backend Lead | Backend API, AI/ML Predictions, Chatbot |
| **Chetanya Sharma** | Backend Developer | Data Integration, ETL, API, Database |
| **Chitransh Jain** | Frontend Lead | Dashboard UI, Analytics, Visualizations |
| **Harshit Tripathi** | DevOps/QA | Deployment, Documentation, Testing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React 18 + Vite)                  │
│  Dashboard | Analytics | Comparisons | Reports     │
└──────────────────┬──────────────────────────────────┘
                   │
            REST APIs (/api/v1)
                   │
┌──────────────────▼──────────────────────────────────┐
│       Backend (Node.js + Express)                   │
│  Auth | KPI | Analytics | Predictions | Reports    │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼──────────┐  ┌──────▼────────────┐
│  PostgreSQL      │  │  Redis Cache     │
│  (Structured     │  │  (Sessions,      │
│   Data)          │  │   KPI Cache)     │
└──────────────────┘  └──────────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│    External Data Sources                            │
│  data.gov.in | Government APIs | CSV Upload        │
│  → ETL Pipeline → Manual Import → DB Updates       │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Frontend
```
React 18 + Vite          # Framework & build tool
Tailwind CSS             # Styling
React Router v6          # Routing
Redux Toolkit            # State management
Recharts                 # Charting library
Leaflet                  # Maps & geospatial
Axios                    # HTTP client
```

### Backend
```
Node.js 18+              # Runtime
Express.js               # Web framework
Prisma ORM               # Database ORM
PostgreSQL 16            # Database
Redis                    # Caching layer
Node.js timer scheduler  # Optional scheduled syncs; currently disabled for configured sources
JWT                      # Authentication
```

### DevOps & Deployment
```
Docker + Docker Compose  # Containerization
GitHub                   # Version control
GitHub Actions           # CI/CD
Render                   # Current frontend and backend hosting
Vercel                   # Optional alternate frontend host
AWS RDS / Heroku DB      # Production database
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm/pnpm
- Docker & Docker Compose
- Git
- PostgreSQL 16 (or Docker)

### 1. Clone & Setup

```bash
# Clone repository (will be done after GitHub setup)
git clone https://github.com/yourusername/gov-schemes-analytics.git
cd gov-schemes-analytics

# Install backend dependencies
cd backend
npm ci

# Install frontend dependencies
cd ../frontend
npm ci

# Return to root
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env with your values
nano .env
```

**Key variables to set:**
```bash
DB_PASSWORD=replace-with-a-strong-local-password
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-a-different-random-secret-at-least-32-characters
NODE_ENV=development
```

### 3. Start Infrastructure (PostgreSQL)

```bash
# Start Docker containers
docker-compose up -d

# Verify containers are running
docker-compose ps
# Expected: postgres should be 'running'
```

### 4. Database Setup

```bash
# Run database migrations
cd backend
npm run migrate

# Optional synthetic demo users/data for local development only. Never use as official scheme data.
ALLOW_SYNTHETIC_SEED=true SEED_ADMIN_PASSWORD='your-admin-password' SEED_ANALYST_PASSWORD='your-analyst-password' npm run seed

cd ..
```

To load only the configured state/UT reference names without sample geography or synthetic KPIs, run from the repository root:

```bash
node backend/scripts/seed-india.js --geography-only
```

### 5. Start Development Servers

```bash
# Start both development servers from the project root
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5001
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001/api/v1
- **Backend health:** http://localhost:5001/health

---

## 📁 Project Structure

```
gov-schemes-analytics/
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level components
│   │   ├── store/               # Redux state management
│   │   ├── api/                 # API client & hooks
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # Express.js backend
│   ├── src/
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth, validation
│   │   ├── models/              # Prisma schemas
│   │   ├── config/              # Configuration
│   │   ├── migrations/          # Database migrations
│   │   ├── jobs/                # Background jobs
│   │   └── index.js
│   ├── tests/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # SQL migrations
│   └── .env
│
├── docs/                        # Documentation
│   ├── SETUP.md                 # Local development guide
│   ├── API.md                   # API documentation
│   ├── DATABASE.md              # Database schema
│   ├── ARCHITECTURE.md          # System design
│   └── DEPLOYMENT.md            # Production setup
│
├── docker-compose.yml           # Docker configuration
├── .env.example                 # Environment template
├── .gitignore
├── README.md                    # This file
└── IMPLEMENTATION_ROADMAP.md    # Detailed development plan
```

---

## 📚 Documentation

- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Detailed 16-week plan with all modules, API endpoints, database schema
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Original project specifications
- **[SETUP.md](./docs/SETUP.md)** - Local development setup guide
- **[DATABASE.md](./docs/DATABASE.md)** - PostgreSQL schema documentation
- **[API.md](./docs/API.md)** - API endpoints reference
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design decisions
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide

---

## 🔄 Development Workflow

### Phase 1: Setup & Architecture (Week 1-2) ✅
- [x] GitHub repository setup
- [x] Development environment configuration
- [x] Database schema design
- [x] Docker setup
- [ ] Backend project initialization
- [ ] Frontend project initialization

### Phase 2: Authentication & User Management (Week 3-4)
- [ ] User registration & login APIs
- [ ] JWT implementation
- [ ] Role-based access control
- [ ] Frontend auth pages

### Phase 3: Data Integration (Week 5-6)
- [ ] CSV upload functionality
- [ ] Data validation & ETL pipeline
- [ ] Cron job scheduler
- [ ] Data import APIs

### Phase 4: KPI Module (Week 7-8)
- [ ] KPI calculation engine
- [ ] Real-time data display
- [ ] KPI trend tracking

### Phase 5: Visualization (Week 9-10)
- [ ] Dashboard with charts
- [ ] Interactive maps (Leaflet)
- [ ] Heatmaps & drill-down

### Phase 6: Analytics (Week 11-12)
- [ ] Comparative analysis
- [ ] Predictions & forecasting
- [ ] Chatbot integration

### Phase 7: Reports (Week 13-14)
- [ ] Report generation (PDF/CSV)
- [ ] Scheduled reports
- [ ] Email delivery

### Phase 8: Testing & Deployment (Week 15-16)
- [ ] Unit & integration tests
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment

---

## 🔐 Security Features

- ✅ JWT authentication with role-gated writes
- ✅ Rate limiting on all endpoints
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Password hashing (bcryptjs)
- ✅ Role-based access control (RBAC)

---

## ✅ Testing

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Frontend
cd frontend
npm test                   # Run tests
npm run test:coverage     # Coverage report
```

---

## 📊 Database

**PostgreSQL 16** with schema for:
- User management & authentication
- Scheme & KPI definitions
- Geographic data (states, districts, blocks, villages)
- Reported KPI values with timestamps
- Scheme-specific data (PMAY, MGNREGS, etc.)
- Predictions & forecasts
- Reports & exports
- Audit logs

**Backup & Migration:**
```bash
# Backup database
pg_dump gov_schemes_analytics > backup.sql

# Restore database
psql gov_schemes_analytics < backup.sql

# Run migrations
# Build the frontend and run backend regression tests
npm test

# Backend tests only
cd backend && npm test

# Frontend production build only
cd frontend && npm run build
# Configure vercel.json
# Deploy
vercel deploy --prod
```

### Backend (Railway/Render)
```bash
# Connect to Railway/Render
# Environment variables configured
# Automatic deploys on push
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

### Code Standards
- Follow ESLint configuration
- Format with Prettier: `npm run format`
- Add tests for new features
- Update documentation

---

## 📞 Support & Resources

### Data Sources
- [data.gov.in](https://www.data.gov.in/)
- PMAY MIS Portal
- MGNREGS Official Website
- Government scheme portals

### Documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [Recharts](https://recharts.org/)
- [Leaflet Maps](https://leafletjs.com/)

### Team Communication
- Internal discussions: [to be set up]
- Issue tracking: GitHub Issues
- Progress updates: Weekly sync

---

## 📈 Success Metrics

By project completion, this system should:

✅ **Functional**
- All 6 schemes integrated & displaying live data
- KPIs calculating correctly & updating on schedule
- Drill-down working to village level
- Comparisons generating accurate insights
- Predictions generating with >75% accuracy
- Chatbot answering >90% of queries correctly

✅ **Performance**
- Dashboard loads in <2 seconds
- API queries respond in <500ms
- Report generation in <5 seconds
- Handle 100+ concurrent users

✅ **Reliability**
- 99.5% uptime
- Automated data imports working
- Proper error handling & logging
- Backup & disaster recovery

✅ **Quality**
- >80% test coverage
- Complete API documentation
- Security audit passed
- Performance optimized

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Project Leads

- **Project Coordinator:** Chetanya Sharma (hs8502097870@gmail.com)
- **Technical Lead:** Divyansh Tak
- **Design Lead:** Chitransh Jain
- **DevOps Lead:** Harshit Narayan Tripathi

---

## 🎯 Remaining Release Work

1. Merge and deploy the latest import/geography changes after CI passes.
2. Confirm production migrations, database health, authentication, dashboard, source monitoring, geography, and report/export flows.
3. Keep refreshes manual until a reachable and reliable scheduled worker is configured.
4. Preserve the source dates and geographic limits listed above in dashboard and report surfaces.

---

**Last Updated:** November 3, 2026
**Status:** Core implementation complete; release and production smoke checks pending.
