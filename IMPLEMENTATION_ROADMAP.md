# Centralized Government Scheme Analytics Dashboard
## Comprehensive Implementation Roadmap

**Project ID:** 2026-27-IT  
**Institute:** Swami Keshvanand Institute of Technology, Management & Gramothan  
**Team:** 4 Members | Timeline: 12-16 weeks  

---

## 👥 Team Assignment & Responsibilities

### 1. **Divyansh Tak** - Backend Development & AI Module
   - Backend API architecture
   - AI/ML Prediction module
   - Chatbot integration
   - Database optimization

### 2. **Chetanya Prakash Sharma** - Backend Development & Integration
   - Data integration pipeline
   - ETL processes
   - Cron job scheduler
   - API endpoints

### 3. **Chitransh Jain** - Analytics & Frontend Development
   - Frontend dashboard (React)
   - Analytics module
   - Data visualization (Recharts, Leaflet)
   - UI/UX design

### 4. **Harshit Narayan Tripathi** - Deployment & Documentation
   - DevOps & deployment
   - Server configuration
   - Project documentation
   - Testing & QA

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              React.js + Tailwind CSS                     │
│  ┌─────────────┬────────────────┬──────────────┐         │
│  │ Dashboard   │ Analytics      │ Comparisons  │         │
│  │ Heatmaps    │ Predictions    │ Reports      │         │
│  │ Drill-down  │ Chatbot        │ Exports      │         │
│  └─────────────┴────────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────┘
                           ↕
                      REST APIs
                           ↕
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                         │
│            Node.js + Express.js + Prisma ORM            │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ Auth         │ KPI APIs     │ Analytics    │         │
│  │ Data Ingress │ Comparison   │ Prediction   │         │
│  │ Report Gen   │ Chatbot      │ Caching      │         │
│  └──────────────┴──────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│         PostgreSQL + Redis Cache + Indexes              │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ Schemes      │ KPIs         │ Cache        │         │
│  │ Districts    │ Analytics    │ Sessions     │         │
│  │ Villages     │ Reports      │ Predictions  │         │
│  └──────────────┴──────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  DATA SOURCES                            │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ data.gov.in  │ Government   │ CSV Upload   │         │
│  │ Open APIs    │ Websites     │ Manual Entry │         │
│  └──────────────┴──────────────┴──────────────┘         │
│           Cron Job Scheduler (Data Updates)             │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (PostgreSQL)

```sql
-- Core Tables

CREATE TABLE schemes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  ministry VARCHAR(100),
  launch_date DATE,
  budget DECIMAL(15,2),
  target_beneficiaries INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(2),
  region VARCHAR(50),
  population INTEGER
);

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER NOT NULL REFERENCES states(id),
  population INTEGER,
  area_km2 DECIMAL(10,2)
);

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  population INTEGER
);

CREATE TABLE villages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  block_id INTEGER NOT NULL REFERENCES blocks(id),
  population INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8)
);

-- KPI Tables

CREATE TABLE kpi_definitions (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL REFERENCES schemes(id),
  kpi_name VARCHAR(150) NOT NULL,
  description TEXT,
  unit VARCHAR(50),
  data_type VARCHAR(20), -- numeric, percentage, currency
  formula TEXT,
  target_value DECIMAL(15,2),
  frequency VARCHAR(20) -- daily, weekly, monthly, quarterly
);

CREATE TABLE kpi_values (
  id SERIAL PRIMARY KEY,
  kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
  state_id INTEGER REFERENCES states(id),
  district_id INTEGER REFERENCES districts(id),
  block_id INTEGER REFERENCES blocks(id),
  village_id INTEGER REFERENCES villages(id),
  value DECIMAL(15,4),
  target_value DECIMAL(15,4),
  date DATE NOT NULL,
  status VARCHAR(20), -- on_track, at_risk, critical
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_kpi_date (kpi_id, date),
  INDEX idx_location (state_id, district_id, date)
);

-- Scheme-wise Data

CREATE TABLE pmay_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  houses_sanctioned INTEGER,
  houses_completed INTEGER,
  houses_occupied INTEGER,
  budget_allocated DECIMAL(15,2),
  budget_spent DECIMAL(15,2),
  avg_cost_per_unit DECIMAL(12,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_pmay (district_id, date)
);

CREATE TABLE mgnregs_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  person_days_created DECIMAL(12,2),
  person_days_completed DECIMAL(12,2),
  avg_wage DECIMAL(10,2),
  work_completion_rate DECIMAL(5,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_mgnregs (district_id, date)
);

CREATE TABLE pmgsy_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  road_length_planned DECIMAL(10,2),
  road_length_constructed DECIMAL(10,2),
  habitations_connected INTEGER,
  completion_rate DECIMAL(5,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_pmgsy (district_id, date)
);

CREATE TABLE nrlm_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  shgs_formed INTEGER,
  members_registered INTEGER,
  loan_disbursed DECIMAL(15,2),
  women_empowerment_index DECIMAL(5,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_nrlm (district_id, date)
);

CREATE TABLE ddu_gky_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  candidates_trained INTEGER,
  placement_count INTEGER,
  avg_salary DECIMAL(10,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_ddu (district_id, date)
);

CREATE TABLE sagy_data (
  id SERIAL PRIMARY KEY,
  village_id INTEGER NOT NULL REFERENCES villages(id),
  development_index DECIMAL(5,2),
  infrastructure_score DECIMAL(5,2),
  community_satisfaction DECIMAL(5,2),
  date DATE NOT NULL,
  UNIQUE KEY unique_sagy (village_id, date)
);

-- Analytics & Predictions

CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
  location_type VARCHAR(20), -- state, district, block, village
  location_id INTEGER,
  predicted_value DECIMAL(15,4),
  confidence_score DECIMAL(5,2),
  prediction_date DATE,
  forecast_period VARCHAR(20), -- next_month, next_quarter, next_year
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  report_type VARCHAR(50), -- executive, detailed, comparative, predictive
  filters JSON, -- stores applied filters
  file_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP
);

-- User & Access Control

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20), -- admin, analyst, official, viewer
  state_access INTEGER REFERENCES states(id), -- NULL for all-india access
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id INTEGER,
  changes JSON,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Data Import History

CREATE TABLE data_imports (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL REFERENCES schemes(id),
  source VARCHAR(255), -- data.gov.in, API endpoint, CSV upload
  import_type VARCHAR(20), -- api, csv, manual
  file_name VARCHAR(255),
  records_imported INTEGER,
  records_failed INTEGER,
  status VARCHAR(20), -- pending, processing, completed, failed
  error_message TEXT,
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance

CREATE INDEX idx_kpi_values_date ON kpi_values(date DESC);
CREATE INDEX idx_kpi_values_location ON kpi_values(state_id, district_id);
CREATE INDEX idx_pmay_date ON pmay_data(date DESC);
CREATE INDEX idx_mgnregs_date ON mgnregs_data(date DESC);
CREATE INDEX idx_predictions_date ON predictions(prediction_date DESC);
```

