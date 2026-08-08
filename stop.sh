#!/bin/bash

echo "🛑 Stopping all services..."

# Kill all node processes
pkill -9 -f "node" 2>/dev/null || true

# Kill vite
pkill -9 -f "vite" 2>/dev/null || true

# Clean ports
echo "Cleaning ports 5001 and 5173..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

sleep 1
echo "✓ All services stopped"
