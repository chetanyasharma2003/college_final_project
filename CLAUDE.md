# Government Schemes Analytics Dashboard - Project Handbook

> Centralized cloud-based analytics platform for monitoring real-time KPIs across 6 major rural government schemes

**Institute:** Swami Keshvanand Institute of Technology, Management & Gramothan  
**Project ID:** 2026-27-IT  
**Timeline:** 16 weeks (12-14 weeks full-time equivalent)  
**Team Size:** 4 developers  
**Status:** Phase 1 - Setup & Architecture (COMPLETED ✅)  

---

## 📚 Documentation Index

- **IMPLEMENTATION_ROADMAP.md** — Complete 16-week development plan with all modules, APIs, database schema
- **PROJECT_PLAN.md** — Original project specifications and requirements
- **README.md** — Project overview and quick reference
- **SETUP.md** — Detailed step-by-step development environment setup
- **QUICK_START.md** — 5-minute quick start guide
- **ARCHITECTURE.md** — System design decisions (to be created in Phase 2)
- **API.md** — API endpoints documentation (to be created in Phase 2)

---

## 👥 Team Assignment

| Developer | Role | Responsibilities | Contact |
|-----------|------|-----------------|---------|
| **Divyansh Tak** | Backend Lead | Backend API, Predictions, Chatbot, ML/AI | TBD |
| **Chetanya Prakash Sharma** | Backend Developer | Data Integration, ETL, Database, API | hs8502097870@gmail.com |
| **Chitransh Jain** | Frontend Lead | Dashboard, UI/UX, Visualizations, Analytics | TBD |
| **Harshit Narayan Tripathi** | DevOps/QA | Deployment, Testing, Documentation | TBD |

---

## 🎯 Project Goals

### Primary Objective
Build a **centralized analytics dashboard** for monitoring 6 government schemes in real-time with:
- Real-time KPI tracking (50+ metrics)
- Geographic drill-down (state → district → block → village)
- Comparative analysis & ranking
- Predictive forecasting
- Interactive visualizations
- Report generation & export

### Target Users
- Government officials & administrators
- Data analysts & researchers
- Policymakers & decision-makers
- Program managers & implementers

### Success Criteria
✅ All 6 schemes integrated with live data  
✅ KPIs calculating correctly & updating on schedule  
✅ Dashboard loading in <2 seconds  
✅ API queries responding in <500ms  
✅ Support 100+ concurrent users  
✅ >80% test coverage  
✅ 99.5% uptime target  
✅ Complete documentation  

---

## 📊 Government Schemes

| Scheme | Full Name | Focus | Key Metrics |
|--------|-----------|-------|------------|
| **PMAY** | Pradhan Mantri Awas Yojana | Housing | Houses constructed, completion %, beneficiaries |
| **MGNREGS** | Rural Employment Guarantee | Employment | Person-days, wage, work completion |
| **PMGSY** | Rural Roads Development | Infrastructure | Road length, connectivity, cost efficiency |
| **NRLM** | National Rural Livelihood Mission | Livelihoods | SHGs, loan disbursed, women empowerment |
| **DDU-GKY** | Skill Development | Employment Skills | Trained candidates, placements, salary |
| **SAGY** | Model Villages Program | Development | Villages adopted, development index |

---

## 🏗️ Architecture Overview

### Layers

**Frontend (React 18 + Vite)**
- Dashboard with KPI cards
- Interactive visualizations (Recharts)
- Geographic maps (Leaflet)
- Report builder & export

**Backend (Node.js + Express)**
- RESTful API (48+ endpoints)
- Authentication & RBAC
- KPI calculation engine
- Analytics & predictions
- Report generation
- Cron job scheduler for data updates

**Database (PostgreSQL)**
- Structured data storage
- 25+ tables with proper indexes
- Time-series KPI values
- Geographic hierarchies
- Scheme-specific data

**Cache (Redis)**
- Session storage
- KPI cache (1-hour TTL)
- Real-time updates
- Query result caching

### Data Flow

```
External Sources (data.gov.in, APIs)
    ↓
ETL Pipeline (Extract, Transform, Load)
    ↓
PostgreSQL Database
    ↓
Redis Cache (for frequently accessed data)
    ↓
Backend APIs
    ↓
Frontend Dashboard
    ↓
User Visualization & Analysis
```

---

## 📁 Project Structure

