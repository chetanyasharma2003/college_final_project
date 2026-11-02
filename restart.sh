#!/bin/bash

echo "♻️ Restarting all services..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call stop script
"$SCRIPT_DIR/stop.sh"

sleep 2

# Call start script
"$SCRIPT_DIR/start.sh"
