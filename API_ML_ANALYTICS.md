# ML Analytics API Specification
## Government Schemes Analytics Dashboard

---

## Overview

The ML Analytics API provides intelligent data analysis capabilities using machine learning algorithms. All endpoints require JWT authentication.

**Base URL:** `http://localhost:5001/api/v1/ml-analytics`

**Authentication:** Include `Authorization: Bearer <JWT_TOKEN>` header

---

## Endpoints

### 1. Anomaly Detection

Identifies statistical outliers in KPI values using Z-score method.

**Endpoint:** `GET /anomalies/{kpiId}`

**Parameters:**
- `kpiId` (path, required): KPI identifier
- `threshold` (query, optional): Z-score threshold (default: 2.5)

**Response:**
```json
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "date": "2026-08-01T00:00:00.000Z",
        "value": 150.5,
        "zscore": 3.2,
        "isAnomaly": true,
        "severity": "HIGH"
      }
    ],
    "mean": 100.0,
    "stdDev": 15.5,
    "count": 5,
    "severity": "HIGH"
  },
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Anomalies detected or analysis complete
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/ml-analytics/anomalies/3?threshold=2.0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Pattern Analysis

Analyzes KPI trends and generates recommendations.

**Endpoint:** `GET /patterns/{kpiId}`

**Parameters:**
- `kpiId` (path, required): KPI identifier

**Response:**
```json
{
  "status": "success",
  "data": {
    "kpi_id": 3,
    "kpi_name": "Houses Constructed",
    "current_value": 1680.5,
    "target_value": 2000.0,
    "achievement_rate": 84,
    "trend": "improving",
    "trend_rate": "2.45%",
    "recommendations": [
      {
        "severity": "LOW",
        "message": "KPI shows positive momentum",
        "action": "Maintain current strategy"
      },
      {
        "severity": "HIGH",
        "message": "KPI is still 16% below target",
        "action": "Increase resource allocation"
      }
    ],
    "datapoints": 45
  },
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Patterns analyzed successfully
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/ml-analytics/patterns/3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Scheme Comparison

Compares multiple schemes using ML-based health scoring.

**Endpoint:** `POST /compare-schemes`

**Request Body:**
```json
{
  "scheme_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "scheme_id": 1,
      "kpi_count": 12,
      "average_performance": 85,
      "status_distribution": {
        "on_track": 8,
        "at_risk": 3,
        "critical": 1
      },
      "health_score": 78
    },
    {
      "scheme_id": 2,
      "kpi_count": 15,
      "average_performance": 92,
      "status_distribution": {
        "on_track": 13,
        "at_risk": 2,
        "critical": 0
      },
      "health_score": 89
    }
  ],
  "count": 2,
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

**Response Notes:**
- Schemes are returned sorted by `health_score` (highest first)
- Health score = (on_track × 1 + at_risk × 0.5) / total_kpis × 100

**Status Codes:**
- `200 OK` - Comparison successful
- `400 Bad Request` - Invalid scheme_ids
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X POST "http://localhost:5001/api/v1/ml-analytics/compare-schemes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheme_ids": [1, 2, 3]}'
```

---

### 4. Risk KPI Identification

Identifies KPIs that need immediate attention based on risk scoring.

**Endpoint:** `GET /risk-kpis/{schemeId}`

**Parameters:**
- `schemeId` (path, required): Scheme identifier
- `limit` (query, optional): Number of results (default: 5, max: 20)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "kpi_id": 5,
      "kpi_name": "Beneficiary Verification",
      "risk_score": 8.5,
      "status_distribution": {
        "on_track": 2,
        "at_risk": 5,
        "critical": 3
      },
      "critical_count": 3
    },
    {
      "kpi_id": 7,
      "kpi_name": "Fund Utilization",
      "risk_score": 6.2,
      "status_distribution": {
        "on_track": 4,
        "at_risk": 3,
        "critical": 2
      },
      "critical_count": 2
    }
  ],
  "count": 2,
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

**Risk Score Calculation:**
```
risk_score = (critical_count × 3) + (at_risk_count × 1) + (on_track_count × -0.5)
```

**Status Codes:**
- `200 OK` - Risk analysis successful
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/ml-analytics/risk-kpis/1?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Dashboard Insights (Aggregated)

Get comprehensive dashboard insights combining risk analysis and performance summary.

**Endpoint:** `GET /dashboard/{schemeId}`

**Parameters:**
- `schemeId` (path, required): Scheme identifier