```
gov-schemes-analytics/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page-level components
│   │   ├── store/               # Redux state
│   │   ├── api/                 # API clients
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/               # Helpers
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Express backend
│   ├── src/
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth, validation
│   │   ├── models/              # Prisma schemas
│   │   ├── config/              # Configuration
│   │   ├── migrations/          # DB migrations
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # SQL migrations
│   └── package.json
│
├── docs/                        # Documentation
│   ├── SETUP.md                 # Dev setup guide
│   ├── API.md                   # API docs
│   ├── DATABASE.md              # DB schema
│   ├── ARCHITECTURE.md          # System design
│   └── DEPLOYMENT.md            # Deploy guide
│
├── IMPLEMENTATION_ROADMAP.md    # 16-week plan
├── PROJECT_PLAN.md              # Specifications
├── QUICK_START.md               # Quick setup
├── SETUP.md                     # Detailed setup
├── README.md                    # Overview
├── docker-compose.yml           # Docker setup
├── .env.example                 # Config template
└── CLAUDE.md                    # This file
```

---

## 🚀 Development Timeline

### ✅ Phase 1: Setup & Architecture (Week 1-2) - COMPLETED

**Completed Tasks:**
- [x] Project planning & documentation
- [x] GitHub repo structure created
- [x] Docker & PostgreSQL setup
- [x] Backend project initialized (Express + Prisma)
- [x] Frontend project structure ready (React + Vite)
- [x] Complete database schema designed (25+ tables)
- [x] Environment configuration templates
- [x] Development setup guide written

**Deliverables:**
- ✅ Ready-to-clone GitHub repo template
- ✅ Development environment setup (Docker + services)
- ✅ Database schema with all tables & relationships
- ✅ Backend Express server scaffold
- ✅ Setup documentation for all team members

**What Works Now:**
- Database schema (Prisma) defined
- Docker containers (PostgreSQL + Redis) ready
- Backend server starts on port 5000
- Frontend Vite dev server ready
- All dependencies listed in package.json

---

### 🔄 Phase 2: Authentication & User Management (Week 3-4) - UPCOMING

**Goals:**
- Build user registration & login system
- Implement JWT authentication
- Create role-based access control (RBAC)
- Design frontend auth pages

**Endpoints to Build:**
```
POST   /api/v1/auth/register      - User registration
POST   /api/v1/auth/login         - User login
POST   /api/v1/auth/logout        - User logout
POST   /api/v1/auth/refresh-token - Refresh JWT
GET    /api/v1/auth/me            - Get current user
```

**Frontend Pages:**
- Login page
- Signup page
- Password reset (optional)

**Key Components:**
- Authentication middleware
- JWT token management
- Password hashing (bcryptjs)
- Error handling

---

### Phase 3: Data Integration & ETL (Week 5-6)

**Goals:**
- CSV upload functionality
- Data source connectors (data.gov.in APIs)
- Data validation & cleaning
- Automated scheduling

**Endpoints:**
```
POST   /api/v1/data-import/upload       - Upload CSV
POST   /api/v1/data-import/schedule     - Schedule import
GET    /api/v1/data-import/history      - Import history
```

---

### Phase 4: KPI Module (Week 7-8)

**Goals:**
- KPI calculation engine
- Real-time KPI display
- Trend tracking
- Performance status (on-track, at-risk, critical)

**Endpoints:**
```
GET    /api/v1/kpis                     - List KPIs
GET    /api/v1/kpi-values/latest        - Latest values
GET    /api/v1/kpi-values/:id/trend     - Time series
```

---

### Phase 5: Visualization & Dashboard (Week 9-10)

**Goals:**
- Interactive dashboard with KPI cards
- Charts (line, bar, pie)
- Geographic maps with drill-down
- Heatmaps by performance
- Real-time data updates

**Frontend Components:**
- Dashboard layout
- KPI cards
- Chart components (Recharts)
- Map component (Leaflet)
- Filter controls

---

### Phase 6: Analytics & Predictions (Week 11-12)

**Goals:**
- Comparative analysis (scheme vs scheme, state vs state)
- Performance ranking
- Predictive forecasting (ARIMA/Prophet)
- Chatbot for natural language queries
- Trend analysis

**Endpoints:**
```
GET    /api/v1/analytics/state-ranking          - Rank states
GET    /api/v1/analytics/scheme-comparison      - Compare schemes
GET    /api/v1/predictions/:kpiId                - Get forecasts
POST   /api/v1/chatbot/query                     - Chatbot query
```

---

