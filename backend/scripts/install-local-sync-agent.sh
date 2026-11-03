#!/bin/sh
set -eu

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This installer configures a macOS LaunchAgent." >&2
  exit 1
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
project_root=$(CDPATH= cd -- "$script_dir/../.." && pwd -P)
backend_dir="$project_root/backend"
if [ ! -f "$backend_dir/.env.real-data" ]; then
  echo "Missing backend/.env.real-data; configure the private local import settings first." >&2
  exit 1
fi

npm_bin=$(command -v npm || true)
node_bin=$(command -v node || true)
python_bin=$(command -v python3 || true)
if [ -z "$npm_bin" ] || [ -z "$node_bin" ] || [ -z "$python_bin" ]; then
  echo "npm, node, and python3 must be available in this shell." >&2
  exit 1
fi

launch_agents_dir="$HOME/Library/LaunchAgents"
logs_dir="$HOME/Library/Logs"
agent_path="$launch_agents_dir/com.collegefinalproject.official-data-sync.plist"
mkdir -p "$launch_agents_dir" "$logs_dir"

"$python_bin" - "$agent_path" "$backend_dir" "$npm_bin" "$node_bin" "$logs_dir" "$HOME" <<'PY'
import os
import plistlib
import sys

agent_path, backend_dir, npm_bin, node_bin, logs_dir, home = sys.argv[1:]
label = "com.collegefinalproject.official-data-sync"
search_path = ":".join(dict.fromkeys([
    os.path.dirname(npm_bin),
    os.path.dirname(node_bin),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
]))
agent = {
    "Label": label,
    "ProgramArguments": [npm_bin, "run", "sync:official"],
    "WorkingDirectory": backend_dir,
    "EnvironmentVariables": {"HOME": home, "PATH": search_path},
    "StartInterval": 604800,
    "RunAtLoad": False,
    "Umask": 63,
    "StandardOutPath": os.path.join(logs_dir, "college-final-project-official-sync.log"),
    "StandardErrorPath": os.path.join(logs_dir, "college-final-project-official-sync.log"),
}
with open(agent_path, "wb") as output:
    plistlib.dump(agent, output)
PY

gui_domain="gui/$(id -u)"
launchctl bootout "$gui_domain" "$agent_path" >/dev/null 2>&1 || true
launchctl bootstrap "$gui_domain" "$agent_path"
launchctl print "$gui_domain/com.collegefinalproject.official-data-sync" >/dev/null
echo "Installed weekly official-data import on this Mac. It uses backend/.env.real-data and writes only to the configured Neon database."
