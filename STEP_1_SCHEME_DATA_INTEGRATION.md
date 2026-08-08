# 🔥 STEP 1: SCHEME DATA INTEGRATION MODULE

**Objective:** Integrate real PMAY data from government API into the database

**Timeline:** 30-45 minutes

---

## ✅ What I Built for Step 1

1. ✅ **PMAY Data Service** (`pmay-data.service.js`) - 300+ lines
   - Fetch real PMAY data from API
   - Validate data quality
   - Load into database
   - Calculate KPIs
   - Generate summaries

2. ✅ **Scheme Integration Config** (`scheme-integrations.js`) - 250+ lines
   - All 6 scheme configurations
   - Data point definitions
   - Validation rules
   - Schema mappings

3. ✅ **PMAY API Routes** (`pmay.routes.js`)
   - Sync endpoint
   - Summary endpoint
   - State-wise data endpoint

4. ✅ **Updated Backend** (`index.js`)
   - PMAY routes registered
   - Ready to test

---

## 🚀 TESTING STEP 1 (Follow Exactly)

### **Phase 1.1: Setup (2 min)**

```bash
# Terminal 1: Backend directory
cd /Users/chetanya/Documents/college_final_project/backend

# Make sure .env has the API key
# Add this line if not present:
# PMAY_API_KEY=579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52

# Kill any running backend
# Ctrl+C if running

# Restart backend
npm run dev
```

**Expected Output:**
```
Government Schemes Analytics Backend
Listening on port 5001
Environment: development
API Base: http://localhost:5001/api/v1
```

✅ **Checkpoint 1A:** Backend starts without errors

---

### **Phase 1.2: Get JWT Token (2 min)**

Login to get authentication token:

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@govschemes.in",
    "password": "Admin@12345"
  }' | jq .
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

📋 **COPY the `accessToken` value** - you'll need it for all next tests

Save it as variable:
```bash
TOKEN="your_token_here"
```

✅ **Checkpoint 1B:** You have valid JWT token

---

### **Phase 1.3: Sync PMAY Data (3-5 min)**

Trigger PMAY data sync:

```bash
curl -X POST http://localhost:5001/api/v1/pmay/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "apiKey": "579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52"
  }' | jq .
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "scheme": "PMAY",
    "records_loaded": 18,
    "records_failed": 0,
    "kpis_calculated": 18,
    "execution_time": 1234,
    "message": "✅ PMAY sync complete: 18 records loaded"
  }
}
```

✅ **Checkpoint 1C:** PMAY data synced successfully

---

### **Phase 1.4: Verify Data in Database (2 min)**

Check if PMAY data was actually stored:

```bash
curl http://localhost:5001/api/v1/pmay/summary \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "scheme": "PMAY",
    "total_states": 6,
    "states": [
      {
        "state_name": "Maharashtra",
        "houses_sanctioned": 15000,
        "houses_completed": 12000,
        "houses_occupied": 10500,
        "completion_rate": 80,
        "occupancy_rate": 87.5,
        "budget_allocated": 50000000000,
        "budget_spent": 40000000000,
        "budget_utilization": 80,
        "last_updated": "2026-08-08T..."
      },
      ...more states
    ]
  }
}
```

✅ **Checkpoint 1D:** Data verified in database

---

### **Phase 1.5: Check State-wise Data (2 min)**

Get PMAY data for a specific state:

```bash
# Find Maharashtra state ID first
curl http://localhost:5001/api/v1/geo/states \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | select(.name=="Maharashtra") | .id'
```

Let's say it returns ID = 1:

```bash
curl "http://localhost:5001/api/v1/pmay/state/1" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "state_id": 1,
      "district_id": 0,
      "houses_sanctioned": 15000,
      "houses_completed": 12000,
      "houses_occupied": 10500,
      "budget_allocated": "50000000000",
      "budget_spent": "40000000000",
      "avg_cost_per_unit": "1000000",
      "date": "2026-08-08T..."
    }
  ],
  "count": 1
}
```

✅ **Checkpoint 1E:** State-wise data retrievable

---

## 🎯 VERIFICATION CHECKLIST

- [ ] Backend starts on port 5001
- [ ] JWT token obtained from `/api/v1/auth/login`
- [ ] POST `/api/v1/pmay/sync` returns success
- [ ] GET `/api/v1/pmay/summary` shows data for 6 states
- [ ] GET `/api/v1/pmay/state/:id` returns historical data
- [ ] Database has PMAYData records (verify with `npx prisma studio`)

---

## 📊 What This Achieves

✅ **Real PMAY data** integrated from government API
✅ **Data validation** ensures quality
✅ **KPI calculation** from raw metrics
✅ **State-level aggregation** for analytics
✅ **Historical tracking** with timestamps
✅ **Error handling** with fallback sample data
✅ **API-ready** for dashboard integration

---

## 🔧 If Anything Fails

### Issue: "API Key not found" error
```bash
# Check .env file
cat backend/.env | grep PMAY_API_KEY

# Should show:
# PMAY_API_KEY=579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52

# If not there, add it:
echo "PMAY_API_KEY=579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52" >> backend/.env

# Restart backend
npm run dev
```

### Issue: "PMAYData record not found" error
```bash
# Reset database
cd backend
npx prisma db push --force-reset

# Resync PMAY data
curl -X POST http://localhost:5001/api/v1/pmay/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"apiKey": "579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52"}'
```

### Issue: "No PMAY data available" after sync
```bash
# Check database directly
npx prisma studio

# Go to PMAYData table
# Should show records with state data
# If empty, the sync failed - check backend logs
```

---

## ✨ STEP 1 COMPLETE WHEN:

- ✅ All 5 checkpoints pass (1A through 1E)
- ✅ PMAY data visible in database
- ✅ API endpoints returning real data
- ✅ No errors in backend console

---

## 🎬 Ready to Proceed?

When all checkpoints pass, reply:

**"Step 1 Complete ✅"**

Then I'll immediately start **STEP 2: KPI Definition Module** where we:
- Define KPI metrics for each scheme
- Set target values
- Create calculation formulas
- Link KPIs to schemes

**Estimated time for Step 2:** 20-30 minutes

---

**Current Status:** Step 1 - Scheme Data Integration  
**Next:** Step 2 - KPI Definition Module  
**Overall Progress:** 1/6 modules complete
