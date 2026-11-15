# Centralized Government Scheme Analytics Dashboard

> A source-attributed analytics dashboard for monitoring reported KPIs across six government scheme families

**Institute:** Swami Keshvanand Institute of Technology, Management & Gramothan  
**Project ID:** 2026-27-CC-13<br>
**Status:** Core dashboard and source integrations are deployed to Render. Production KPI observations are retained only when they match configured official source records. Source freshness and geographic coverage vary by scheme.
**Academic Session:** 2026–27

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
- Supports comparisons and exploratory forecasts only when adequate historical source data exists
- Exports reports in multiple formats

The connected Open Government Data resources are not all live feeds and do not all contain district or village fields. The dashboard therefore presents source-reported data with its reporting period and coverage; it must not be interpreted as a real-time feed or as complete village-level coverage. Synthetic demo seed data is disabled for production and has been removed from the live database.

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

These are six scheme families, with PMAY represented by separate PMAY-G and PMAY-U sources. The configured feeds do not provide real-time data for all schemes or a currently integrated village-level KPI. The OGD catalog lists an NRLM village-wise SHG/member resource, but its API field schema and location mapping have not yet been verified for ingestion. Unmatched geographies are not guessed; those records are excluded from geographic aggregates and reported in import results. PMGSY and MGNREGS district names are provisioned only from their source rows, without fabricated area or boundary data. A partial import is not complete national coverage.

### Refresh behavior

The configured feeds are historical snapshots or otherwise have no verified source update cadence. A local macOS LaunchAgent polls them every seven days and imports any available source records into Neon. Install it from the repository root with `cd backend && ./scripts/install-local-sync-agent.sh`; it requires `backend/.env.real-data` and a logged-in Mac with network access to data.gov.in. If the Mac is asleep when an interval elapses, launchd runs the missed job after wake. Run an immediate manual refresh with `cd backend && npm run sync:official`.

Render and GitHub-hosted runners cannot currently reach the data.gov.in API, so the scheduled importer runs on the configured local Mac. The weekly interval is only a polling cadence, not a promise that sources update weekly; source report dates and geography limits remain as documented above. Dashboard values should not be described as real-time.

To audit an existing database for generated demo records, run `cd backend && npm run purge:synthetic -- --env-file=.env.real-data`. This is a dry run by default. Applying the cleanup requires both `--apply` and `--confirm-production-cleanup`; it preserves KPI observations only when their dates and values match a configured source field in the raw imported record.

---

## Team modules

These are the assignments from the final SRS v2.1 Form-2. They describe each member's planned project area; GitHub's contributor graph is separate and should not be read as proof of individual work.

| Member | GitHub | Form-2 role and module |
|---|---|---|
| Divyansh Tak (23ESKIT047) | [Dev182004](https://github.com/Dev182004) | Backend and APIs — User Authentication & Role Management |
| Chetanya Prakash Sharma (23ESKIT040) | [chetanyasharma2003](https://github.com/chetanyasharma2003) | Testing and Integration — Testing & Report Generation |
| Chitransh Jain (23ESKIT042) | [Chitransh0206](https://github.com/Chitransh0206) | Frontend Development — Dashboard & Data Visualization |
| Harshit Narayan Tripathi (23ESKIT057) | [harshittripathi274-ctrl](https://github.com/harshittripathi274-ctrl) | Database and Analytics — Scheme, State & KPI Data Management |

Form-2 assigns profile management and report-generation APIs to Divyansh; KPI reports, monitoring, and API testing/documentation to Chetanya; dashboard view, trend charts, and responsive UI to Chitransh; and filtering, caching, and KPI data entry to Harshit. The practical report split is API implementation by Divyansh and report testing/validation by Chetanya.

To show who did specific work, use each person's actual pull requests, commits, review comments, test records, and demo. The table above records role assignments, not commit-level authorship. See [WORK_UPDATE.md](./WORK_UPDATE.md) for the repository attribution caveat and [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment notes.

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
│  (Structured     │  │  (Selected public│
│   Data)          │  │   GET responses) │
└──────────────────┘  └──────────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│    External Data Sources                            │
│       Configured data.gov.in resources             │
│       → Import and source-mapped records            │
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
Redis                    # Optional cache for selected public GET requests
Node.js timer scheduler  # Optional scheduled syncs; currently disabled for configured sources
JWT                      # Authentication
```

### DevOps & Deployment
```
Docker + Docker Compose  # Containerization
GitHub                   # Version control
GitHub Actions           # CI/CD
Render                   # Current frontend and backend hosting
Neon PostgreSQL           # Production database
Redis                    # Optional response cache; production availability is unverified
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
# Clone the project
git clone https://github.com/chetanyasharma2003/college_final_project.git
cd college_final_project

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
college_final_project/
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level components
│   │   ├── store/               # Redux state management
│   │   ├── api/                 # API client & hooks
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
│   │   ├── config/              # Configuration
│   │   └── index.js
│   ├── tests/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # SQL migrations
│   └── .env.example
│
├── docker-compose.yml           # Docker configuration
├── .env.example                 # Environment template
├── .gitignore
├── README.md                    # Project overview and source coverage
├── DEPLOYMENT.md                # Current production deployment
├── DOCKER_README.md             # Local Docker Compose setup
└── WORK_UPDATE.md               # Current project handoff
```

---

## 📚 Documentation

- **[DOCKER_README.md](./DOCKER_README.md)** - Local Docker Compose setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Current Render production deployment
- **[WORK_UPDATE.md](./WORK_UPDATE.md)** - Current progress, verification and limitations

---

## Current implementation status

The application is deployed on Render and includes dashboards, source-based filters, comparisons, reports, and administration tools. Source refresh, geographic coverage, and some verification work remain limited; see [WORK_UPDATE.md](./WORK_UPDATE.md) for the latest recorded status.

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
# From the project root: frontend build, frontend tests, then backend tests
npm test

# Run one package separately
cd frontend && npm test
cd backend && npm test
```

The repository does not currently define test coverage or watch-mode scripts.

---

## 📊 Database

**PostgreSQL 16** with schema for:
- User management & authentication
- Scheme & KPI definitions
- Geographic tables for states, districts, blocks, and villages; current source data populates state/district levels only
- Reported KPI values with timestamps
- Scheme-specific data (PMAY, MGNREGS, etc.)
- Exploratory predictions and forecasts, subject to adequate historical data
- Reports & exports
- Audit logs

Database backups and restore procedures depend on the configured Neon account; this repository does not contain a verified production backup/restore runbook. For local migrations and checks, use the commands in the Quick Start and Testing sections.

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

### Team and project records

Use the approved Form-2 table for member modules. Record completed work and verification in [WORK_UPDATE.md](./WORK_UPDATE.md); do not treat untested performance targets or unverified source coverage as achieved results.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🚀 Release Status and Remaining Limits

The current Render frontend and backend are deployed. The latest recorded production checks confirmed backend health with Neon connected, source-mapped scheme and geography APIs, the frontend, and authenticated dashboard, monitoring, and report flows. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the active URLs and [WORK_UPDATE.md](./WORK_UPDATE.md) for the detailed verification record.

Official-source imports run weekly from the configured local Mac LaunchAgent because Render and GitHub-hosted runners could not reach data.gov.in. The LaunchAgent requires this Mac to be logged in and online. This is a polling interval, not an official source update schedule. Source freshness remains limited to the dates reported by each configured feed; the NRLM village-wise resource is not integrated because its schema and location mapping are unverified.

---

**Last Updated:** November 4, 2026
**Status:** Core dashboard is deployed. Source freshness and geographic coverage vary by feed; see the handoff for the latest recorded verification.
