#!/bin/bash

# Government Schemes Analytics - Production Deployment Script
# Usage: ./deploy.sh <VERCEL_TOKEN>

set -e

VERCEL_TOKEN="${1:-}"
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Usage: ./deploy.sh <VERCEL_TOKEN>"
  echo ""
  echo "Get tokens from:"
  echo "  Vercel: https://vercel.com/account/tokens"
  exit 1
fi

echo "🚀 Starting deployment process..."
echo ""

# ============================================
# Step 1: Validate Backend Build
# ============================================
echo "📦 Step 1: Validating Backend Build"
echo "======================================"

cd backend
echo "📥 Installing backend dependencies..."
npm ci
npm run build

cd ..

echo "✅ Backend ready for deployment"
echo ""

# ============================================
# Step 2: Deploy Frontend to Vercel
# ============================================
echo "🎨 Step 2: Deploying Frontend to Vercel"
echo "========================================="

cd frontend

# Build frontend
echo "🔨 Building frontend..."
npm ci
npm run build

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
VERCEL_TOKEN="$VERCEL_TOKEN" \
npx vercel deploy \
  --prod \
  --yes \
  --env VITE_API_URL="https://college-final-project-backend.onrender.com/api/v1"

FRONTEND_URL=$(VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel list --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "https://college-final-project.vercel.app")

echo "✅ Frontend deployed to Vercel"
echo "   URL: $FRONTEND_URL"
echo ""

cd ..

# ============================================
# Step 3: Configure Render Backend (manual)
# ============================================
echo "⚙️  Step 3: Backend Deployment Instructions"
echo "========================================="
echo ""
echo "Manual Setup Required for Render:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'Create New' > 'Web Service'"
echo "3. Connect GitHub: chetanyasharma2003/college_final_project"
echo "4. Service name: college-final-project-backend"
echo "5. Runtime: Node"
echo "6. Build command: cd backend && npm ci && npm run build"
echo "7. Start command: cd backend && npm start"
echo "8. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=<postgres-connection-string>"
echo "   - JWT_SECRET=<generate a unique random secret>"
echo "   - JWT_REFRESH_SECRET=<generate a different random secret>"
echo "   - CORS_ORIGIN=https://college-final-project.vercel.app"
echo ""

# ============================================
# Final Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend (Vercel):"
echo "  URL: $FRONTEND_URL"
echo "  Status: ✅ Deployed"
echo ""
echo "Backend (Render):"
echo "  URL: https://college-final-project-backend.onrender.com/api/v1"
echo "  Status: ⏳ Manual setup required"
echo ""
echo "📝 Next Steps:"
echo "1. Complete Render backend setup (see instructions above)"
echo "2. Verify database migrations ran on Render"
echo "3. Test login at $FRONTEND_URL"
echo "4. Monitor logs: vercel logs && render logs"
echo ""
echo "🎉 Deployment in progress!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
