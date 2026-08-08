# Phase A Deployment Guide - Data Expansion & ETL

## ✅ What I've Built (Phase A Complete)

### **Backend Services** (6 new services)
1. ✅ **ETL Service** (`etl.service.js`) - Data extraction, transformation, loading
2. ✅ **Analytics Service** (`analytics.service.js`) - Comparative analysis, rankings, gaps
3. ✅ **Prediction Service** (`prediction.service.js`) - ARIMA forecasting
4. ✅ **Report Service** (`report.service.js`) - CSV/JSON export, comparisons
5. ✅ **Chatbot Service** (`chatbot.service.js`) - NLP query processing
6. ✅ **Data Source Config** (`data-sources.js`) - API mappings for 6+ schemes

### **API Routes** (5 new route files)
- ✅ `/api/v1/analytics/*` - Comparative analysis endpoints
- ✅ `/api/v1/predictions/*` - Forecasting endpoints
- ✅ `/api/v1/reports/*` - Report generation endpoints
- ✅ `/api/v1/chatbot/*` - Chatbot query processing
- ✅ `/api/v1/etl/*` - Data sync and import management

### **Database** (25 schemes + 36 states)
- ✅ Migration file for 25 government schemes
- ✅ All 36 states/UTs configured
- ✅ Generic data models for flexible storage
- ✅ Data source tracking tables
- ✅ Indexes for performance

---

## 🚀 Step 1: DATABASE SETUP

### **1.1 Apply Migrations**

```bash
# From backend directory
cd backend

# Push schema changes to database
npx prisma db push

# Generate updated Prisma client
npx prisma generate

# Verify migration
npx prisma studio  # Opens admin UI at http://localhost:5555
```

### **1.2 Seed Database with 25 Schemes + 36 States**

The migration SQL adds all 25 schemes and 36 states/UTs automatically.

Verify in Prisma Studio:
- Go to Scheme table → should show 25 records
- Go to State table → should show 36 records

---

## 🔑 Step 2: GET API KEY

### **2.1 Register on data.gov.in** (5 minutes)

1. Go to: https://data.gov.in/user/register
2. Fill form (name, email, organization, etc.)
3. Verify email
4. Login to dashboard
5. Navigate to: Account → API Management
6. Click "Generate API Key"
7. Copy the key (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### **2.2 Add to .env**

```bash
# backend/.env
DATA_GOV_API_KEY=your_api_key_here
```

### **2.3 Test API Key**

```bash
curl -X POST http://localhost:5001/api/v1/etl/sync/PMAY \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "apiKey": "your_api_key_here",
    "resourceId": "pmay_data",
    "mapping": {
      "state": "state_name",
      "district": "district_name",
      "date": "date",
      "metrics": [
        {"name": "houses_sanctioned", "field": "sanctioned"},
        {"name": "completion_rate", "field": "completion_rate"}
      ]
    }
  }'
```

---

## 📊 Step 3: TEST ALL ENDPOINTS

### **3.1 Analytics - Compare Schemes**

```bash
curl "http://localhost:5001/api/v1/analytics/compare-schemes?scheme_ids=1,2,3&days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "scheme_id": 1,
      "scheme_name": "PMAY",
      "avg_completion": 75.5,
      "critical_count": 2,
      "at_risk_count": 3,
      "on_track_count": 5
    }
  ]
}
```

### **3.2 Analytics - Compare States**

```bash
curl "http://localhost:5001/api/v1/analytics/compare-states?scheme_id=1&days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3.3 Predictions - Forecast KPI**

```bash
curl "http://localhost:5001/api/v1/predictions/kpi/1?months=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "status": "success",
    "kpi_name": "Houses Sanctioned",
    "trend": "improving",
    "next_month_prediction": 85000,
    "forecasts": [...]
  }
}
```

### **3.4 Reports - Executive Summary**

```bash
curl "http://localhost:5001/api/v1/reports/executive-summary/1?state_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3.5 Chatbot - Process Query**

```bash
curl -X POST http://localhost:5001/api/v1/chatbot/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "How is PMAY performing in Maharashtra?"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "type": "performance",
    "scheme": "PMAY",
    "state": "Maharashtra",
    "overall_completion": 72.5,
    "status": "At Risk"
  }
}
```

### **3.6 ETL - View Import History**

```bash
curl "http://localhost:5001/api/v1/etl/history?scheme_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3.7 ETL - Sync Status**

```bash
curl "http://localhost:5001/api/v1/etl/sync-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 Step 4: FRONTEND COMPONENTS (PHASE B)

