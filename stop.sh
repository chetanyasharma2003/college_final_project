#!/bin/bash

echo "🛑 Stopping all services..."

# Stop only this application's configured ports.
echo "Cleaning ports 5001 and 5173..."
for port in 5001 5173; do
	for pid in $(lsof -ti:"$port" 2>/dev/null); do
		kill "$pid" 2>/dev/null || true
	done
done

sleep 1
echo "✓ All services stopped"
