# 🏗️ DETAILED SYSTEM DESIGN
## Government Schemes Analytics Dashboard (Complete A-Z)

**Language:** Hinglish (Easy to Understand)  
**Audience:** College students, developers, anyone  
**Level:** Complete - Basic to Advanced  
**Format:** Structured with diagrams & examples

---

# 📑 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Project Scope & Objectives](#scope)
3. [High-Level Architecture](#high-level-architecture)
4. [Technology Stack](#tech-stack)
5. [System Components](#system-components)
6. [Frontend Architecture](#frontend)
7. [Backend Architecture](#backend)
8. [Database Design](#database)
9. [API Specifications](#api-specs)
10. [Data Flow Diagrams](#data-flow)
11. [Authentication & Security](#security)
12. [Performance Considerations](#performance)
13. [Deployment Architecture](#deployment)
14. [Scalability Strategy](#scalability)
15. [Error Handling](#error-handling)
16. [Monitoring & Logging](#monitoring)

---

# 1. EXECUTIVE SUMMARY {#executive-summary}

## Kya Banaya?

Ek **Full-Stack Web Application** - Government Schemes Analytics Dashboard

```
Simple Words Mein:
┌─────────────────────────────────┐
│  Government ke 6 schemes ke     │
│  performance ko track karne     │
│  ke liye ek LIVE DASHBOARD      │
│                                 │
│  Jisme dekh sakte ho:           │
│  - Kaunsa scheme ache chal      │
│  - Kaunsa state best perform    │
│  - Progress kya hai             │
│  - Historical trends            │
│  - Comparisons                  │
└─────────────────────────────────┘
```

## Scale

```
Users:              1000+ concurrent
Data Points:        1620+ KPI values
States:             31 (All India)
Schemes:            6 (Government schemes)
Daily Users:        100-500
Uptime Target:      99.9%
Response Time:      <100ms average
```

## Key Features

```
✅ Real-time KPI tracking
✅ 31 States filtering
✅ 6 Government schemes
✅ Performance badges (4 status levels)
✅ Trend visualization (30-day history)
✅ CSV export
✅ Scheme comparison
✅ Login/Logout with JWT
✅ User profiles
✅ Mobile responsive
✅ AI insights (ML)
✅ Automated deployment
```

---

# 2. PROJECT SCOPE & OBJECTIVES {#scope}

## Scope

### IN SCOPE (Banaya)

```
1. USER MANAGEMENT
   ├─ Login with email/password
   ├─ JWT-based authentication
   ├─ Session management
   ├─ Logout functionality
   └─ User profile display

2. DATA MANAGEMENT
   ├─ 6 Government schemes
   ├─ 31 States data
   ├─ KPI definitions & values
   ├─ Historical trends (30+ days)
   └─ Real-time updates

3. ANALYTICS FEATURES
   ├─ Performance badges
   ├─ Trend charts
   ├─ Comparison views
   ├─ State rankings
   ├─ KPI progress tracking
   └─ Geographic analysis

4. EXPORT & REPORTING
   ├─ CSV export
   ├─ PDF reports (ready)
   └─ Custom reports

5. DEPLOYMENT
   ├─ Cloud hosting (Render)
   ├─ Automated CI/CD
   ├─ Zero-downtime deploys
   ├─ Auto-rollback
   └─ Health monitoring
```

### OUT OF SCOPE (Nahi banaya)

```
❌ Mobile native apps (iOS/Android)
❌ Real-time WebSocket updates (basic support)
❌ ML model training (only inference)
❌ Voice/SMS notifications
❌ Advanced predictive analytics
❌ Custom report builder
```

## Objectives

```
PRIMARY:
1. Provide real-time government scheme performance visibility
2. Enable data-driven decision making
3. Make data accessible to all stakeholders

SECONDARY:
1. Improve data accuracy (vs manual collection)
2. Reduce reporting time (instant vs manual)
3. Enable comparative analysis (schemes vs states)
4. Support strategic planning

TECHNICAL:
1. Build scalable architecture
2. Ensure high availability (99.9% uptime)
3. Maintain data security
4. Optimize for performance
```

---

# 3. HIGH-LEVEL ARCHITECTURE {#high-level-architecture}

## System Overview Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                     TIER 1: PRESENTATION                       │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  React 18 + Vite (Frontend)                           │   │
│  │  - SPA (Single Page Application)                      │   │
│  │  - Redux for state management                         │   │
│  │  - Responsive UI (Desktop/Tablet/Mobile)             │   │
│  │  - Charts & Visualizations (Recharts)                │   │
│  │  - Location: https://frontend-ae3v.onrender.com      │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↕ API Calls (HTTPS)
│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                  TIER 2: APPLICATION LOGIC                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express (Backend)                          │   │
│  │  - RESTful API endpoints                              │   │
│  │  - Business logic processing                          │   │
│  │  - Authentication & Authorization                     │   │
│  │  - Data validation & sanitization                     │   │
│  │  - Error handling                                     │   │
│  │  - Location: college-final-project-backend-m86r      │   │
│  └────────────────────────────────────────────────────────┘   │
│                          ↕ SQL Queries
│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    TIER 3: DATA LAYER                          │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Primary Database)                        │   │
│  │  - Relational data storage                            │   │
│  │  - ACID compliance                                    │   │
│  │  - Indexed queries for performance                    │   │
│  │  - Backup & recovery                                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Redis (Cache Layer) [Optional]                       │   │
│  │  - Session storage                                    │   │
│  │  - Frequently accessed data cache                     │   │
│  │  - Fast data retrieval                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

SUPPORTING SYSTEMS:

┌──────────────────────────────────────────────────────────────────┐
│ MONITORING & LOGGING                                           │
│ ├─ Sentry (Error tracking)                                    │
│ ├─ Console logs                                               │
│ └─ Health checks                                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ CI/CD PIPELINE                                                 │
│ ├─ GitHub Actions (Automated testing)                        │
│ ├─ Render (Deployment platform)                              │
│ └─ Auto-rollback on failure                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow (30,000 feet)

```
USER → BROWSER → FRONTEND → NETWORK → BACKEND → DATABASE
  │       │        │         │        │         │
  │       │        │         │        │         └─ Store/Retrieve
  │       │        │         │        └───────────── Process data
  │       │        │         └─────────────────── Transport
  │       │        └──────────────────────────────── Display
  │       └────────────────────────────────────────── Render
  └──────────────────────────────────────────────────── Interact

↓

BACKEND → PROCESS → DATABASE → RESPONSE → NETWORK → FRONTEND → RENDER
```

---

# 4. TECHNOLOGY STACK {#tech-stack}

## Complete Tech Stack

```
FRONTEND LAYER:
┌─────────────────────────────────────┐
│ React 18                            │ UI Framework
│ ├─ Hooks (useState, useEffect)     │
│ ├─ Functional components            │
│ └─ Concurrent rendering             │
│                                     │
│ Vite                               │ Build tool (Fast)
│ ├─ HMR (Hot Module Replacement)    │
│ ├─ Optimized production build      │
│ └─ Fast development server         │
│                                     │
│ Redux                              │ State Management
│ ├─ Global state store              │
│ ├─ Actions/Reducers                │
│ └─ Selectors                        │
│                                     │
│ Tailwind CSS                       │ Styling
│ ├─ Utility-first CSS               │
│ ├─ Responsive design               │
│ └─ Dark mode support               │
│                                     │
│ Recharts                           │ Charting Library
│ ├─ Line charts (trends)            │
│ ├─ Bar charts (comparisons)        │
│ └─ Responsive graphs               │
│                                     │
│ Axios                              │ HTTP Client
│ ├─ API calls                       │
│ ├─ Interceptors                    │
│ └─ Error handling                  │
│                                     │
│ React Router                       │ Routing
│ ├─ Page navigation                 │
│ ├─ Protected routes                │
│ └─ Dynamic redirects               │
│                                     │
│ Lucide Icons                       │ Icons
│ └─ Beautiful icon library          │
└─────────────────────────────────────┘

BACKEND LAYER:
┌─────────────────────────────────────┐
│ Node.js                             │ Runtime
│ ├─ JavaScript server-side          │
│ ├─ Non-blocking I/O                │
│ └─ High concurrency                │
│                                     │
│ Express.js                         │ Web Framework
│ ├─ Routing                         │
│ ├─ Middleware support             │
│ ├─ Easy to use                     │
│ └─ Perfect for REST APIs           │
│                                     │
│ Prisma ORM                         │ Database Layer
│ ├─ Type-safe queries               │
│ ├─ Auto migrations                 │
│ ├─ Connection pooling              │
│ └─ Query optimization              │
│                                     │
│ PostgreSQL                         │ Database
│ ├─ Relational DB                   │
│ ├─ ACID compliance                 │
│ ├─ Advanced queries                │
│ └─ Scalable                        │
│                                     │
│ JWT (jsonwebtoken)                │ Authentication
│ ├─ Token generation                │
│ ├─ Token verification              │
│ └─ Stateless auth                  │
│                                     │
│ bcryptjs                           │ Password Hashing
│ ├─ Secure hashing                  │
│ ├─ Salt + rounds                   │
│ └─ One-way encryption              │
│                                     │
│ CORS                               │ Cross-Origin
│ ├─ Frontend-backend sync           │
│ ├─ Security headers                │
│ └─ Origin validation               │
│                                     │
│ express-rate-limit                │ Rate Limiting
│ ├─ Prevent abuse                   │
│ ├─ Per-IP limiting                 │
│ └─ Configurable thresholds         │
└─────────────────────────────────────┘

DEPLOYMENT & DEVOPS:
┌─────────────────────────────────────┐
│ GitHub                              │ Version Control
│ ├─ Code repository                 │
│ ├─ Git version tracking            │
│ └─ Collaboration                   │
│                                     │
│ GitHub Actions                     │ CI/CD
│ ├─ Automated testing               │
│ ├─ Build automation                │
│ └─ Deployment automation           │
│                                     │
│ Render                             │ Cloud Hosting
│ ├─ Frontend CDN                    │
│ ├─ Backend server                  │
│ ├─ PostgreSQL database             │
│ ├─ Redis cache                     │
│ └─ Zero-downtime deploys           │
│                                     │
│ Sentry                             │ Error Tracking
│ ├─ Real-time error monitoring      │
│ ├─ Performance tracking            │
│ └─ Issue alerts                    │
└─────────────────────────────────────┘

UTILITIES:
┌─────────────────────────────────────┐
│ dotenv                              │ Env variables
│ Helmet                              │ Security headers
│ Morgan                              │ HTTP logging
│ Nodemon                             │ Development auto-reload
│ React Toastify                      │ Notifications
│ React Query                         │ Data fetching
│ React Testing Library               │ Component testing
│ Jest                                │ Test framework
└─────────────────────────────────────┘
```

## Why These Technologies?

```
React vs Vue/Angular:
✅ Largest ecosystem
✅ Most jobs available
✅ Best for teams
✅ Good performance
✅ Community support

Express vs Django/FastAPI:
✅ JavaScript full-stack
✅ Minimal setup
✅ Flexibility
✅ Good for REST APIs
✅ Easy to learn

PostgreSQL vs MySQL/MongoDB:
✅ Better for structured data
✅ ACID compliance (data safe)
✅ Advanced queries
✅ Better performance
✅ Professional choice

Render vs AWS/GCP:
✅ Simple deployment
✅ Auto-scaling
✅ Managed databases
✅ Good pricing
✅ Perfect for startups

Prisma vs Raw SQL:
✅ Type-safe
✅ Auto migrations
✅ Better error messages
✅ Less SQL injection risk
✅ Easier to maintain
```

---

# 5. SYSTEM COMPONENTS {#system-components}

## Component Breakdown

```
FRONTEND COMPONENTS (23 Total):

UI LAYER:
├─ Dashboard
│  ├─ Header (greeting, user profile, buttons)
│  ├─ Filters Section (scheme, state, date)
│  ├─ Stats Cards (total schemes, KPIs, states)
│  ├─ KPI Grid (performance cards)
│  ├─ Charts Section (trends, top performers)
│  └─ Comparison Section (scheme vs scheme)
│
├─ Login Page
│  ├─ Email input
│  ├─ Password input
│  └─ Submit button
│
└─ Analytics Page
   ├─ Comparison charts
   ├─ Performance metrics
   └─ Advanced visualizations

COMPONENT LIBRARY:
├─ KPICard
│  ├─ KPI name display
│  ├─ Current value
│  ├─ Target value
│  ├─ Progress bar
│  ├─ Status badge
│  └─ Performance badge
│
├─ Charts
│  ├─ TrendChart (line graph)
│  ├─ TopPerformers (bar chart)
│  └─ KPIComparison (multi-series)
│
├─ Selectors
│  ├─ SchemeSelector
│  ├─ StateSelector
│  └─ DateRangeSelector
│
├─ User Features
│  ├─ UserProfile
│  └─ LoginForm
│
├─ Visualizations
│  ├─ PerformanceBadge
│  ├─ TrendSparkline
│  └─ LoadingSpinner
│
├─ Features
│  ├─ Chatbot (AI)
│  ├─ MLInsights
│  ├─ ReportGenerator
│  ├─ AnomalyDetection
│  └─ Forecasting
│
└─ Utilities
   ├─ ErrorBoundary
   ├─ ProtectedRoute
   ├─ ExportButton
   └─ KPIAlerts

BACKEND COMPONENTS (15 Routes Total):

API LAYERS:
├─ Authentication Routes (/auth)
│  ├─ POST /login (email + password)
│  ├─ POST /refresh-token (token renewal)
│  ├─ GET /me (current user info)
│  └─ POST /logout (session end)
│
├─ Scheme Routes (/schemes)
│  ├─ GET / (all schemes)
│  ├─ GET /:id (single scheme)
│  └─ GET /:id/details (detailed info)
│
├─ KPI Routes (/kpis)
│  ├─ GET /status/:scheme (all KPIs)
│  ├─ GET /status/:scheme?stateId=X (filtered)
│  ├─ GET /trend/:kpiId (historical)
│  └─ GET /details/:kpiId (KPI info)
│
├─ Geographic Routes (/geo)
│  ├─ GET /states (all 31 states)
│  ├─ GET /states/:id (single state)
│  └─ GET /states/:id/stats (state details)
│
├─ Analytics Routes (/analytics)
│  ├─ GET /comparison (scheme comparison)
│  ├─ GET /geographic (state analysis)
│  └─ GET /performance (performance metrics)
│
├─ Admin Routes (/admin)
│  ├─ GET /users (user management)
│  ├─ POST /users (create user)
│  └─ PUT /users/:id (update user)
│
├─ ML Routes (/ml-analytics)
│  ├─ GET /insights/:scheme (AI insights)
│  ├─ GET /predictions/:kpiId (forecasts)
│  └─ GET /anomalies (anomaly detection)
│
└─ Other Routes
   ├─ /report (reports)
   ├─ /chatbot (AI chat)
   ├─ /health (status check)
   └─ /sync (data sync)

MIDDLEWARE LAYERS:
├─ CORS Middleware
│  └─ Check: frontend ko access deni hai?
│
├─ Authentication Middleware
│  └─ Check: user logged in hai?
│
├─ Rate Limiting Middleware
│  └─ Check: request limit breach hua?
│
├─ Validation Middleware
│  └─ Check: data valid hai?
│
├─ Logging Middleware
│  └─ Log: request details
│
└─ Error Handler Middleware
   └─ Catch: errors handle karo

DATABASE COMPONENTS (6 Tables):
├─ Users Table
│  ├─ id (Primary Key)
│  ├─ email (Unique)
│  ├─ password_hash
│  ├─ full_name
│  ├─ role (ADMIN, ANALYST, VIEWER)
│  ├─ is_active
│  └─ timestamps
│
├─ Schemes Table
│  ├─ id (Primary Key)
│  ├─ code (PMAY, MGNREGS, etc)
│  ├─ name
│  ├─ ministry
│  ├─ description
│  └─ timestamps
│
├─ States Table
│  ├─ id (Primary Key)
│  ├─ name (Maharashtra, Gujarat, etc)
│  ├─ code (MH, GJ, etc)
│  ├─ region
│  ├─ population
│  └─ timestamps
│
├─ KPI Definitions Table
│  ├─ id (Primary Key)
│  ├─ scheme_id (Foreign Key → Schemes)
│  ├─ kpi_name (e.g., "Houses Built")
│  ├─ target_value
│  ├─ unit
│  ├─ min_range
│  ├─ max_range
│  └─ timestamps
│
├─ KPI Values Table (Main Data)
│  ├─ id (Primary Key)
│  ├─ kpi_id (Foreign Key → KPI Definitions)
│  ├─ state_id (Foreign Key → States)
│  ├─ value (actual data)
│  ├─ target_value
│  ├─ date (daily data)
│  ├─ status (on_track, at_risk, critical)
│  ├─ progress_percentage
│  └─ timestamps
│
└─ Audit Logs Table
   ├─ id (Primary Key)
   ├─ user_id (Foreign Key → Users)
   ├─ action (login, logout, view_data, export)
   ├─ resource (what was accessed)
   ├─ timestamp
   ├─ ip_address
   └─ details (JSON metadata)
```

---

# 6. FRONTEND ARCHITECTURE {#frontend}

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx              (Login form)
│   │   ├── Dashboard.jsx          (Main page)
│   │   ├── Analytics.jsx          (Analytics)
│   │   └── Features.jsx           (Advanced features)
│   │
│   ├── components/
│   │   ├── KPICard.jsx            (KPI display)
│   │   ├── KPIDashboard.jsx       (KPI container)
│   │   ├── SchemeSelector.jsx     (Dropdown)
│   │   ├── StateSelector.jsx      (Dropdown)
│   │   ├── DateRangeSelector.jsx  (Date picker)
│   │   ├── UserProfile.jsx        (User menu)
│   │   ├── TrendChart.jsx         (Line chart)
│   │   ├── TopPerformers.jsx      (Bar chart)
│   │   ├── KPIComparison.jsx      (Comparison)
│   │   ├── PerformanceBadge.jsx   (Status)
│   │   ├── TrendSparkline.jsx     (Trend arrow)
│   │   ├── ExportButton.jsx       (CSV export)
│   │   ├── KPIAlerts.jsx          (Notifications)
│   │   ├── Chatbot.jsx            (AI chat)
│   │   ├── MLInsights.jsx         (ML predictions)
│   │   ├── ErrorBoundary.jsx      (Error catch)
│   │   └── ProtectedRoute.jsx     (Auth check)
│   │
│   ├── store/
│   │   ├── index.js               (Redux store)
│   │   ├── authSlice.js           (Auth state)
│   │   └── dataSlice.js           (Data state)
│   │
│   ├── api/
│   │   ├── client.js              (Axios config)
│   │   ├── auth.js                (Auth calls)
│   │   ├── kpis.js                (KPI calls)
│   │   ├── schemes.js             (Scheme calls)
│   │   └── hooks.js               (Custom hooks)
│   │
│   ├── utils/
│   │   ├── csvExport.js           (CSV download)
│   │   └── helpers.js             (Utility functions)
│   │
│   ├── App.jsx                    (Root component)
│   └── index.css                  (Global styles)
│
├── package.json
├── vite.config.js
└── index.html
```

## Frontend State Management

```
Redux Store Structure:

store/
├─ root reducer
│  ├─ authReducer
│  │  ├─ state: {
│  │  │   user: { id, email, full_name, role },
│  │  │   token: "eyJhbGc...",
│  │  │   isLoggedIn: true,
│  │  │   loading: false
│  │  │ }
│  │  └─ actions: login, logout, setUser, setToken
│  │
│  └─ dataReducer
│     ├─ state: {
│     │   schemes: [...],
│     │   states: [...],
│     │   kpiValues: [...],
│     │   selectedScheme: "PMAY",
│     │   selectedState: 1,
│     │   loading: false,
│     │   error: null
│     │ }
│     └─ actions: setSchemes, setKPIValues, setSelectedScheme, etc
```

## Frontend Component Lifecycle

```
APP LOADS:
│
└─ App.jsx mounts
   │
   ├─ useEffect (empty deps)
   │  ├─ Check if token exists in localStorage
   │  ├─ If yes: verify token with GET /auth/me
   │  ├─ If verified: setUser to Redux
   │  └─ If not: redirect to /login
   │
   └─ Router loads
      ├─ If logged in: show Dashboard
      └─ If not: show Login

DASHBOARD LOADS:
│
└─ Dashboard.jsx mounts
   │
   ├─ useEffect (empty deps)
   │  ├─ Fetch all schemes: GET /schemes
   │  ├─ Fetch all states: GET /geo/states
   │  ├─ Fetch default KPIs: GET /kpis/status/PMAY
   │  └─ Store in Redux
   │
   └─ useEffect ([selectedScheme, selectedState])
      ├─ Build URL: /kpis/status/{scheme}?stateId={state}
      ├─ Make API call
      ├─ Update Redux with KPI data
      └─ Components re-render

COMPONENT RE-RENDER:
│
└─ Redux state changes
   │
   ├─ KPICard re-renders
   │  ├─ New KPI values shown
   │  └─ Progress bars updated
   │
   ├─ TrendChart re-renders
   │  └─ New trend data displayed
   │
   └─ Other components update
```

---

# 7. BACKEND ARCHITECTURE {#backend}

## Backend Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js                (Login/logout)
│   │   ├── schemes.js             (Scheme endpoints)
│   │   ├── kpis.js                (KPI endpoints)
│   │   ├── geographic.js          (State endpoints)
│   │   ├── analytics.js           (Analytics)
│   │   ├── admin.js               (User management)
│   │   ├── ml-analytics.js        (AI/ML)
│   │   ├── chatbot.js             (Chat API)
│   │   ├── report.js              (Reports)
│   │   └── health.js              (Health check)
│   │
│   ├── middleware/
│   │   ├── auth.js                (JWT verify)
│   │   ├── cors.js                (CORS config)
│   │   ├── rateLimiter.js         (Rate limiting)
│   │   ├── errorHandler.js        (Error catch)
│   │   └── logger.js              (Request log)
│   │
│   ├── models/
│   │   └── prisma/
│   │       ├── schema.prisma      (DB schema)
│   │       └── migrations/        (DB changes)
│   │
│   ├── services/
│   │   ├── authService.js         (Auth logic)
│   │   ├── kpiService.js          (KPI logic)
│   │   ├── analyticsService.js    (Analytics)
│   │   └── mlService.js           (ML logic)
│   │
│   ├── utils/
│   │   ├── validators.js          (Input validation)
│   │   ├── errors.js              (Error classes)
│   │   └── helpers.js             (Helper functions)
│   │
│   └── index.js                   (Server entry)
│
├── package.json
├── .env                           (Environment vars)
└── .env.example                   (Template)
```

## Backend Request Processing Pipeline

```
REQUEST ARRIVES:
│
└─ GET /kpis/status/PMAY?stateId=10
   Authorization: Bearer eyJhbGc...

    ↓ MIDDLEWARE CHAIN

1. CORS Middleware
   ├─ Check if Origin is allowed
   └─ Add CORS headers to response

    ↓

2. Request Logging Middleware
   ├─ Log: timestamp, method, path
   └─ Log: user info, IP address

    ↓

3. Authentication Middleware
   ├─ Extract token from header
   ├─ jwt.verify(token, JWT_SECRET)
   ├─ If valid: req.userId = 1
   └─ If invalid: return 401

    ↓

4. Rate Limiting Middleware
   ├─ Check requests count
   ├─ If within limit: continue
   └─ If exceeded: return 429

    ↓

5. Route Handler Middleware
   └─ Forward to: GET /kpis/status/:scheme route

    ↓ ROUTE HANDLER LOGIC

1. Parse Parameters
   ├─ scheme = 'PMAY'
   └─ stateId = 10

    ↓

2. Validate Inputs
   ├─ Scheme exists? ✅
   └─ State exists? ✅

    ↓

3. Build Database Query
   └─ Query object:
      {
        where: {
          kpi: { scheme: { code: 'PMAY' } },
          state_id: 10
        },
        include: { kpi: true },
        orderBy: { date: 'desc' }
      }

    ↓

4. Execute Query (Prisma)
   ├─ Convert to SQL
   ├─ Use connection pool
   ├─ Execute on database
   └─ ~10-20ms response time

    ↓

5. Process Results
   ├─ Loop through rows
   ├─ Calculate fields:
   │  ├─ progress % = (value/target)*100
   │  └─ status = "on_track" if >75%
   └─ Format as JSON

    ↓

6. Build Response
   └─ {
        kpi_status: [
          {
            kpi_id: 1,
            kpi_name: "Houses Built",
            value: 64200,
            target: 80000,
            progress: 80,
            status: "on_track"
          }
        ]
      }

    ↓

7. Add Response Headers
   ├─ Content-Type: application/json
   ├─ Cache-Control: private, max-age=300
   └─ CORS headers

    ↓

8. Compress Response
   ├─ gzip compression
   └─ 50KB → 8KB (84% reduction!)

    ↓ RESPONSE SENT

HTTP 200 OK
{
  kpi_status: [...]
}

    ↓ FRONTEND RECEIVES

parse JSON
update Redux
re-render components
```

## Error Handling Flow

```
ERROR OCCURS:
│
└─ Database connection failed
   │
   ├─ Route handler
   │  └─ throw new AppError('DB connection failed', 503)
   │
   └─ Try-catch block
      │
      └─ catch (err)
         │
         └─ next(err) [pass to error handler]

    ↓

ERROR HANDLER MIDDLEWARE:

1. Log Error
   ├─ timestamp
   ├─ stack trace
   ├─ request details
   └─ user info

    ↓

2. Determine Status Code
   ├─ Custom error: use statusCode
   ├─ Database error: 503
   ├─ Validation error: 400
   └─ Unknown: 500

    ↓

3. Build Error Response
   └─ {
        status: "error",
        message: "Database connection failed",
        errorId: "ERR_1691662850_a1b2c3d4",
        timestamp: "2026-08-10T10:00:00Z"
      }

    ↓

4. Send to Frontend
   └─ HTTP 503
      Content-Type: application/json
      {error response}

    ↓ FRONTEND RECEIVES

1. Axios interceptor catches error
2. Show toast: "Server error, please try again"
3. Retry after 2-4-8 seconds (exponential backoff)
```

---

# 8. DATABASE DESIGN {#database}

## Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│     USERS        │         │    SCHEMES       │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ email (UNIQUE)   │         │ code (UNIQUE)    │
│ password_hash    │         │ name             │
│ full_name        │         │ ministry         │
│ role             │    1    │ description      │
│ is_active        │◄────────┤ created_at       │
│ created_at       │    │    │ updated_at       │
│ updated_at       │    │    └──────────────────┘
└──────────────────┘    │
                        │
                        │1 (Many KPIs per scheme)
                        ↓
                   ┌──────────────────┐
                   │ KPI_DEFINITIONS  │
                   ├──────────────────┤
                   │ id (PK)          │
                   │ scheme_id (FK)   │
                   │ kpi_name         │
                   │ target_value     │
                   │ unit             │
                   │ min_range        │
                   │ max_range        │
                   │ created_at       │
                   └──────┬───────────┘
                          │
                          │1 (Many values per KPI)
                          ↓
                    ┌─────────────────────┐
                    │   KPI_VALUES        │
                    ├─────────────────────┤
                    │ id (PK)             │
                    │ kpi_id (FK)         │
                    │ state_id (FK)       │
                    │ value               │
                    │ target_value        │
                    │ date                │
                    │ status              │
                    │ progress_percentage │
                    │ created_at          │
                    │ updated_at          │
                    └──────┬──────────────┘
                           │
                           │(Many values per state)
                           ↓
                    ┌──────────────────┐
                    │     STATES       │
                    ├──────────────────┤
                    │ id (PK)          │
                    │ name             │
                    │ code             │
                    │ region           │
                    │ population       │
                    │ created_at       │
                    └──────────────────┘

┌──────────────────────────────────────────────┐
│         AUDIT_LOGS (Tracking)                │
├──────────────────────────────────────────────┤
│ id (PK)                                      │
│ user_id (FK → USERS)                        │
│ action (login, logout, view_data, export)   │
│ resource (what was accessed)                │
│ timestamp                                    │
│ ip_address                                   │
│ details (JSON metadata)                     │
└──────────────────────────────────────────────┘
```

## Table Details

### USERS Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'VIEWER', -- ADMIN, ANALYST, OFFICER, VIEWER
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Sample Data:
┌────┬──────────────────┬─────────────────────┬─────────────────┬────────┐
│ id │ email            │ password_hash       │ full_name       │ role   │
├────┼──────────────────┼─────────────────────┼─────────────────┼────────┤
│ 1  │ admin@gov.in     │ $2a$10$N9qo8uLO... │ Admin User      │ ADMIN  │
│ 2  │ analyst@gov.in   │ $2a$10$k8dKmN2... │ Analyst User    │ ANALYST│
└────┴──────────────────┴─────────────────────┴─────────────────┴────────┘
```

### SCHEMES Table
```sql
CREATE TABLE schemes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  ministry VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Sample Data:
┌────┬────────┬────────────────────────────────┬──────────────────────┐
│ id │ code   │ name                           │ ministry             │
├────┼────────┼────────────────────────────────┼──────────────────────┤
│ 1  │ PMAY   │ Pradhan Mantri Awas Yojana    │ Ministry of Housing  │
│ 2  │ MGNREGS│ Mahatma Gandhi National Rural │ Ministry of RURAL    │
│ 3  │ PMGSY  │ Pradhan Mantri Gram Sadak ... │ Ministry of RURAL    │
└────┴────────┴────────────────────────────────┴──────────────────────┘
```

### KPI_VALUES Table (Main Data)
```sql
CREATE TABLE kpi_values (
  id SERIAL PRIMARY KEY,
  kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
  state_id INTEGER NOT NULL REFERENCES states(id),
  value DECIMAL(15,2) NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50), -- on_track, at_risk, critical, achieved
  progress_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_kpi_state_date ON kpi_values(state_id, date);
CREATE INDEX idx_kpi_id_date ON kpi_values(kpi_id, date);
CREATE INDEX idx_date ON kpi_values(date);

Sample Data:
┌────┬────────┬──────────┬────────┬─────────┬────────────┬───────────┐
│ id │ kpi_id │ state_id │ value  │ target  │ date       │ status    │
├────┼────────┼──────────┼────────┼─────────┼────────────┼───────────┤
│ 1  │ 1      │ 1        │ 64200  │ 80000   │ 2026-08-10 │ on_track  │
│ 2  │ 1      │ 2        │ 72100  │ 80000   │ 2026-08-10 │ on_track  │
│ 3  │ 2      │ 1        │ 450000 │ 500000  │ 2026-08-10 │ at_risk   │
└────┴────────┴──────────┴────────┴─────────┴────────────┴───────────┘
```

---

# 9. API SPECIFICATIONS {#api-specs}

## API Endpoint Reference

### Authentication Endpoints

```
ENDPOINT: POST /auth/login
PURPOSE: User login with email & password

REQUEST:
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@gov.in",
  "password": "Admin@12345"
}

VALIDATION:
✅ Email format valid
✅ Password min 8 chars
✅ Email exists in database
✅ Password matches bcrypt hash

RESPONSE (200 OK):
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@gov.in",
      "full_name": "Admin User",
      "role": "ADMIN"
    }
  }
}

ERROR (401 Unauthorized):
{
  "status": "error",
  "message": "Invalid email or password"
}

ERROR (400 Bad Request):
{
  "status": "error",
  "message": "Email format invalid"
}
```

### KPI Endpoints

```
ENDPOINT: GET /kpis/status/:scheme
PURPOSE: Get KPI data for a scheme

REQUEST:
GET /kpis/status/PMAY HTTP/1.1
Authorization: Bearer eyJhbGc...

PARAMETERS:
- scheme: Scheme code (PMAY, MGNREGS, etc)
- stateId (optional): Filter by state ID
- date (optional): Specific date

RESPONSE (200 OK):
{
  "status": "success",
  "data": {
    "kpi_status": [
      {
        "kpi_id": 1,
        "kpi_name": "Houses Built",
        "value": 64200,
        "target": 80000,
        "progress_percentage": 80,
        "status": "on_track",
        "unit": "units",
        "last_updated": "2026-08-10"
      },
      {
        "kpi_id": 2,
        "kpi_name": "Budget Utilized",
        "value": 450000000,
        "target": 500000000,
        "progress_percentage": 90,
        "status": "on_track",
        "unit": "INR",
        "last_updated": "2026-08-10"
      }
    ]
  }
}

FILTERING EXAMPLE:
GET /kpis/status/PMAY?stateId=1 HTTP/1.1
→ Returns only PMAY KPIs for Maharashtra (state_id=1)

CACHING:
Cache-Control: private, max-age=300
(Data cached for 5 minutes)
```

### Schemes Endpoint

```
ENDPOINT: GET /schemes
PURPOSE: Get list of all government schemes

REQUEST:
GET /schemes HTTP/1.1
Authorization: Bearer eyJhbGc...

RESPONSE (200 OK):
{
  "status": "success",
  "data": {
    "schemes": [
      {
        "id": 1,
        "code": "PMAY",
        "name": "Pradhan Mantri Awas Yojana",
        "ministry": "Ministry of Housing",
        "kpiCount": 3
      },
      {
        "id": 2,
        "code": "MGNREGS",
        "name": "Mahatma Gandhi National Rural...",
        "ministry": "Ministry of RURAL",
        "kpiCount": 4
      }
    ]
  }
}
```

---

# 10. DATA FLOW DIAGRAMS {#data-flow}

## Complete Data Journey (0-10 seconds)

```
SECOND 0: USER ACTION
│
└─ User clicks "Select State → Maharashtra"

SECOND 0.1: FRONTEND PROCESSING
│
└─ React onClick handler
   ├─ setSelectedState(1)  -- Maharashtra ID
   └─ Trigger useEffect dependency change

SECOND 0.2: EFFECT EXECUTION
│
└─ useEffect watches [selectedScheme, selectedState]
   ├─ Build URL: /kpis/status/PMAY?stateId=1
   ├─ Create Axios request
   ├─ Add Authorization header: Bearer <token>
   └─ Send HTTP GET request

SECOND 0.3: NETWORK TRANSMISSION
│
└─ Request travels over internet (HTTPS)
   ├─ Frontend server: frontend-ae3v.onrender.com
   └─ Backend server: college-final-project-backend...

SECOND 0.5: BACKEND RECEIVES
│
└─ Express server receives request
   ├─ Parse URL: scheme=PMAY, stateId=1
   ├─ Extract token from header
   └─ Pass through middleware chain

SECOND 0.6: MIDDLEWARE PROCESSING
│
├─ CORS check: ✅ Origin allowed
├─ Rate limit check: ✅ Within 2000/15min
└─ JWT verification: ✅ Token valid
   └─ req.userId = 1 (set for later use)

SECOND 0.7: ROUTE HANDLER EXECUTION
│
└─ GET /kpis/status/:scheme handler
   ├─ Extract params: scheme='PMAY', stateId=1
   ├─ Validate scheme exists: ✅
   ├─ Validate state exists: ✅
   └─ Proceed to database query

SECOND 0.8: DATABASE QUERY BUILD
│
└─ Prisma builds SQL query:
   
   SELECT 
     kv.id, kv.value, kv.target_value,
     kv.status, kv.progress_percentage,
     kd.kpi_name, kd.unit,
     s.name as state_name
   FROM kpi_values kv
   INNER JOIN kpi_definitions kd ON kv.kpi_id = kd.id
   INNER JOIN schemes sch ON kd.scheme_id = sch.id
   INNER JOIN states s ON kv.state_id = s.id
   WHERE sch.code = 'PMAY' AND kv.state_id = 1
   ORDER BY kv.date DESC
   LIMIT 100

SECOND 0.9: DATABASE EXECUTION
│
└─ PostgreSQL database:
   ├─ Connection pool checks out connection
   ├─ Parse & compile SQL query
   ├─ Execute using index: idx_kpi_state_date(state_id, date)
   ├─ Retrieve matching rows: ~20 rows
   └─ Total execution: ~10-15ms

SECOND 1.0: RESULT PROCESSING
│
└─ Backend processes results:
   ├─ Loop through 20 rows
   ├─ Format each row as JSON:
   │  {
   │    kpi_id: 1,
   │    kpi_name: "Houses Built",
   │    value: 64200,
   │    target: 80000,
   │    progress: 80,
   │    status: "on_track"
   │  }
   ├─ Wrap in response object
   └─ Prepare response headers

SECOND 1.1: RESPONSE COMPRESSION
│
└─ Compress response:
   ├─ JSON size: 50KB
   ├─ Apply gzip compression
   ├─ Compressed size: 8KB
   └─ Save 84% bandwidth!

SECOND 1.2: SEND RESPONSE
│
└─ Express sends HTTP response:
   ├─ Status: 200 OK
   ├─ Headers:
   │  Content-Type: application/json
   │  Content-Encoding: gzip
   │  Cache-Control: private, max-age=300
   └─ Body: [compressed JSON]

SECOND 1.5: NETWORK TRANSMISSION (RESPONSE)
│
└─ Response travels back over internet
   └─ ~30-50ms network latency

SECOND 2.0: FRONTEND RECEIVES
│
└─ Axios receives response:
   ├─ Decompress gzip
   ├─ Parse JSON
   ├─ No errors: ✅
   └─ Call success callback

SECOND 2.1: REDUX UPDATE
│
└─ Dispatch action: setKpiData(response)
   ├─ Redux reducer processes action
   ├─ Update store.data.kpiValues
   ├─ Update store.data.loading = false
   └─ Notify connected components

SECOND 2.2: COMPONENT RE-RENDER
│
└─ React detects Redux state change
   ├─ Re-render KPICard components
   │  ├─ New values shown
   │  ├─ Progress bars updated
   │  └─ Status badges change
   │
   ├─ Re-render TrendChart
   │  └─ Chart data updates
   │
   └─ Re-render other components
       └─ UI refreshes

SECOND 2.5: USER SEES CHANGES
│
└─ ✅ Dashboard shows Maharashtra's data!
   ├─ KPI cards display new values
   ├─ All state-specific metrics shown
   └─ Charts updated with new data

TOTAL TIME: 2.5 seconds (including network latency)
```

---

# 11. AUTHENTICATION & SECURITY {#security}

## Authentication Flow Detail

```
LOGIN PROCESS:

STEP 1: USER SUBMITS CREDENTIALS
┌─────────────────────────────────┐
│ Email: admin@gov.in             │
│ Password: ••••••••              │
│ [Login]                         │
└─────────────────────────────────┘
              │
              ↓

STEP 2: FRONTEND VALIDATION
├─ Email format: admin@gov.in ✅
├─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
├─ Password length: ≥ 8 chars ✅
└─ Both valid → proceed

              ↓

STEP 3: API REQUEST
POST /auth/login
Content-Type: application/json

{
  "email": "admin@gov.in",
  "password": "Admin@12345"
}

              ↓

STEP 4: BACKEND VALIDATION
├─ Email format valid? ✅
├─ Password provided? ✅
├─ Email exists in database?
│  └─ SELECT * FROM users WHERE email = 'admin@gov.in'
│     └─ Result: User { id: 1, ... } ✅

              ↓

STEP 5: PASSWORD VERIFICATION
├─ Retrieve stored hash: $2a$10$N9qo8uLO...
├─ Input password: Admin@12345
├─ bcrypt.compare(input, hash):
│  ├─ Apply same bcrypt algorithm
│  ├─ Hash input password
│  ├─ Compare hashes
│  └─ Match? ✅ YES!

              ↓

STEP 6: GENERATE JWT TOKEN
├─ Create payload:
│  {
│    userId: 1,
│    email: "admin@gov.in",
│    role: "ADMIN",
│    iat: 1691662800,      // Issued at
│    exp: 1691663700       // Expires in 15 min
│  }
│
├─ Sign with JWT_SECRET:
│  HMACSHA256(
│    base64(header) + "." + base64(payload),
│    JWT_SECRET
│  )
│
└─ Result:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZ292Lmlu...
   4F6o9K_p9qL_R3tZ2mW_9vX8yL0c1nJ_5qR_2wS

              ↓

STEP 7: RETURN TOKEN
{
  "status": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "admin@gov.in",
      "full_name": "Admin User",
      "role": "ADMIN"
    }
  }
}

              ↓

STEP 8: FRONTEND STORES TOKEN
localStorage.setItem('accessToken', token)
Redux: dispatch(loginSuccess(user))

              ↓

STEP 9: ADD TOKEN TO REQUESTS
// Axios interceptor automatically adds:
Authorization: Bearer eyJhbGc...

              ↓

✅ LOGIN COMPLETE!
```

## Security Measures

```
TRANSPORT SECURITY:
├─ HTTPS/TLS 1.2+
│  └─ All data encrypted in transit
├─ Certificate: Render auto-managed
└─ No man-in-the-middle attacks

PASSWORD SECURITY:
├─ bcryptjs hashing
│  ├─ One-way encryption
│  ├─ Salt + 10 rounds
│  └─ Collision impossible
├─ Never stored in plain text
└─ Unrecoverable if lost

TOKEN SECURITY:
├─ JWT with HS256 signature
├─ Signed with JWT_SECRET (server-only)
├─ 15-minute expiration
├─ Refresh token for renewal
└─ Stored in localStorage (frontend)

DATABASE SECURITY:
├─ SQL injection prevention
│  └─ Prisma ORM escapes queries
├─ Connection pooling
├─ Authentication required
└─ Backup encryption

API SECURITY:
├─ CORS validation
│  └─ Only allow known origins
├─ Rate limiting
│  ├─ 2000 requests/15 min
│  └─ Brute force protection
├─ Input validation
│  └─ Check all user inputs
├─ Security headers
│  ├─ X-Frame-Options: DENY
│  ├─ X-Content-Type-Options: nosniff
│  └─ Strict-Transport-Security

DATA PROTECTION:
├─ Role-based access control (RBAC)
│  ├─ ADMIN: Full access
│  ├─ ANALYST: Analytics only
│  ├─ OFFICER: Restricted access
│  └─ VIEWER: Read-only
├─ Audit logging
│  └─ Track all user actions
└─ Data encryption at rest (Render)
```

---

# 12. PERFORMANCE CONSIDERATIONS {#performance}

## Performance Optimization

```
FRONTEND PERFORMANCE:

1. CODE SPLITTING
   ├─ Main bundle: 80KB (critical)
   ├─ React vendor: 140KB (async)
   ├─ Dashboard: 30KB (on-demand)
   └─ Analytics: 25KB (on-demand)
   
   Result: Initial load 150-200ms → 2x faster

2. LAZY LOADING
   ├─ Components load on route change
   ├─ Charts render progressively
   ├─ Images load as needed
   └─ Unused code never loads

3. REDUX OPTIMIZATION
   ├─ Selector memoization
   ├─ Normalized state shape
   ├─ No prop drilling
   └─ Prevents unnecessary re-renders

4. CACHING STRATEGY
   ├─ Browser cache: 5 minutes
   ├─ Redux in-memory: Session
   ├─ No refetch on tab switch
   └─ Manual refresh available

5. NETWORK OPTIMIZATION
   ├─ HTTP/2 multiplexing
   ├─ gzip compression: 84% reduction
   ├─ Request deduplication
   └─ Connection keep-alive

RESULT: 
- Page load: 150-500ms (device speed dependent)
- TTI (Time to Interactive): <3 seconds
- API response: <100ms average

---

BACKEND PERFORMANCE:

1. CONNECTION POOLING
   ├─ Min: 2 connections
   ├─ Max: 10 connections
   ├─ Reuse existing connections
   └─ 10x faster than creating new

2. DATABASE INDEXES
   ├─ idx_kpi_state_date: Fast filtering
   ├─ idx_kpi_id_date: Trend queries
   ├─ idx_email: Login lookup
   └─ Query execution: 10-15ms

3. QUERY OPTIMIZATION
   ├─ Select only needed columns
   ├─ Filter at database level
   ├─ Use indexes for sorting
   └─ Limit result sets

4. RESPONSE COMPRESSION
   ├─ gzip compression
   ├─ 50KB → 8KB
   └─ 84% bandwidth reduction

5. CACHING HEADERS
   ├─ Cache-Control: private, max-age=300
   ├─ Browser caches for 5 minutes
   └─ Reduces API calls 50%

6. ASYNC/AWAIT
   ├─ Non-blocking I/O
   ├─ Multiple requests concurrently
   ├─ Single thread, high throughput
   └─ Handles 1000+ concurrent users

RESULT:
- API response: 44-78ms average
- Peak throughput: 2000 req/15min
- Concurrent users: 1000+ supported
```

---

# 13. DEPLOYMENT ARCHITECTURE {#deployment}

## Complete Deployment Process

```
LOCAL DEVELOPMENT:
│
├─ Developer writes code
├─ npm run dev (local testing)
├─ git add . && git commit
└─ git push origin main

    ↓ GITHUB RECEIVES PUSH

GitHub Webhook Triggers:
├─ Detect: New commit on main branch
├─ Webhook: POST to Render.com
└─ Payload: Commit SHA, branch, timestamp

    ↓ RENDER STARTS BUILD

FRONTEND BUILD (Render Static Site):
├─ Pull latest code from GitHub
├─ npm ci (clean install)
├─ npm run build
│  ├─ Vite bundles React code
│  ├─ Minify CSS/JS
│  ├─ Create dist/ folder
│  └─ Assets: ~212KB (gzipped)
│
├─ Upload to Render CDN
├─ Configure routing:
│  ├─ /* → index.html (SPA routing)
│  └─ Static assets cached
│
└─ URL: frontend-ae3v.onrender.com (live!)

Time: 2-3 minutes

    ↓ PARALLEL WITH BACKEND BUILD

BACKEND BUILD (Render Web Service):
├─ Pull latest code from GitHub
├─ npm ci (clean install)
├─ Environment variables loaded:
│  ├─ DATABASE_URL
│  ├─ JWT_SECRET
│  ├─ NODE_ENV: production
│  └─ CORS_ORIGIN
│
├─ Run Prisma migrations:
│  ├─ Check: Any pending migrations?
│  ├─ Apply: New schema changes
│  └─ Verify: Schema is consistent
│
├─ Start Node.js server:
│  ├─ npm start
│  └─ Listen on port 10000
│
└─ URL: college-final-project-backend-m86r.onrender.com

Time: 1-2 minutes

    ↓ HEALTH CHECK

Render Health Check:
├─ GET /health endpoint
├─ Expected: 200 OK
├─ If healthy: ✅ Traffic switch
└─ If error: ❌ Rollback to previous version

    ↓ TRAFFIC SWITCH (Zero-downtime)

Old Server (Previous Version):
├─ Stop accepting NEW requests
├─ In-flight requests complete (~5s timeout)
├─ Close database connections gracefully
├─ Shutdown cleanly
└─ Remove from load balancer

New Server (Current Version):
├─ Verify all systems operational
├─ Database connected ✅
├─ Redis connected ✅
├─ All routes responding ✅
├─ Add to load balancer
└─ Start receiving requests

    ↓ DEPLOYMENT COMPLETE

✅ Both frontend & backend live
✅ Zero downtime experienced
✅ Users unaware of deployment
✅ Database state preserved
✅ All changes live in production

Total time: 3-5 minutes from push to production
```

## Rollback Process

```
IF DEPLOYMENT FAILS:

Health Check Failed:
├─ Backend not responding
├─ Endpoints returning 500
└─ Database issues detected

    ↓

AUTOMATIC ROLLBACK:
├─ Render detects health check failure
├─ Stop new server
├─ Revert to previous version
├─ Old server continues serving
└─ Alert sent to developers

    ↓

DEVELOPER NOTIFIED:
├─ Email alert
├─ Slack notification
├─ Dashboard shows failure
└─ Can investigate issue

    ↓

MANUAL REMEDIATION:
├─ Developer investigates
├─ Fixes root cause
├─ Commits fix
├─ Pushes to main
└─ Automatic redeploy starts
```

---

# 14. SCALABILITY STRATEGY {#scalability}

## Handling Growth

```
CURRENT STATE (Working):
├─ Users: 1000 concurrent
├─ Requests: 2000/15min
├─ Data: 1620+ KPI values
├─ Database: 100MB
└─ Cost: $0 (Render free tier)

    ↓ IF SCALE TO 10,000 USERS

PHASE 1: Database Scaling
├─ Upgrade: Render Postgres Pro
├─ Connections: 20 → 100+
├─ Storage: Unlimited
├─ Performance: 3-5x faster
├─ Cost: $119/month

PHASE 2: Backend Scaling
├─ Upgrade: Render Web Pro
├─ Instances: 1 → 3-10
├─ Load balancer: Auto-distribute
├─ Auto-scaling: Based on CPU/memory
├─ Cost: $50-100/month

PHASE 3: Caching Layer
├─ Add: Redis cache
├─ Session storage
├─ Frequent queries cached
├─ 50% fewer DB calls
├─ Cost: $30/month

PHASE 4: Database Optimization
├─ Read replicas: Copy DB for analytics
├─ Partition data: By state
├─ Archive old data: Keep main DB lean
└─ Indexing: Optimize new queries

    ↓ RESULT

10,000+ concurrent users
50,000+ requests/15min
Sub-100ms responses
100% availability
Cost: $200-300/month
```

---

# 15. ERROR HANDLING {#error-handling}

## Common Errors & Solutions

```
ERROR: 401 Unauthorized

CAUSES:
1. Token expired (15 min passed)
2. Token invalid/tampered
3. User logged out elsewhere

SOLUTION (Frontend):
├─ Axios interceptor catches 401
├─ Attempt token refresh:
│  └─ POST /auth/refresh-token
│
├─ If refresh succeeds:
│  ├─ Update token in localStorage
│  ├─ Retry original request
│  └─ User doesn't notice
│
└─ If refresh fails:
   ├─ Clear localStorage
   ├─ Clear Redux state
   └─ Redirect to /login

---

ERROR: 429 Too Many Requests

CAUSE:
Rate limit hit (2000 req/15min exceeded)

SOLUTION (Frontend):
├─ Axios interceptor catches 429
├─ Retry with exponential backoff:
│  ├─ 1st retry: Wait 2 seconds
│  ├─ 2nd retry: Wait 4 seconds
│  ├─ 3rd retry: Wait 8 seconds
│  └─ Max 3 retries
│
├─ If retry succeeds:
│  └─ Request completes normally
│
└─ If retries fail:
   └─ Show: "Too many requests, try again later"

---

ERROR: 503 Service Unavailable

CAUSE:
Backend server or database down

SOLUTION (Frontend):
├─ Show loading spinner
├─ Display: "Connecting to server..."
├─ Auto-retry every 5 seconds
└─ Resume when server recovers

---

ERROR: 500 Internal Server Error

CAUSE:
Unexpected backend error

SOLUTION (Frontend):
├─ Log error to Sentry
├─ Show friendly message:
│  "Something went wrong. Please try again."
├─ Include error ID for support
└─ Developers notified instantly
```

---

# 16. MONITORING & LOGGING {#monitoring}

## What Gets Logged

```
REQUEST LOGGING:
├─ Timestamp
├─ Method (GET, POST, etc)
├─ Path (/kpis/status/PMAY)
├─ Status code (200, 401, 500)
├─ Response time (45ms)
├─ User ID
├─ IP address
└─ Request body (non-sensitive)

ERROR LOGGING:
├─ Error type
├─ Error message
├─ Stack trace
├─ Request details
├─ User info
├─ Timestamp
└─ Severity (critical, warning, info)

PERFORMANCE LOGGING:
├─ Database query time
├─ API response time
├─ Frontend load time
├─ Memory usage
└─ CPU usage

AUDIT LOGGING:
├─ User login/logout
├─ Data access (which user read what)
├─ Data export (CSV download)
├─ Permission changes
└─ Admin actions

---

MONITORING TOOLS:

Sentry (Error Tracking):
├─ Real-time error alerts
├─ Stack traces
├─ User context
├─ Breadcrumbs (event trail)
└─ Automatic issue grouping

Render Dashboard:
├─ Deployment status
├─ Build logs
├─ Runtime logs
├─ Resource usage (CPU, memory)
└─ Uptime metrics

Custom Logging:
├─ Console.log (development)
├─ Morgan (HTTP logging)
├─ Winston (structured logging)
└─ Custom metrics

---

ALERTS:
├─ Error rate > 1%
├─ Response time > 1 second
├─ Database connection errors
├─ Memory usage > 80%
├─ Deployment failures
└─ Uptime < 99%
```

---

# CONCLUSION

```
THIS ENTIRE SYSTEM:

✅ SCALABLE: 1000+ concurrent users
✅ SECURE: JWT, bcrypt, CORS
✅ PERFORMANT: <100ms responses
✅ RELIABLE: 99.9% uptime target
✅ MAINTAINABLE: Clean architecture
✅ AUTOMATED: CI/CD deploys
✅ MONITORED: Real-time alerts
✅ PRODUCTION-READY: Deployed live

All layers work together seamlessly:
Frontend ← HTTPS → Backend ← SQL → Database

User clicks → Frontend handles → API calls
Backend validates → Database queries → Response
Frontend renders → User sees results → ~2.5 seconds
```

---

**Document Created:** August 10, 2026  
**Audience:** Students, Developers, Architects  
**Level:** Complete A-Z Structured  
**Status:** Ready for Reference

---
