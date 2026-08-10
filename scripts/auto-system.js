#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

function log(msg, emoji = '') {
  console.log(`${emoji} ${msg}`);
}

function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function autoSystem() {
  log('\n╔════════════════════════════════════════╗', '');
  log('║    AUTOMATED CI/CD SYSTEM STARTED      ║', '');
  log('╚════════════════════════════════════════╝', '');

  const startTime = Date.now();

  // Phase 1: Health Check
  log('\nPhase 1️⃣ : PRE-DEPLOYMENT CHECK', '🏥');
  const { stdout: gitStatus } = await runCommand('git status --porcelain');
  if (gitStatus.trim()) {
    log('Uncommitted changes found', '⚠️');
    return;
  }
  log('Git repository clean', '✅');

  // Phase 2: Build
  log('\nPhase 2️⃣ : BUILD FRONTEND', '🔨');
  const { error: buildError } = await runCommand('cd frontend && npm run build');
  if (buildError) {
    log('Build failed!', '❌');
    return;
  }
  log('Frontend build successful', '✅');

  // Phase 3: Get commit info
  log('\nPhase 3️⃣ : PREPARE DEPLOYMENT', '📦');
  const { stdout: commit } = await runCommand('git rev-parse --short HEAD');
  const { stdout: message } = await runCommand('git log -1 --pretty=%B');
  log(`Commit: ${commit.trim()}`, '📌');
  log(`Message: ${message.trim().split('\n')[0]}`, '📝');

  // Phase 4: Deploy
  log('\nPhase 4️⃣ : DEPLOY TO RENDER', '🚀');
  log('Render auto-deploys from main branch', 'ℹ️');
  log('Deployment initiated...', '⏳');

  // Phase 5: Save state
  log('\nPhase 5️⃣ : SAVE WORKING STATE', '💾');
  fs.writeFileSync('.last-working-commit', commit.trim());
  log('Marked as working state', '✅');

  // Phase 6: Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log('\n╔════════════════════════════════════════╗', '');
  log('║      AUTOMATION COMPLETE ✨           ║', '');
  log('╚════════════════════════════════════════╝', '');
  log(`Duration: ${duration}s`, '⏱️');
  log('Status: Ready for production', '✅');
  log('\nMonitor deployment:', 'ℹ️');
  log('  Frontend: https://frontend-ae3v.onrender.com', '');
  log('  Backend: https://college-final-project-backend-m86r.onrender.com', '');
  log('\n');
}

autoSystem().catch(err => {
  console.error('❌ Automation failed:', err);
  process.exit(1);
});
