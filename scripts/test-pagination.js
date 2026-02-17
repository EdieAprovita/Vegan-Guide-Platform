#!/usr/bin/env node

/**
 * Script para probar que la paginación funciona correctamente en los endpoints
 */

const https = require('https');

const API_BASE_URL = 'https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testPagination(endpoint, itemName) {
  console.log(`\n📄 Testing pagination for ${itemName}...`);
  
  try {
    // Get page 1
    const page1 = await makeRequest(`${API_BASE_URL}${endpoint}?page=1&limit=2`);
    console.log(`  Page 1: ${page1.data.length} items`);
    if (page1.data[0]) {
      const firstItem = page1.data[0];
      console.log(`    First item: ${firstItem.title || firstItem.restaurantName || firstItem.doctorName || firstItem.marketName || firstItem.namePlace || 'N/A'}`);
    }
    
    // Get page 2
    const page2 = await makeRequest(`${API_BASE_URL}${endpoint}?page=2&limit=2`);
    console.log(`  Page 2: ${page2.data.length} items`);
    if (page2.data[0]) {
      const firstItem = page2.data[0];
      console.log(`    First item: ${firstItem.title || firstItem.restaurantName || firstItem.doctorName || firstItem.marketName || firstItem.namePlace || 'N/A'}`);
    }
    
    // Verify pages are different
    if (page1.data.length > 0 && page2.data.length > 0) {
      const id1 = page1.data[0]._id;
      const id2 = page2.data[0]._id;
      
      if (id1 === id2) {
        console.log(`  ❌ ISSUE: Page 1 and Page 2 have the same first item!`);
        return false;
      } else {
        console.log(`  ✅ Pages are different (working correctly)`);
        return true;
      }
    } else {
      console.log(`  ⚠️  Not enough data to test pagination`);
      return true;
    }
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Pagination on All Endpoints\n');
  console.log('=' .repeat(50));
  
  const endpoints = [
    ['/recipes', 'Recipes'],
    ['/restaurants', 'Restaurants'],
    ['/doctors', 'Doctors'],
    ['/markets', 'Markets'],
    ['/businesses', 'Businesses'],
  ];
  
  let successCount = 0;
  
  for (const [endpoint, name] of endpoints) {
    const success = await testPagination(endpoint, name);
    if (success) successCount++;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`\n📊 Results: ${successCount}/${endpoints.length} endpoints have working pagination`);
  
  if (successCount === endpoints.length) {
    console.log('🎉 All pagination tests passed!');
  } else {
    console.log('⚠️  Some pagination tests failed. Check the backend implementation.');
  }
}

runTests().catch(console.error);