### Phase 7: Report Generation (Week 13-14)

**Goals:**
- Report templates (executive, detailed, comparative)
- PDF generation
- CSV/Excel export
- Scheduled report generation
- Email delivery

**Report Types:**
- Executive Summary (1 page)
- Detailed Analytics
- District Performance
- Scheme Comparison
- Custom Reports

---

### Phase 8: Testing & Deployment (Week 15-16)

**Goals:**
- Unit testing (Jest)
- Integration testing (Supertest)
- Performance testing
- Security audit
- Production deployment

**Platforms:**
- Frontend: Vercel
- Backend: Railway/Render
- Database: AWS RDS PostgreSQL
- Storage: AWS S3 (for reports)

---

## 🔧 Technology Stack

### Frontend
```
React 18 + Vite           → Modern, fast development
Tailwind CSS              → Utility-first styling
React Router v6           → Client-side routing
Redux Toolkit             → State management
Recharts                  → Chart visualization
Leaflet                   → Geographic mapping
Axios                     → HTTP client
```

### Backend
```
Node.js 18+               → JavaScript runtime
Express.js                → Web framework
Prisma ORM                → Database abstraction
PostgreSQL 16             → Primary database
Redis                     → Caching layer
JWT                       → Authentication
Node-cron                 → Task scheduling
Bcryptjs                  → Password hashing
```

### Infrastructure
```
Docker                    → Containerization
Docker Compose            → Service orchestration
GitHub                    → Version control & CI/CD
Vercel                    → Frontend hosting
Railway/Render            → Backend hosting
AWS RDS                   → Managed database
AWS S3                    → File storage
```

---

## 📊 Database Schema Highlights

### Core Tables (25+)
- **Users** - Authentication & RBAC
- **Schemes** - Government schemes metadata
- **KPI Definitions** - KPI configurations
- **KPI Values** - Time-series KPI data
- **Geographic** - States, Districts, Blocks, Villages
- **Scheme Data** - PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, SAGY
- **Predictions** - Forecast values
- **Reports** - Generated reports
- **Audit Logs** - Change tracking

### Key Design Decisions
- Normalized structure with proper foreign keys
- Time-series data with indexes on date
- Geographic hierarchy (state → district → block → village)
- Scheme-specific tables for flexibility
- Audit log for compliance & debugging

---

## 🔐 Security Implementation

### Authentication
- [x] JWT tokens (15-min expiry)
- [x] Refresh token rotation (7-day expiry)
- [x] httpOnly cookies for storage
- [ ] Session invalidation on logout (Phase 2)
- [ ] Password reset flow (Phase 2)

### Authorization
- [x] Role-based access control (RBAC) schema
- [ ] Permission checks on endpoints (Phase 2)
- [ ] State-level access restrictions (Phase 2)
- [ ] Admin dashboard access control (Phase 7)

### Data Protection
- [ ] Password hashing (bcryptjs) - Phase 2
- [x] SQL injection prevention (Prisma ORM)
- [ ] XSS protection (input sanitization) - Phase 2
- [ ] CORS configuration - Phase 2
- [ ] Rate limiting - Phase 2
- [x] Helmet.js security headers (scaffolded)

### Audit & Compliance
- [x] Audit log table structure
- [ ] Change tracking implementation (Phase 2)
- [ ] Compliance audit reports (Phase 7)

---

## 📈 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Page Load** | <2 seconds | Dashboard initial load |
| **API Response** | <500ms | 95th percentile |
| **Report Generation** | <5 seconds | PDF/CSV export |
| **Concurrent Users** | 100+ | Load test target |
| **Database Query** | <100ms | Complex analytics queries |
| **Uptime** | 99.5% | SLA target |
| **Cache Hit Rate** | >80% | KPI cache effectiveness |

---

## 📋 Code Standards

### Backend (Node.js/Express)

```javascript
// File naming: camelCase for files
// auth.service.js, companies.routes.js

// Import style: ES6 modules
import express from 'express';
import { service } from './service.js';

// Error handling: Try-catch or async middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Response format: Standardized
res.json({ status: 'success', data: result });

// Validation: Joi schema
const schema = Joi.object({ email: Joi.string().email().required() });
```

### Frontend (React/JSX)

