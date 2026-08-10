#!/usr/bin/env node

const https = require('https');
const http = require('http');

const FRONTEND_URL = 'https://frontend-ae3v.onrender.com';
const BACKEND_URL = 'https://college-final-project-backend-m86r.onrender.com';

async function checkHealth(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      console.log(`⏱️  ${name}: Timeout (service starting up)`);
      resolve({ name, status: 'timeout', healthy: false });
    }, 10000);

    protocol.get(url + '/api/v1/health', (res) => {
      clearTimeout(timeout);
      const healthy = res.statusCode === 200;
      const status = res.statusCode;
      console.log(`${healthy ? '✅' : '⚠️'} ${name}: ${status}`);
      resolve({ name, status, healthy });
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.log(`❌ ${name}: ${err.message}`);
      resolve({ name, status: 'error', healthy: false, error: err.message });
    });
  });
}

async function runHealthCheck() {
  console.log('🏥 Starting Health Check...\n');

  const results = await Promise.all([
    checkHealth(FRONTEND_URL, 'Frontend'),
    checkHealth(BACKEND_URL, 'Backend'),
  ]);

  console.log('\n📊 Health Check Summary:');
  const allHealthy = results.every(r => r.healthy);

  results.forEach(r => {
    console.log(`  ${r.name}: ${r.healthy ? '✅ Healthy' : '⚠️ Issues'}`);
  });

  if (allHealthy) {
    console.log('\n✅ All services healthy! Deployment successful.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some services need attention. Check logs.\n');
    process.exit(1);
  }
}

runHealthCheck();