Need to build these React components:

### **Components List**

```
frontend/src/pages/
├── ComparativeAnalysis.jsx       # State vs State, Scheme vs Scheme
├── PredictionsDashboard.jsx       # ARIMA forecasts, trend charts
├── ReportsHub.jsx                 # Generate and download reports
└── Chatbot.jsx                    # Chat interface with NLP

frontend/src/components/
├── AnalyticsCard.jsx              # Display comparison results
├── ForecastChart.jsx              # Recharts for predictions
├── PerformanceRanking.jsx         # Top performers table
├── ChatbotWidget.jsx              # Floating chat interface
└── ReportBuilder.jsx              # Report generation UI
```

---

## ⏰ Step 5: SCHEDULE BACKGROUND JOBS

### **5.1 Create Cron Scheduler** (`backend/src/cron/sync-data.job.js`)

```javascript
import cron from 'node-cron';
import ETLService from '../services/etl.service.js';
import { DATA_SOURCES, SYNC_SCHEDULES } from '../config/data-sources.js';

export function initializeCronJobs() {
  // Schedule PMAY daily at 2 AM
  cron.schedule(SYNC_SCHEDULES.PMAY, async () => {
    console.log('🔄 Running PMAY sync...');
    try {
      await ETLService.runETLPipeline('PMAY', DATA_SOURCES.PMAY);
      console.log('✅ PMAY sync completed');
    } catch (error) {
      console.error('❌ PMAY sync failed:', error.message);
    }
  });

  // Repeat for other schemes...
  console.log('⏰ Cron jobs initialized');
}
```

### **5.2 Register in Main Index**

```javascript
// backend/src/index.js
import { initializeCronJobs } from './cron/sync-data.job.js';

// After server starts
server.once('listening', () => {
  initializeCronJobs();
});
```

---

## 🔒 Step 6: SECURITY & RATE LIMITING

Rate limits already configured in index.js:
- General API: 100 requests/15 min per IP
- Auth endpoints: 20 requests/15 min per IP

To adjust:
```bash
# .env
RATE_LIMIT_MAX_REQUESTS=200  # Change from 100
```

---

## ✨ Step 7: VERIFICATION CHECKLIST

- [ ] Database migrations applied (`npx prisma db push`)
- [ ] 25 schemes exist in database
- [ ] 36 states exist in database  
- [ ] .env has `DATA_GOV_API_KEY`
- [ ] All 5 new services running (check `/health`)
- [ ] `/api/v1/analytics/compare-schemes` returns data
- [ ] `/api/v1/predictions/kpi/1` returns forecasts
- [ ] `/api/v1/chatbot/query` processes natural language
- [ ] `/api/v1/reports/executive-summary/1` generates report
- [ ] `/api/v1/etl/sync-status` shows import history

---

## 📊 Performance Expectations

| Endpoint | Response Time | Notes |
|----------|--------------|-------|
| Compare schemes | <500ms | Cached results |
| State rankings | <800ms | 100+ entries |
| KPI prediction | <1200ms | ARIMA calculation |
| Chatbot query | <400ms | Intent matching |
| Report export | <2000ms | CSV generation |

---

## 🎯 What's Next (Phase B)

After Phase A is verified:

1. **Build Frontend Components** for analytics, predictions, reports, chatbot
2. **Connect to Real APIs** (data.gov.in, NREGA, PMAY-MIS)
3. **Deploy to Production** (Vercel + Railway)
4. **Setup Email Notifications** for scheduled reports
5. **Implement WebSocket** for real-time KPI updates

---

## 🆘 Troubleshooting

### API Key Issues
```bash
# Test API key directly
curl "https://api.data.gov.in/resource?api-key=YOUR_KEY&resource_id=test&format=json"
```

### Migration Errors
```bash
# Reset database (CAUTION!)
npx prisma migrate reset

# Or push fresh
npx prisma db push --force-reset
```

### Rate Limit Errors
- Clear browser cookies
- Wait 15 minutes (rate window)
- Or change IP

---

## 📞 Support

For issues, check:
1. Backend logs: `npm run dev` output
2. Prisma Studio: `npx prisma studio`
3. Database: `psql -U govschemes -d gov_schemes_analytics`

---

**Status: Phase A COMPLETE ✅**
**Next: Phase B Frontend Components** 

Ready to proceed? Confirm by replying: "**Ready for Phase B**"