---

## 🔗 Backend API Endpoints (Node.js + Express)

### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login (JWT)
POST   /api/auth/logout            - User logout
POST   /api/auth/refresh-token     - Refresh JWT
GET    /api/auth/me                - Get current user
```

### KPI Management
```
GET    /api/kpis                   - Get all KPI definitions
GET    /api/kpis/:id               - Get specific KPI
GET    /api/kpis/scheme/:schemeId  - Get KPIs for scheme
POST   /api/kpi-values             - Add/update KPI value
GET    /api/kpi-values/latest      - Get latest KPI values (all locations)
GET    /api/kpi-values/:kpiId/trend - Get KPI trend (time series)
```

### Scheme Data
```
GET    /api/schemes                - List all schemes
GET    /api/schemes/:id            - Get scheme details
POST   /api/schemes/:id/data       - Submit scheme data
GET    /api/schemes/:id/data       - Get scheme data (state/district/block level)
```

### Geographic Data
```
GET    /api/states                 - List all states
GET    /api/states/:id/districts   - Get districts for state
GET    /api/districts/:id/blocks   - Get blocks for district
GET    /api/blocks/:id/villages    - Get villages for block
```

### Analytics & Comparisons
```
GET    /api/analytics/kpi-summary           - Overall KPI summary
GET    /api/analytics/state-ranking        - Rank states by performance
GET    /api/analytics/scheme-comparison    - Compare schemes
GET    /api/analytics/district-comparison  - Compare districts within state
GET    /api/analytics/trend-analysis/:kpiId - Analyze trends
```

### Predictions & Forecasting
```
GET    /api/predictions/:kpiId              - Get predictions for KPI
POST   /api/predictions/generate            - Generate new predictions
GET    /api/predictions/forecast/:kpiId     - Get forecast (next quarter/year)
```

### Chatbot
```
POST   /api/chatbot/query          - Send natural language query
GET    /api/chatbot/suggestions    - Get query suggestions
POST   /api/chatbot/feedback       - Rate chatbot response
```

### Reports & Exports
```
GET    /api/reports                - List user's reports
POST   /api/reports/generate       - Generate report (PDF/CSV)
GET    /api/reports/:id/download   - Download report
DELETE /api/reports/:id            - Delete report
```

### Data Management
```
POST   /api/data-import/upload     - Upload CSV data
POST   /api/data-import/schedule   - Schedule automated import
GET    /api/data-import/history    - Import history
```

### Admin
```
GET    /api/admin/audit-log        - View audit logs
GET    /api/admin/users            - Manage users
POST   /api/admin/sync-data        - Force data sync from sources
```

---

## 🎨 Frontend Components (React)

### Pages
```
/                          - Home/Dashboard
/login                     - Login page
/schemes                   - Schemes overview
/schemes/:id               - Scheme details
/analytics/dashboard       - Main analytics dashboard
/analytics/kpi/:id         - KPI detail & trend
/analytics/comparisons     - Comparative analysis
/analytics/predictions     - Forecast & predictions
/reports                   - Reports list & generation
/admin/users               - User management (admin)
/admin/data-sync           - Data synchronization (admin)
/settings                  - User settings
```

### Components
```
Header/Navigation
  ├─ Logo & Branding
  ├─ Navigation Menu
  ├─ User Profile Dropdown
  └─ Search Bar

