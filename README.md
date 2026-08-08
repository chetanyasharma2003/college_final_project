# Centralized Government Scheme Analytics Dashboard

> A comprehensive cloud-based analytics platform for monitoring real-time KPIs across 6 major rural government schemes

**Institute:** Swami Keshvanand Institute of Technology, Management & Gramothan  
**Project ID:** 2026-27-IT  
**Status:** Phase 1 - Setup & Architecture  
**Timeline:** 16 weeks (12-14 weeks full-time)  

---

## 🎯 Project Overview

### Problem
Government scheme data is scattered across multiple sources, making it difficult for administrators, analysts, and decision-makers to:
- Track real-time performance of schemes
- Identify underperforming areas
- Make data-driven decisions
- Compare performance across regions

### Solution
Build a **centralized, real-time analytics dashboard** that:
- Integrates data from 6 government schemes
- Calculates & tracks 50+ KPIs across states/districts/villages
- Provides interactive visualizations (charts, heatmaps, maps)
- Generates comparative analysis & forecasts
- Exports reports in multiple formats

### Target Users
- Government officials & administrators
- Data analysts & researchers
- Policymakers & decision-makers
- NGOs tracking scheme effectiveness

---

## 📊 Government Schemes Covered

1. **PMAY** - Pradhan Mantri Awas Yojana (Housing)
2. **MGNREGS** - Mahatma Gandhi National Rural Employment Guarantee Scheme
3. **PMGSY** - Pradhan Mantri Gram Sadak Yojana (Rural Roads)
4. **NRLM** - National Rural Livelihood Mission
5. **DDU-GKY** - Deen Dayal Upadhyaya Scheme (Skill Development)
6. **SAGY** - Sansad Adarsh Gram Yojana (Model Villages)

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
│  → ETL Pipeline → Cron Jobs → DB Updates           │
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
Node-cron                # Task scheduling
JWT                      # Authentication
```

### DevOps & Deployment
```
Docker + Docker Compose  # Containerization
GitHub                   # Version control
GitHub Actions           # CI/CD
Vercel                   # Frontend hosting
Railway/Render           # Backend hosting
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
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Key variables to set:**
```bash
DB_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Start Infrastructure (PostgreSQL + Redis)

```bash
# Start Docker containers
docker-compose up -d

# Verify containers are running
docker-compose ps
# Expected: postgres and redis should be 'running'
```

### 4. Database Setup

```bash
# Run database migrations
cd backend
npm run migrate

# Seed initial data (optional)
npm run seed

cd ..
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend (from backend/)
cd backend
npm run dev
# Expected: "Server running on port 5000"

# Terminal 2: Start frontend (from frontend/)
cd frontend
npm run dev
# Expected: "Local: http://localhost:5173"
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/v1
- **API Docs:** http://localhost:5000/api/v1/docs (after implementing Swagger)

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

- ✅ JWT authentication with refresh tokens
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

**PostgreSQL 16** with comprehensive schema for:
- User management & authentication
- Scheme & KPI definitions
- Geographic data (states, districts, blocks, villages)
- Real-time KPI values with timestamps
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
cd backend
npm run migrate
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
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

## 🎯 Next Steps

1. **Create GitHub Repository** - Set up repo with this structure
2. **Setup Backend** - Initialize Express server, Prisma, migration system
3. **Setup Frontend** - Initialize React + Vite project
4. **Verify Environment** - Test Docker, database, Redis connection
5. **Start Phase 2** - Begin authentication system implementation

---

**Last Updated:** August 8, 2026  
**Status:** Phase 1 - Setup Complete ✅  
**Next Phase:** Phase 2 - Authentication System
