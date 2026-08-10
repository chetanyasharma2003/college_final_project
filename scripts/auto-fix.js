#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function checkAndFixErrors() {
  console.log('🔧 Auto-Fix System Running...\n');

  const issues = [];

  // Check 1: Frontend build issues
  console.log('🔍 Checking frontend build...');
  const { error: buildError } = await runCommand('cd frontend && npm run build 2>&1');
  if (buildError) {
    console.log('⚠️ Frontend build error detected');
    issues.push({
      type: 'BUILD_ERROR',
      fix: 'Clear node_modules and reinstall',
      command: 'cd frontend && rm -rf node_modules package-lock.json && npm install',
    });
  } else {
    console.log('✅ Frontend build OK\n');
  }

  // Check 2: Missing environment variables
  console.log('🔍 Checking environment variables...');
  if (!process.env.VITE_API_URL) {
    console.log('⚠️ VITE_API_URL not set');
    issues.push({
      type: 'ENV_VAR',
      fix: 'Set VITE_API_URL in frontend .env',
      info: 'Should be: https://college-final-project-backend-m86r.onrender.com/api/v1',
    });
  } else {
    console.log('✅ Environment variables OK\n');
  }

  // Check 3: Port conflicts
  console.log('🔍 Checking for port conflicts...');
  const { stdout: ports } = await runCommand('lsof -i :5001 2>/dev/null || echo "OK"');
  if (ports && ports !== 'OK') {
    console.log('⚠️ Port 5001 in use');
    issues.push({
      type: 'PORT_CONFLICT',
      fix: 'Kill process on port 5001',
      command: 'lsof -i :5001 | grep -v PID | awk \'{print $2}\' | xargs kill -9',
    });
  } else {
    console.log('✅ Port 5001 free\n');
  }

  // Check 4: Git sync issues
  console.log('🔍 Checking git sync...');
  const { stdout: status } = await runCommand('git status --porcelain');
  if (status.trim()) {
    console.log('⚠️ Uncommitted changes detected');
    issues.push({
      type: 'UNCOMMITTED',
      fix: 'Stash or commit changes',
      command: 'git stash or git add -A && git commit',
    });
  } else {
    console.log('✅ Git sync OK\n');
  }

  // Report findings
  console.log('\n📊 Auto-Fix Summary:');
  if (issues.length === 0) {
    console.log('✅ No issues detected! System healthy.\n');
    process.exit(0);
  } else {
    console.log(`⚠️ Found ${issues.length} potential issue(s):\n`);
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.type}`);
      console.log(`   Fix: ${issue.fix}`);
      if (issue.command) {
        console.log(`   Run: ${issue.command}`);
      }
      if (issue.info) {
        console.log(`   Info: ${issue.info}`);
      }
      console.log();
    });
    process.exit(1);
  }
}

checkAndFixErrors();
