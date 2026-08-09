# ⚡ Quick Start Guide

## 5-Minute Setup

### 1. Start Docker
```bash
cd college_final_project
docker-compose up -d
```

### 2. Wait for Services
```bash
docker-compose ps
```

All services should show "healthy" or "up" status (wait ~20 seconds for health checks).

### 3. Open Browser
```
http://localhost:5173/login
```

### 4. Login
```
Email: admin@govschemes.in
Password: testpass
```

### 5. Done! ✅
You're now logged into the Government Schemes Analytics Dashboard.

---

## Common Commands

### View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs backend -f      # Just backend
docker-compose logs postgres -f     # Just database
```

### Restart Services
```bash
docker-compose restart              # Restart everything
docker-compose restart backend      # Restart just backend
```

### Stop Everything
```bash
docker-compose down
```

### Full Reset (WARNING: Deletes database)
```bash
docker-compose down -v
docker-compose up -d
```

---

## Ports

| Service  | Port | URL |
|----------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend  | 5001 | http://localhost:5001/api/v1 |
| Database | 5432 | PostgreSQL |
| Cache    | 6379 | Redis |

---

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:5001 | xargs kill -9
docker-compose up -d
```

### Services Not Starting
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Login Failing
```bash
docker-compose logs backend | grep -i "error\|auth"
```

---

**For detailed info**, see `FINAL_STATUS.md`
