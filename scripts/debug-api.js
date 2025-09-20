#!/usr/bin/env node

/**
 * Script de debug para verificar el estado de la API y configuración
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1';

console.log('🔍 Debugging API Configuration...\n');

// Helper function to make requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vegan-Guide-Debug/1.0'
      }
    };

    client.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    }).on('error', (err) => {
      reject(err);
    }).on('timeout', () => {
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(name, endpoint) {
  console.log(`Testing ${name}...`);
  try {
    const result = await makeRequest(`${API_BASE_URL}${endpoint}`);
    console.log(`✅ ${name}: Status ${result.status}`);
    
    if (result.data && typeof result.data === 'object') {
      console.log(`   - Success: ${result.data.success}`);
      if (result.data.data && Array.isArray(result.data.data)) {
        console.log(`   - Items: ${result.data.data.length}`);
      }
    }
    
    // Check for CORS headers
    const corsHeaders = ['access-control-allow-origin', 'access-control-allow-credentials'];
    corsHeaders.forEach(header => {
      if (result.headers[header]) {
        console.log(`   - CORS ${header}: ${result.headers[header]}`);
      }
    });
    
    console.log('');
    return true;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}\n`);
    return false;
  }
}

async function runDiagnostics() {
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  
  // Test core endpoints
  const endpoints = [
    ['Recipes', '/recipes?page=1&limit=3'],
    ['Restaurants', '/restaurants?page=1&limit=3'],
    ['Doctors', '/doctors?page=1&limit=3'],
    ['Markets', '/markets?page=1&limit=3'],
    ['Businesses', '/businesses?page=1&limit=3'],
    ['Health Check', '/health'], // If available
  ];
  
  let successCount = 0;
  for (const [name, endpoint] of endpoints) {
    const success = await testEndpoint(name, endpoint);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Summary: ${successCount}/${endpoints.length} endpoints working`);
  
  if (successCount === endpoints.length) {
    console.log('🎉 All endpoints are healthy!');
    console.log('\n💡 If you\'re still seeing errors:');
    console.log('   1. Check browser developer tools for CORS issues');
    console.log('   2. Verify that NEXT_PUBLIC_API_URL is set correctly');
    console.log('   3. Clear browser cache and hard refresh');
  } else {
    console.log('⚠️  Some endpoints are failing. Check your backend deployment.');
  }
}

runDiagnostics().catch(console.error);