Dashboard
  ├─ KPI Cards (top metrics)
  ├─ Heatmap (state/district performance)
  ├─ Recent Trends Chart
  ├─ Scheme Status Widget
  └─ Quick Actions

Visualizations
  ├─ Line Charts (trends)
  ├─ Bar Charts (comparisons)
  ├─ Pie Charts (distribution)
  ├─ Heatmaps (geographic)
  ├─ Maps (Leaflet integration)
  └─ Gauge Charts (progress)

Filters & Controls
  ├─ Date Range Picker
  ├─ Scheme Selector (multi-select)
  ├─ Location Selector (state → district → block → village)
  ├─ KPI Selector
  └─ Export Options

Chatbot Interface
  ├─ Chat Window
  ├─ Query Suggestions
  ├─ Response Display
  └─ Feedback Buttons

Reports Module
  ├─ Report Template Selector
  ├─ Filter Configuration
  ├─ Preview
  ├─ Generate & Download
  └─ Report History
```

---

## 📅 Development Timeline (16 weeks)

### Week 1-2: Setup & Architecture
- [ ] GitHub repo creation & setup
- [ ] Database schema design & PostgreSQL setup
- [ ] Backend project initialization (Express.js + Prisma)
- [ ] Frontend project initialization (React + Vite)
- [ ] Docker setup & environment configuration
- [ ] Design system & component library kickoff

**Deliverable:** Development environment ready, DB schema approved

---

### Week 3-4: Authentication & User Management
- [ ] User registration & login APIs
- [ ] JWT implementation
- [ ] Role-based access control (RBAC)
- [ ] User management dashboard (admin)
- [ ] Frontend login/signup pages

**Deliverable:** Auth system working, users can login with roles

---

### Week 5-6: Data Integration & ETL
- [ ] CSV upload functionality
- [ ] Data connectors for data.gov.in APIs
- [ ] Data validation & cleaning pipeline
- [ ] ETL process implementation
- [ ] Cron job scheduler setup
- [ ] Data import history tracking

**Deliverable:** Data can be imported, validated, and scheduled for updates

---

### Week 7-8: Core KPI Module
- [ ] KPI definition & calculation engine
- [ ] KPI data storage & retrieval
- [ ] KPI APIs implementation
- [ ] Basic dashboard with KPI cards
- [ ] Real-time KPI display

**Deliverable:** KPIs calculated, displayed on dashboard

---

### Week 9-10: Visualization & Analytics
- [ ] Chart components (Recharts integration)
- [ ] Map visualization (Leaflet integration)
- [ ] Heatmap implementation
- [ ] Drill-down functionality (state → district → block → village)
- [ ] Analytics dashboard layout
- [ ] Performance optimization & caching

**Deliverable:** Full interactive dashboard with visualizations

---

### Week 11-12: Comparisons & Predictions
- [ ] Comparative analysis module (schemes, regions)
- [ ] Prediction model training (historical data analysis)
- [ ] Forecast generation & storage
- [ ] Trend analysis implementation
- [ ] Chatbot integration (NLP-based query handler)

**Deliverable:** Comparisons & predictions working, chatbot accessible

---

### Week 13-14: Report Generation & Export
- [ ] Report template design
- [ ] PDF generation (executive, detailed, comparative)
- [ ] CSV export functionality
- [ ] Scheduled report generation
- [ ] Report download & archiving

**Deliverable:** Users can generate & download reports

---

### Week 15-16: Testing, Documentation & Deployment
- [ ] Unit & integration testing
- [ ] Performance testing & optimization
- [ ] Security audit & hardening
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment preparation (CI/CD setup)
- [ ] Production deployment
- [ ] Project documentation & handover

**Deliverable:** Production-ready system deployed

---

## 🔑 Key Features Implementation Plan

### 1. Real-time KPI Tracking
```
Flow: Data Import → Validation → KPI Calculation → Cache Update → Frontend Display
Frequency: Hourly via Cron Job
Latency: < 5 minutes from data source to dashboard
```

### 2. Interactive Drill-Down
```
State Level → District Level → Block Level → Village Level
Each level shows aggregated KPIs for that location
Visualizations adapt based on data granularity
```

### 3. Comparative Analysis
```
Options:
- Scheme vs Scheme (PMAY vs PMGSY performance)
- State vs State (Maharashtra vs Karnataka)
- District vs District (within same state)
- Time Period Comparison (this year vs last year)
```

### 4. Heatmap Visualization
```
Color coding based on performance tiers:
- Green: On track / Excellent
- Yellow: At risk / Moderate
- Red: Critical / Poor
Hover for details, click to drill-down
```

### 5. Prediction & Forecasting
```
Algorithms: Time-series forecasting (ARIMA/Prophet)
Input: Historical KPI values (2-3 years minimum)
Output: Next month/quarter/year forecast + confidence interval
Update: Weekly with new data
```

### 6. AI Chatbot
```
Natural Language Processing (NLP)
Patterns:
- "What is PMAY performance in Maharashtra?"
- "Compare MGNREGS between districts"
- "What's the forecast for NRLM loan disbursement?"
- "Show me villages with low DDU-GKY placement"
Response: Query DB/analytics, format as JSON/text
```

---

## 📦 Technology Stack Details

### Frontend
```
React 18 + Vite
├─ Tailwind CSS (styling)
├─ React Router (routing)
├─ Axios (HTTP client)
├─ Redux Toolkit (state management)
├─ Recharts (charting)
├─ Leaflet (maps)
├─ Date-fns (date handling)
└─ React-Toastify (notifications)
```

### Backend
```
Node.js + Express.js
├─ Prisma ORM (database)
├─ JWT (authentication)
├─ Bcrypt (password hashing)
├─ Joi (validation)
├─ Node-cron (scheduling)
├─ Node-fetch (HTTP requests)
├─ Multer (file uploads)
├─ PDFKit (PDF generation)
└─ XLSX (Excel export)
```

### Database
```
PostgreSQL
├─ Structured data storage
├─ Complex queries (comparisons, analytics)
├─ Indexes for performance
└─ Foreign keys for data integrity

