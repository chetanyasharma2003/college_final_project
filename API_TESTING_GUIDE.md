# 🧪 API TESTING GUIDE - Test All Endpoints

Copy-paste these commands to test everything! 

---

## 🔐 AUTHENTICATION APIs

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@12345",
    "fullName": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@govschemes.in",
    "password": "Admin@12345"
  }'
```

**⚠️ IMPORTANT:** Copy the `accessToken` from response. Use it in next requests like:
```bash
curl http://localhost:5000/api/v1/schemes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Current User (Protected)
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 SCHEMES APIs

### 1. Get All Schemes
```bash
curl http://localhost:5000/api/v1/schemes
```

**Response includes:** 6 schemes (PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, SAGY) with KPI definitions

### 2. Get Single Scheme by ID
```bash
curl http://localhost:5000/api/v1/schemes/1
```

### 3. Get Scheme by Code
```bash
# Get PMAY scheme
curl http://localhost:5000/api/v1/schemes/code/PMAY

# Get MGNREGS scheme
curl http://localhost:5000/api/v1/schemes/code/MGNREGS

# Try: PMGSY, NRLM, DDU-GKY, SAGY
```

### 4. Get Scheme Performance
```bash
curl http://localhost:5000/api/v1/schemes/1/performance
```

### 5. Paginated Schemes List
```bash
curl "http://localhost:5000/api/v1/schemes/list?page=1&limit=3"
```

### 6. Compare Multiple Schemes
```bash
curl -X POST http://localhost:5000/api/v1/schemes/compare \
  -H "Content-Type: application/json" \
  -d '{
    "schemeIds": [1, 2, 3]
  }'
```

---

## 📈 KPIs APIs

### 1. Get All KPI Definitions
```bash
curl http://localhost:5000/api/v1/kpis
```

### 2. Get KPIs for Specific Scheme
```bash
# PMAY KPIs
curl "http://localhost:5000/api/v1/kpis?schemeId=1"

# MGNREGS KPIs
curl "http://localhost:5000/api/v1/kpis?schemeId=2"
```

### 3. Get Latest KPI Values
```bash
curl http://localhost:5000/api/v1/kpis/latest
```

### 4. Get KPI by ID with History
```bash
curl http://localhost:5000/api/v1/kpis/1
```

### 5. Get KPI Trend (Last 90 days)
```bash
curl http://localhost:5000/api/v1/kpis/1/trend
```

### 6. Get KPI Statistics
```bash
curl http://localhost:5000/api/v1/kpis/1/statistics
```

### 7. Get KPI Status Breakdown
```bash
curl http://localhost:5000/api/v1/kpis/1/status
```

### 8. Get Top Performing States
```bash
curl http://localhost:5000/api/v1/kpis/1/top?limit=5
```

### 9. Get Bottom Performing States
```bash
curl http://localhost:5000/api/v1/kpis/1/bottom?limit=5
```

### 10. Add New KPI Value (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/kpis/values \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "kpi_id": 1,
    "state_id": 1,
    "value": 15000,
    "date": "2026-08-08"
  }'
```

---

## 🗺️ GEOGRAPHIC APIs

### 1. Get All States
```bash
curl http://localhost:5000/api/v1/geo/states
```

**Response:** 6 states (Maharashtra, Tamil Nadu, UP, etc.)

### 2. Get State with Districts
```bash
curl http://localhost:5000/api/v1/geo/states/1
```

### 3. Get State Statistics
```bash
curl http://localhost:5000/api/v1/geo/states/1/stats
```

### 4. Get Districts for State
```bash
# Maharashtra (state ID 1)
curl "http://localhost:5000/api/v1/geo/districts?stateId=1"

# Tamil Nadu (state ID 2)
curl "http://localhost:5000/api/v1/geo/districts?stateId=2"
```

### 5. Get District with Blocks
```bash
curl http://localhost:5000/api/v1/geo/districts/1
```

### 6. Get Blocks for District
```bash
curl "http://localhost:5000/api/v1/geo/blocks?districtId=1"
```

### 7. Get Block with Villages
```bash
curl http://localhost:5000/api/v1/geo/blocks/1
```

### 8. Get Villages for Block
```bash
curl "http://localhost:5000/api/v1/geo/villages?blockId=1"
```

### 9. Get Village Details
```bash
curl http://localhost:5000/api/v1/geo/villages/1
```

### 10. Search Locations
```bash
# Search for "Maharashtra"
curl "http://localhost:5000/api/v1/geo/search?q=maharashtra"

