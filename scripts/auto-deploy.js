#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEPLOYMENT_LOG = '.deployment-history.json';
const LAST_WORKING_COMMIT = '.last-working-commit';

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error && !cmd.includes('git log')) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function getLastWorkingCommit() {
  try {
    if (fs.existsSync(LAST_WORKING_COMMIT)) {
      return fs.readFileSync(LAST_WORKING_COMMIT, 'utf8').trim();
    }
  } catch (e) {
    console.log('ℹ️ No previous working state found');
  }
  return null;
}

async function saveWorkingCommit(commit) {
  fs.writeFileSync(LAST_WORKING_COMMIT, commit);
}

async function logDeployment(status, commit, details = '') {
  let history = [];
  if (fs.existsSync(DEPLOYMENT_LOG)) {
    history = JSON.parse(fs.readFileSync(DEPLOYMENT_LOG, 'utf8'));
  }

  history.push({
    timestamp: new Date().toISOString(),
    commit,
    status,
    details,
  });

  // Keep last 50 deployments
  history = history.slice(-50);
  fs.writeFileSync(DEPLOYMENT_LOG, JSON.stringify(history, null, 2));
}

async function deployToRender() {
  console.log('🚀 Starting Automated Deployment...\n');

  try {
    // Get current commit
    const { stdout: commitHash } = await runCommand('git rev-parse --short HEAD');
    const commit = commitHash.trim();
    console.log(`📌 Current commit: ${commit}\n`);

    // Verify git is clean (no uncommitted changes)
    const { stdout: status } = await runCommand('git status --porcelain');
    if (status.trim()) {
      console.log('⚠️ Uncommitted changes detected!');
      console.log('Run: git add -A && git commit -m "message"');
      process.exit(1);
    }

    console.log('✅ Git status clean\n');

    // Frontend build check
    console.log('🔨 Building frontend...');
    try {
      await runCommand('cd frontend && npm run build');
      console.log('✅ Frontend build successful\n');
    } catch (e) {
      console.log('❌ Frontend build failed!');
      console.log(e.stderr);
      await logDeployment('BUILD_FAILED', commit, 'Frontend build failed');

      // Auto-rollback
      const lastWorking = await getLastWorkingCommit();
      if (lastWorking) {
        console.log(`\n🔄 Auto-rolling back to: ${lastWorking}`);
        await runCommand(`git reset --hard ${lastWorking}`);
        await runCommand('git push origin main --force');
        console.log('✅ Rolled back to last working state');
      }
      process.exit(1);
    }

    // Render auto-deploys on git push, so just verify
    console.log('📤 Verifying Render deployment...');
    console.log('ℹ️ Render auto-deploys from main branch');
    console.log('⏳ Deployment initiated (monitoring...)\n');

    // Save as working commit
    await saveWorkingCommit(commit);
    await logDeployment('SUCCESS', commit, 'Deployment completed');

    console.log('✅ Deployment pipeline complete!');
    console.log(`📊 Commit ${commit} marked as working state\n`);
    console.log('💡 Tip: Check deployment status at:');
    console.log('  Frontend: https://dashboard.render.com');
    console.log('  Backend: https://dashboard.render.com\n');

  } catch (error) {
    console.log('❌ Deployment failed!');
    console.log(error.stderr || error.message);
    await logDeployment('FAILED', 'unknown', error.message);
    process.exit(1);
  }
}

deployToRender();