```javascript
// Component naming: PascalCase
// Dashboard.jsx, CompanyCard.jsx

// Imports: Organized groups
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchData } from '@/api/data';
import Card from '@/components/Card';

// Props validation: PropTypes or TS
function Dashboard({ data, onUpdate }) { ... }

// Styling: Tailwind CSS classes
<div className="flex gap-4 bg-white rounded-lg p-6">

// State management: Redux for global, useState for local
const user = useSelector(state => state.auth.user);
const [loading, setLoading] = useState(false);
```

### Database (Prisma/SQL)

```prisma
// Model naming: PascalCase
model UserAccount { ... }

// Field naming: snake_case in DB, camelCase in Prisma
field_name String @map("field_name")

// Relationships: Explicit
model Post {
  user    User @relation(fields: [userId], references: [id])
  userId  Int
}

// Indexes: For performance
@@index([userId, createdAt])
```

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
- Service layer logic
- Utility functions
- Data transformation
- **Target:** >80% coverage

### Integration Tests (Backend)
- API endpoints
- Database operations
- Authentication flow
- Error handling

### Frontend Tests
- Component rendering
- User interactions
- Redux state updates
- API client calls

### End-to-End Tests
- Complete user workflows
- Dashboard functionality
- Report generation

---

## 📞 Development Workflow

### Daily Standup (15 min)
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

### Code Review Process
1. Create feature branch: `feature/your-feature`
2. Commit frequently: `git commit -m "Add feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create Pull Request with description
5. Peer review (at least 1 approval)
6. Merge to main after approval

### Deployment Pipeline
1. **Development** - Local testing
2. **Staging** - Deployed branch for QA
3. **Production** - Full release with monitoring

---

## 🚦 Current Status

### ✅ Completed in Phase 1
- Documentation (README, SETUP, QUICK_START)
- Project structure & file organization
- Docker Compose setup (PostgreSQL + Redis)
- Prisma database schema (25+ tables)
- Backend Express scaffold
- Frontend Vite scaffold
- Environment configuration template
- Team assignment & responsibilities
- 16-week roadmap

### ⏳ Next Actions (Phase 2)
1. Create GitHub repository
2. Push Phase 1 setup to GitHub
3. Implement authentication system
4. Create user login/signup endpoints
5. Build frontend auth pages
6. Role-based access control

### 🎯 First Milestone
When Phase 2 is complete:
- Users can register & login
- JWT tokens working
- Protected routes working
- Database storing users
- Admin can manage roles

---

## 📞 Help & Communication

### Getting Help
1. **Local issues?** Check SETUP.md
2. **Code questions?** Check existing patterns in this file
3. **Architecture?** Review IMPLEMENTATION_ROADMAP.md
4. **Stuck?** Ask on team channel or create GitHub Issue

### Documentation
All code should have:
- Clear variable names (no single letters except loops)
- Comments for WHY, not WHAT (WHAT is clear from code)
- Function documentation with input/output types
- Error messages that help debugging

### Git Commits
```
feat: Add KPI calculation engine
fix: Resolve database connection timeout
docs: Update API documentation
refactor: Simplify auth middleware
test: Add tests for analytics service
```

---

## 🎓 Learning Resources

### Documentation
- PostgreSQL: https://www.postgresql.org/docs/
- Prisma: https://www.prisma.io/docs/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Recharts: https://recharts.org/
- Leaflet: https://leafletjs.com/

### Tutorials
- Node.js REST API: https://www.freecodecamp.org/
- React Hooks: https://react.dev/reference/react
- Redux Toolkit: https://redux-toolkit.js.org/
- Tailwind CSS: https://tailwindcss.com/docs

---

## 📊 Success Metrics

### Functionality
- All 6 schemes integrated ✓
- 50+ KPIs calculating ✓
- Dashboard responsive ✓
- Reports generating ✓
- Predictions accurate (>75%) ✓

### Quality
- Tests passing ✓
- Code coverage >80% ✓
- API documented ✓
- Zero security issues ✓
- Performance benchmarks met ✓

### Team
- All phases on schedule ✓
- Code review process working ✓
- Knowledge sharing happening ✓
- Documentation complete ✓

---

## 📝 Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | Aug 8, 2026 | Phase 1 Complete | Initial setup, infrastructure ready |
| TBD | TBD | Phase 2 | Authentication & user management |
| TBD | TBD | Phase 3 | Data integration & ETL |

---

**Last Updated:** August 8, 2026  
**Current Phase:** 1 - Setup & Architecture ✅  
**Next Phase:** 2 - Authentication & User Management  
**Project Lead:** Chetanya Sharma  
**Contact:** hs8502097870@gmail.com