# Search for "Mumbai"
curl "http://localhost:5000/api/v1/geo/search?q=mumbai"
```

### 11. Get Full Geographic Hierarchy
```bash
# All states with districts
curl http://localhost:5000/api/v1/geo/hierarchy

# Specific state hierarchy
curl "http://localhost:5000/api/v1/geo/hierarchy?stateId=1"
```

---

## 🎯 COMMON WORKFLOWS

### Workflow 1: Explore All Data
```bash
# 1. Get schemes
curl http://localhost:5000/api/v1/schemes

# 2. Get KPIs for first scheme
curl "http://localhost:5000/api/v1/kpis?schemeId=1"

# 3. Get latest KPI values
curl http://localhost:5000/api/v1/kpis/latest

# 4. Get states
curl http://localhost:5000/api/v1/geo/states

# 5. Get districts for first state
curl "http://localhost:5000/api/v1/geo/districts?stateId=1"
```

### Workflow 2: Compare Performance
```bash
# 1. Get top performers for KPI 1
curl http://localhost:5000/api/v1/kpis/1/top?limit=5

# 2. Get bottom performers for KPI 1
curl http://localhost:5000/api/v1/kpis/1/bottom?limit=5

# 3. Get statistics for KPI 1
curl http://localhost:5000/api/v1/kpis/1/statistics

# 4. Get KPI trend
curl http://localhost:5000/api/v1/kpis/1/trend
```

### Workflow 3: Drill Down Geographic Data
```bash
# 1. Get all states
curl http://localhost:5000/api/v1/geo/states

# 2. Pick state 1, get its districts
curl "http://localhost:5000/api/v1/geo/districts?stateId=1"

# 3. Pick district 1, get its blocks
curl "http://localhost:5000/api/v1/geo/blocks?districtId=1"

# 4. Pick block 1, get its villages
curl "http://localhost:5000/api/v1/geo/villages?blockId=1"

# 5. Get village 1 details
curl http://localhost:5000/api/v1/geo/villages/1
```

### Workflow 4: Login & Access Protected Data
```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@govschemes.in",
    "password": "Admin@12345"
  }'

# 2. Copy accessToken from response

# 3. Use token to add KPI value
curl -X POST http://localhost:5000/api/v1/kpis/values \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{
    "kpi_id": 1,
    "state_id": 1,
    "value": 20000
  }'

# 4. Get current user
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

---

## 📝 EXPECTED RESPONSES

### Success Response Format
```json
{
  "status": "success",
  "data": { /* actual data */ },
  "count": 6
}
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

---

## 🧑‍💻 BETTER WAY: USE POSTMAN

Instead of curl, download **Postman** for better testing:

1. Download: https://www.postman.com/downloads/
2. Create new collection
3. Create requests for each endpoint
4. Save authorization token in variables
5. Test complete workflows

---

## 📊 DATA TO EXPECT

### Schemes (6 Total)
```
1. PMAY - Pradhan Mantri Awas Yojana
2. MGNREGS - Mahatma Gandhi National Rural Employment
3. PMGSY - Pradhan Mantri Gram Sadak Yojana
4. NRLM - National Rural Livelihood Mission
5. DDU-GKY - Deen Dayal Upadhyaya Scheme
6. SAGY - Sansad Adarsh Gram Yojana
```

### Geographic (131 Total)
```
States: 6 (Maharashtra, Tamil Nadu, UP, Madhya Pradesh, Karnataka, Bihar)
Districts: 18 (3 per state)
Blocks: 36 (2 per district)
Villages: 72 (2 per block)
Total: 131 locations
```

### KPI Data
```
50+ KPI definitions
Real-time values for all KPIs
All states with realistic data
Performance status (on-track, at-risk, critical)
```

---

## ✅ QUICK VERIFICATION

Run these 5 commands to verify everything works:

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Get schemes
curl http://localhost:5000/api/v1/schemes | grep -c "PMAY"

# 3. Get states
curl http://localhost:5000/api/v1/geo/states | grep -c "Maharashtra"

# 4. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@govschemes.in","password":"Admin@12345"}' | grep "accessToken"

# 5. Get KPIs
curl http://localhost:5000/api/v1/kpis | grep -c "kpi_name"
```

If all 5 return data → **Everything is working!** ✅

---

**Status:** Ready for Frontend Integration  
**APIs Ready:** 40+  
**Data Seeded:** Yes (1000+ records)  
**Test Accounts:** 2 (Admin + Analyst)  
**Next:** Build React frontend components!