**Response:**
```json
{
  "status": "success",
  "data": {
    "risk_analysis": [
      {
        "kpi_id": 5,
        "kpi_name": "Beneficiary Verification",
        "risk_score": 8.5,
        "status_distribution": {
          "on_track": 2,
          "at_risk": 5,
          "critical": 3
        },
        "critical_count": 3
      }
    ],
    "performance_summary": {
      "scheme_id": 1,
      "kpi_count": 12,
      "average_performance": 85,
      "status_distribution": {
        "on_track": 8,
        "at_risk": 3,
        "critical": 1
      },
      "health_score": 78
    },
    "generated_at": "2026-08-09T10:30:00.000Z"
  },
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Dashboard data retrieved successfully
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/ml-analytics/dashboard/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

### 400 Bad Request
```json
{
  "status": "error",
  "message": "scheme_ids array required",
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Database query failed",
  "timestamp": "2026-08-09T10:30:00.000Z"
}
```

---

## Data Structures

### KPI Value Object
```json
{
  "kpi_id": 3,
  "kpi_name": "Houses Constructed",
  "value": 1680.5,
  "target_value": 2000.0,
  "status": "on_track",
  "date": "2026-08-01T00:00:00.000Z"
}
```

### Anomaly Object
```json
{
  "date": "2026-08-01T00:00:00.000Z",
  "value": 150.5,
  "zscore": 3.2,
  "isAnomaly": true,
  "severity": "HIGH" // HIGH | MEDIUM
}
```

### Recommendation Object
```json
{
  "severity": "HIGH", // CRITICAL | HIGH | LOW
  "message": "KPI is underperforming (84% vs 100%)",
  "action": "Increase resource allocation"
}
```

### Health Score Components
```json
{
  "on_track": 8,        // KPIs performing well
  "at_risk": 3,         // KPIs below target
  "critical": 1         // KPIs significantly below target
}
```

---

## Rate Limits

| Environment | Limit | Window |
|-------------|-------|--------|
| Development | 10,000 requests | 15 minutes |
| Production | 100 requests | 15 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628511000
```

---

## Authentication

All endpoints require JWT token in Authorization header.

**Get Token:**
```bash
curl -X POST "http://localhost:5001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

**Usage:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:5001/api/v1/ml-analytics/dashboard/1
```

---

## Integration Examples

### React Hook
```javascript
import { api } from '@/api/axios';

export function useMlAnalytics(schemeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/ml-analytics/dashboard/${schemeId}`);
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch ML analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schemeId]);

  return { data, loading };
}
```

### JavaScript (Browser)
```javascript
async function getMlInsights(schemeId, token) {
  const response = await fetch(
    `http://localhost:5001/api/v1/ml-analytics/dashboard/${schemeId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
}
```

### Python (Backend)
```python
import requests

def get_scheme_risks(scheme_id, token):
    headers = {'Authorization': f'Bearer {token}'}
    url = f'http://localhost:5001/api/v1/ml-analytics/risk-kpis/{scheme_id}'
    response = requests.get(url, headers=headers)
    return response.json()['data']
```

---

## Performance Tips

1. **Batch Requests**
   - Use `/compare-schemes` instead of multiple `/dashboard/{schemeId}` calls

2. **Caching**
   - ML Analytics results cached client-side for 5 minutes
   - Use `Cache-Control: max-age=300` headers

3. **Query Optimization**
   - Limit `/risk-kpis` results to necessary count
   - Use `threshold` parameter to filter anomalies

4. **Data Volume**
   - Anomaly detection uses last 90 days (limited for performance)
   - Pattern analysis uses last 60 days
   - Risk calculation uses last 10 values per KPI

---

## Webhook Support (Planned)

**Future Enhancement:** Real-time webhook notifications when:
- Critical KPI detected
- Anomaly threshold exceeded
- Health score drops below threshold

---

## Changelog

### v1.0 (August 9, 2026)
- ✅ Anomaly detection API
- ✅ Pattern analysis API
- ✅ Scheme comparison API
- ✅ Risk KPI identification API
- ✅ Dashboard insights aggregation API
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Error handling with unique IDs

### v1.1 (Planned)
- Webhook notifications
- Advanced filtering options
- Batch anomaly detection
- Custom threshold presets
- Export analysis as PDF

---

## Support

For API issues or feature requests:
1. Check error response message and timestamp
2. Review logs on backend: `docker logs backend`
3. Contact: hs8502097870@gmail.com

---

**API Version:** 1.0  
**Last Updated:** August 9, 2026  
**Status:** ✅ PRODUCTION READY
