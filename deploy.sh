#!/bin/bash

# Government Schemes Analytics - Production Deployment Script
# Usage: ./deploy.sh <VERCEL_TOKEN> <RENDER_API_KEY>

set -e

VERCEL_TOKEN="${1:-}"
RENDER_API_KEY="${2:-}"

if [ -z "$VERCEL_TOKEN" ] || [ -z "$RENDER_API_KEY" ]; then
  echo "❌ Usage: ./deploy.sh <VERCEL_TOKEN> <RENDER_API_KEY>"
  echo ""
  echo "Get tokens from:"
  echo "  Vercel: https://vercel.com/account/tokens"
  echo "  Render: https://dashboard.render.com/account/api-keys"
  exit 1
fi

echo "🚀 Starting deployment process..."
echo ""

# ============================================
# Step 1: Deploy Backend to Render
# ============================================
echo "📦 Step 1: Preparing Backend Deployment"
echo "======================================"

cd backend

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install --production

# Create .env for Render
echo "Creating .env for Render production..."
cat > .env.render << 'ENVFILE'
NODE_ENV=production
PORT=5001
HOST=0.0.0.0
JWT_SECRET=MyJWTSecretABC12345
JWT_REFRESH_SECRET=MyRefreshSecretXYZ789
CORS_ORIGIN=https://college-final-project.vercel.app,http://localhost:5173
ENVFILE

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
# Step 3: Create Render Service (Manual via API)
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
echo "6. Build command: cd backend && npm install"
echo "7. Start command: cd backend && npm start"
echo "8. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=<postgres-connection-string>"
echo "   - REDIS_URL=<redis-connection-string>"
echo "   - JWT_SECRET=MyJWTSecretABC12345"
echo "   - JWT_REFRESH_SECRET=MyRefreshSecretXYZ789"
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