Redis (Cache)
├─ KPI cache (1-hour TTL)
├─ Session storage
└─ Real-time updates
```

### Deployment
```
Frontend: Vercel / Netlify
Backend: Railway / Heroku / AWS EC2
Database: AWS RDS (PostgreSQL)
Storage: AWS S3 (reports, exports)
CI/CD: GitHub Actions
```

---

## ✅ Quality Checklist

- [ ] All endpoints documented (Swagger)
- [ ] >80% code coverage (unit tests)
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error handling & logging
- [ ] Performance optimization (caching, indexing)
- [ ] Security audit passed
- [ ] Accessibility compliance (WCAG)
- [ ] Mobile responsiveness tested
- [ ] Load testing (1000+ concurrent users)
- [ ] Disaster recovery plan

---

## 📋 Success Criteria

✅ **Functionality**
- All 6 schemes integrated & displaying data
- KPIs calculated correctly & updating on schedule
- Drill-down working to village level
- Comparisons generating accurate insights
- Predictions generating with >75% accuracy
- Chatbot answering >90% of queries correctly

✅ **Performance**
- Dashboard loads in <2 seconds
- Queries response in <500ms
- Report generation in <5 seconds
- Handle 100+ concurrent users

✅ **Deployment**
- Frontend deployed & accessible
- Backend API live & responding
- Database configured & working
- CI/CD pipeline functional

✅ **Documentation**
- API documentation complete
- User manual provided
- Deployment guide written
- Code well-commented

---

## 🚀 Next Steps

1. **Create GitHub Repository** - Set up repo structure
2. **Setup Development Environment** - Docker, .env files
3. **Database Setup** - Create PostgreSQL instance, run migrations
4. **Backend API Scaffolding** - Express server, basic routes
5. **Frontend Setup** - React project, routing structure
6. **Data Source Connectors** - Start with data.gov.in API
7. **First Feature** - KPI calculation & display
8. **Iterate & Expand** - Add features module by module

---

## 📞 Support & Resources

- **Data Sources:**
  - https://www.data.gov.in/
  - https://www.data.gov.in/keywords/MIS
  - https://pmgsy.dord.gov.in/

- **Documentation:**
  - PostgreSQL Docs: https://www.postgresql.org/docs/
  - Express.js: https://expressjs.com/
  - React: https://react.dev/
  - Recharts: https://recharts.org/
  - Leaflet: https://leafletjs.com/

- **Community:**
  - Stack Overflow: [tag: government-data-analytics]
  - GitHub Discussions: [project-repo]
  - Project Discord: [invite link]

---

**Ready to start building? 🎯**

Choose your starting point:
1. Set up GitHub & development environment
2. Design database schema in detail
3. Create basic Express.js API
4. Start React frontend scaffolding
5. Build first data connector

Which should we tackle first?
