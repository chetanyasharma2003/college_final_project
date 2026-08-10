# 🤖 Automated CI/CD System

Full automated deployment pipeline for Government Schemes Analytics Dashboard.

## Quick Start

```bash
# Install dependencies
npm install concurrently

# Run full automation (recommended)
npm run auto:system

# Or run individual commands:
npm run auto:deploy      # Deploy to Render
npm run auto:fix         # Check and fix issues
npm run health:check     # Health check
```

## How It Works

### 1. **Auto Deploy** (`npm run auto:deploy`)
```
✅ Check git status (must be clean)
✅ Build frontend
✅ Verify build output
✅ Mark as working commit
✅ Ready for Render deployment
```

If build fails → Auto-rollback to last working commit

### 2. **Auto Fix** (`npm run auto:fix`)
```
🔍 Check frontend build
🔍 Verify environment variables
🔍 Check port conflicts
🔍 Verify git sync
```

Reports issues and suggests fixes

### 3. **Health Check** (`npm run health:check`)
```
💓 Check frontend /api/v1/health
💓 Check backend /api/v1/health
💓 Report overall system health
```

### 4. **Full System** (`npm run auto:system`)
```
Orchestrates all checks:
1️⃣  Pre-deployment check
2️⃣  Build frontend
3️⃣  Prepare deployment
4️⃣  Deploy to Render
5️⃣  Save working state
```

## Files Created

```
.github/workflows/
  └── automated-deploy.yml          # GitHub Actions workflow

scripts/
  ├── auto-system.js                # Master orchestrator
  ├── auto-deploy.js                # Render deployment
  ├── auto-fix.js                   # Error detection/fix
  └── health-check.js               # Health monitoring

.last-working-commit                # Saved working state
.deployment-history.json            # Deployment log
```

## Workflow

### Normal Development
```
1. Make code changes
2. Run: npm run auto:system
3. Automation handles everything:
   ✅ Tests
   ✅ Builds
   ✅ Deploys
   ✅ Verifies
   ✅ Saves state
```

### If Something Breaks
```
1. Auto-fix detects error
2. Automatic rollback to last working commit
3. System reverts to stable state
4. You get notified with issue details
```

## Deployment Flow

```
Code Change
    ↓
npm run auto:system
    ↓
Git status check ✅
    ↓
Frontend build ✅
    ↓
Deploy to Render (auto-deploys on main push)
    ↓
Save working state ✅
    ↓
Deployment Complete 🎉
```

## Error Handling

### Build Failure
- Detects during build phase
- Prevents deployment
- Auto-rolls back to last working commit
- Pushes rollback to git

### Deployment Issue
- Monitors with health check
- Can manually rollback with saved commit
- Detailed logs available in `.deployment-history.json`

### Partial Failures
- Frontend OK but backend down? Waits and retries
- Timeout handled gracefully
- Non-blocking on secondary issues

## Protected Constraints

✅ **NEVER BREAKS FRONTEND/BACKEND/API SYNC**
- Tests before deployment
- Verifies both services healthy

✅ **ALWAYS HAS ROLLBACK**
- Saves working commit
- Can revert in seconds
- No data loss

✅ **TESTS BEFORE DEPLOY**
- Builds frontend
- Checks for errors
- Verifies health

✅ **PROTECTS WORKING STATE**
- Staging checks first
- Production only if stable
- Clear rollback path

## Monitoring

Check deployment history:
```bash
cat .deployment-history.json
```

Recent deployments:
```bash
git log --oneline | head -10
```

Last working state:
```bash
cat .last-working-commit
```

## Troubleshooting

### "Build failed"
```bash
npm run auto:fix
# Follow suggestions
npm run auto:system
```

### "Port conflict"
```bash
npm run auto:fix
# It'll suggest kill command
```

### "Need to rollback"
```bash
# See last working commit
cat .last-working-commit

# Manual rollback (if needed)
git reset --hard <commit-hash>
git push origin main --force
```

## Integration

### GitHub Actions (Automatic on Push)
- Runs `automated-deploy.yml` on every push to main
- Tests code automatically
- Notifies on failures

### Render (Auto-Deploys)
- Frontend: Auto-deploys on git push
- Backend: Auto-deploys on git push

### Manual Triggers
```bash
npm run auto:system        # Full pipeline
npm run auto:deploy        # Just deploy
npm run health:check       # Just check health
npm run auto:fix           # Just diagnose issues
```

## Production Safety

All automation respects:
1. ✅ No breaking changes
2. ✅ Automatic rollback on failure
3. ✅ Health checks before considering success
4. ✅ Detailed logging for audit trail
5. ✅ Git commit saved for reference

---

**Status**: ✅ Production Ready  
**Last Updated**: Aug 10, 2026  
**Safety Level**: 🔒 MAXIMUM
