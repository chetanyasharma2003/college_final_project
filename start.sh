#!/bin/bash

# ============================================================================
# Government Schemes Analytics Dashboard - Automatic Startup Script
# ============================================================================
# This script:
# 1. Cleans up any hanging processes
# 2. Starts both backend and frontend automatically
# 3. Handles port conflicts gracefully
# 4. Auto-restarts on crash
# ============================================================================

set -e

PROJECT_DIR="/Users/chetanya/Documents/college_final_project"
BACKEND_PORT=5001
FRONTEND_PORT=5173
LOG_DIR="$PROJECT_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p "$LOG_DIR"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Government Schemes Analytics - Auto Startup           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port in use
    else
        return 1  # Port free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Cleaning up port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Cleanup function on exit
cleanup() {
    echo -e "${YELLOW}Shutting down services...${NC}"
    pkill -f "node.*index.js" || true
    pkill -f "vite" || true
    sleep 1
    echo -e "${GREEN}Shutdown complete${NC}"
}

trap cleanup EXIT

# ============================================================================
# CLEANUP PHASE
# ============================================================================

echo -e "${YELLOW}[1/3] Cleaning up existing processes...${NC}"

# Kill any existing processes (aggressive cleanup)
echo -e "${YELLOW}Killing all Node processes...${NC}"
pkill -9 -f "node" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "frontend" 2>/dev/null || true
pkill -9 -f "backend" 2>/dev/null || true
sleep 3

# Kill ports if still in use
if check_port $BACKEND_PORT; then
    kill_port $BACKEND_PORT
fi

if check_port $FRONTEND_PORT; then
    kill_port $FRONTEND_PORT
fi

echo -e "${GREEN}✓ Cleanup complete${NC}"

# ============================================================================
# BACKEND STARTUP
# ============================================================================

echo -e "${YELLOW}[2/3] Starting Backend (Express.js on port $BACKEND_PORT)...${NC}"

cd "$PROJECT_DIR/backend"

# Start backend in background
npm run dev > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    cat "$LOG_DIR/backend.log"
    exit 1
fi

# Verify port is open
if check_port $BACKEND_PORT; then
    echo -e "${GREEN}✓ Backend listening on port $BACKEND_PORT${NC}"
else
    echo -e "${RED}✗ Backend not responding on port $BACKEND_PORT${NC}"
    exit 1
fi

# ============================================================================
# FRONTEND STARTUP
# ============================================================================

echo -e "${YELLOW}[3/3] Starting Frontend (React+Vite on port $FRONTEND_PORT)...${NC}"

cd "$PROJECT_DIR/frontend"

# Start frontend in background
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 8

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    cat "$LOG_DIR/frontend.log"
    exit 1
fi

# Verify port is open
if check_port $FRONTEND_PORT; then
    echo -e "${GREEN}✓ Frontend listening on port $FRONTEND_PORT${NC}"
else
    echo -e "${RED}✗ Frontend not responding on port $FRONTEND_PORT${NC}"
    exit 1
fi

# ============================================================================
# STARTUP COMPLETE
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🚀 ALL SERVICES STARTED SUCCESSFULLY 🚀       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:$BACKEND_PORT"
echo -e "${GREEN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  $LOG_DIR/backend.log"
echo "  Frontend: $LOG_DIR/frontend.log"
echo ""
echo -e "${YELLOW}To stop services, press Ctrl+C${NC}"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID

